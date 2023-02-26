import { Vector2 } from 'three'
import { randomEntry } from '../lib/random'
import { Cell, createCell } from './cell'
import { Direction, DIRECTIONS } from '../lib/direction'
import { aldousBroder } from './mazes/aldous-broder'
import { depthFirst } from './mazes/depth-first'
import { growingTree } from './mazes/growing-tree'
import { huntAndKill } from './mazes/hunt-and-kill'

export interface MazeGenerator {
  generate: () => Maze
}

export const MAZES = ['aldousBroder', 'depthFirst', 'growingTree', 'huntAndKill'] as const
type Mazes = typeof MAZES

export type MazeType = Mazes[number]
export const mazes: Record<MazeType, (...args: any[]) => MazeGenerator> = {
  aldousBroder,
  depthFirst,
  growingTree,
  huntAndKill
}

export type Neighbors = Record<Direction, Vector2>
export interface Maze {
  height: () => number
  width: () => number
  entrance: () => Vector2
  exit: () => Vector2
  getCell: (coordinates: Vector2) => Cell
  getWallStatus: (coordinates: Vector2, direction: Direction) => boolean
  isCellVisited: (coordinates: Vector2) => boolean
  visitCell: (coordinates: Vector2) => void
  getNeighborCoordinates: (coordinates: Vector2) => Partial<Neighbors>
  getUnvisitedCells: () => Vector2[]
  getVisitedNeighbors: (coordinates: Vector2) => Partial<Neighbors>
  getUnvisitedNeighbors: (coordinates: Vector2) => Partial<Neighbors>
  removeWall: (coordinates: Vector2, direction: Direction) => void
  addWall: (coordinates: Vector2, direction: Direction) => void
  toString: (cursor?: Vector2) => string
  toJson: () => unknown
}

export interface MazeOptions {
  height: number
  width: number
  entrance: Vector2
  exit: Vector2
}

export const randomMaze = (): MazeType => randomEntry<MazeType>([...MAZES])

export const createMaze = ({ height, width, entrance, exit }: MazeOptions): Maze => {
  const cells: Cell[][] = Array.from(Array(width), () => Array.from(Array(height), createCell))

  const getCell = ({ x, y }: Vector2): Cell => cells[x][y]
  const getWallStatus = (coordinates: Vector2, direction: Direction): boolean => getCell(coordinates).getWall(direction)
  const isCellVisited = (coordinates: Vector2): boolean => getCell(coordinates).visited()
  const visitCell = (coordinates: Vector2): void => { getCell(coordinates).setVisited(true) }

  const getNeighborCoordinates = ({ x, y }: Vector2): Partial<Neighbors> => {
    const neighbors: Partial<Neighbors> = {}

    if (y < height - 1) {
      neighbors.up = new Vector2(x, y + 1)
    }

    if (y > 0) {
      neighbors.down = new Vector2(x, y - 1)
    }

    if (x > 0) {
      neighbors.left = new Vector2(x - 1, y)
    }

    if (x < width - 1) {
      neighbors.right = new Vector2(x + 1, y)
    }

    return neighbors
  }

  const getUnvisitedCells = (): Vector2[] => {
    const unvisitedCells: Vector2[] = []

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const coordinates = new Vector2(x, y)
        if (!isCellVisited(coordinates)) {
          unvisitedCells.push(coordinates)
        }
      }
    }

    return unvisitedCells
  }

  const getVisitedNeighbors = (cell: Vector2): Partial<Neighbors> => {
    const neighborCoordinates = getNeighborCoordinates(cell)
    const neighbors: Partial<Neighbors> = {}

    for (const direction of DIRECTIONS) {
      const coordinates = neighborCoordinates[direction]
      if (coordinates !== undefined && isCellVisited(coordinates)) {
        neighbors[direction] = coordinates
      }
    }

    return neighbors
  }

  const getUnvisitedNeighbors = (cell: Vector2): Partial<Neighbors> => {
    const neighborCoordinates = getNeighborCoordinates(cell)
    const neighbors: Partial<Neighbors> = {}

    for (const direction of DIRECTIONS) {
      const coordinates = neighborCoordinates[direction]
      if (coordinates !== undefined && !isCellVisited(coordinates)) {
        neighbors[direction] = coordinates
      }
    }

    return neighbors
  }

  const removeWall = (cell: Vector2, direction: Direction): void => {
    getCell(cell).removeWall(direction)

    switch (direction) {
      case 'right':
        if (cell.x + 1 < width) {
          getCell(cell.add(new Vector2(1, 0))).removeWall('left')
        }
        break
      case 'left':
        if (cell.x - 1 >= 0) {
          getCell(cell.add(new Vector2(-1, 0))).removeWall('right')
        }
        break
      case 'up':
        if (cell.y + 1 < height) {
          getCell(cell.add(new Vector2(0, 1))).removeWall('down')
        }
        break
      case 'down':
        if (cell.y - 1 >= 0) {
          getCell(cell.add(new Vector2(0, -1))).removeWall('up')
        }
        break
    }
  }

  const addWall = (cell: Vector2, direction: Direction): void => {
    getCell(cell).addWall(direction)

    switch (direction) {
      case 'right':
        if (cell.x + 1 < width) {
          getCell(cell.add(new Vector2(1, 0))).addWall('left')
        }
        break
      case 'left':
        if (cell.x - 1 >= 0) {
          getCell(cell.add(new Vector2(-1, 0))).addWall('right')
        }
        break
      case 'up':
        if (cell.y + 1 < height) {
          getCell(cell.add(new Vector2(0, 1))).addWall('down')
        }
        break
      case 'down':
        if (cell.y - 1 >= 0) {
          getCell(cell.add(new Vector2(0, -1))).addWall('up')
        }
        break
    }
  }

  const toString = (cursor?: Vector2): string => {
    let stringRepresentation = ''

    for (let topRow = 0; topRow < width; topRow++) {
      stringRepresentation += getWallStatus(new Vector2(topRow, 0), 'up') ? ' _' : '  '
    }

    stringRepresentation += '\n'

    for (let y = 0; y < height; y++) {
      let rowString = ''
      for (let x = 0; x < width; x++) {
        const coordinates = new Vector2(x, y)
        if (x === 0 && getWallStatus(coordinates, 'left')) {
          stringRepresentation += '|'
        }
        rowString += getCell(coordinates).toString(coordinates.equals(cursor ?? new Vector2(-1, -1)))
      }

      stringRepresentation += y + 1 < height ? rowString + '\n' : rowString
    }

    return stringRepresentation
  }

  const toJson = (): unknown => {
    const json = {
      height,
      width,
      entrance,
      exit,
      cells: [] as unknown[]
    }

    for (let y = 0; y < height; y++) {
      const rows = []
      for (let x = 0; x < width; x++) {
        rows.push(getCell(new Vector2(x, y)).toJson())
      }
      json.cells.push(rows)
    }

    return json
  }

  return {
    height: () => height,
    width: () => width,
    entrance: () => entrance,
    exit: () => exit,
    getCell,
    isCellVisited,
    visitCell,
    getNeighborCoordinates,
    getUnvisitedCells,
    getVisitedNeighbors,
    getUnvisitedNeighbors,
    removeWall,
    addWall,
    getWallStatus,
    toString,
    toJson
  }
}
