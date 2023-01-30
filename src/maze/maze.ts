import { compareCoordinates, Coordinates } from '../lib/coordinates'
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

export type Neighbors = Record<Direction, Coordinates>
export interface Maze {
  height: number
  width: number
  entrance: Coordinates
  exit: Coordinates
  getCell: (coordinates: Coordinates) => Cell
  getWallStatus: (coordinates: Coordinates, direction: Direction) => boolean
  isCellVisited: (coordinates: Coordinates) => boolean
  visitCell: (coordinates: Coordinates) => void
  getNeighborCoordinates: (coordinates: Coordinates) => Partial<Neighbors>
  getUnvisitedCells: () => Coordinates[]
  getVisitedNeighbors: (coordinates: Coordinates) => Partial<Neighbors>
  getUnvisitedNeighbors: (coordinates: Coordinates) => Partial<Neighbors>
  removeWall: (coordinates: Coordinates, direction: Direction) => void
  toString: (cursor?: Coordinates) => string
  toJson: () => unknown
}

export type MazeOptions = Pick<Maze, 'height' | 'width' | 'entrance' | 'exit'>

export const createMaze = ({ height, width, entrance, exit }: MazeOptions): Maze => {
  const cells: Cell[][] = Array.from(Array(height), () => Array.from(Array(width), createCell))

  const getCell = ([y, x]: Coordinates): Cell => cells[y][x]
  const getWallStatus = ([y, x]: Coordinates, direction: Direction): boolean => getCell([y, x]).getWall(direction)
  const isCellVisited = ([y, x]: Coordinates): boolean => getCell([y, x]).visited()
  const visitCell = ([y, x]: Coordinates): void => { getCell([y, x]).setVisited(true) }

  const getNeighborCoordinates = ([y, x]: Coordinates): Partial<Neighbors> => {
    const neighbors: Partial<Neighbors> = {}

    if (y > 0) {
      neighbors.up = [(y - 1), x]
    }

    if (y < height - 1) {
      neighbors.down = [(y + 1), x]
    }

    if (x > 0) {
      neighbors.left = [y, (x - 1)]
    }

    if (x < width - 1) {
      neighbors.right = [y, (x + 1)]
    }

    return neighbors
  }

  const getUnvisitedCells = (): Coordinates[] => {
    const unvisitedCells: Coordinates[] = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const coordinates: Coordinates = [y, x]
        if (!isCellVisited(coordinates)) {
          unvisitedCells.push(coordinates)
        }
      }
    }

    return unvisitedCells
  }

  const getVisitedNeighbors = ([y, x]: Coordinates): Partial<Neighbors> => {
    const neighborCoordinates = getNeighborCoordinates([y, x])
    const neighbors: Partial<Neighbors> = {}

    for (const direction of DIRECTIONS) {
      const coordinates = neighborCoordinates[direction]
      if (coordinates !== undefined && isCellVisited(coordinates)) {
        neighbors[direction] = coordinates
      }
    }

    return neighbors
  }

  const getUnvisitedNeighbors = ([y, x]: Coordinates): Partial<Neighbors> => {
    const neighborCoordinates = getNeighborCoordinates([y, x])
    const neighbors: Partial<Neighbors> = {}

    for (const direction of DIRECTIONS) {
      const coordinates = neighborCoordinates[direction]
      if (coordinates !== undefined && !isCellVisited(coordinates)) {
        neighbors[direction] = coordinates
      }
    }

    return neighbors
  }

  const removeWall = ([y, x]: Coordinates, direction: Direction): void => {
    getCell([y, x]).removeWall(direction)

    switch (direction) {
      case 'right':
        if (x + 1 < width) {
          cells[y][x + 1].removeWall('left')
        }
        break
      case 'left':
        if (x - 1 >= 0) {
          cells[y][x - 1].removeWall('right')
        }
        break
      case 'up':
        if ((y - 1) >= 0) {
          cells[y - 1][x].removeWall('down')
        }
        break
      case 'down':
        if ((y + 1) < height) {
          cells[y + 1][x].removeWall('up')
        }
        break
    }
  }

  for (let y = 0; y < height; y++) {
    cells[y] ??= []
    for (let x = 0; x < width; x++) {
      cells[y][x] = createCell()
    }
  }

  const toString = (cursor?: Coordinates): string => {
    let stringRepresentation = ''

    for (let topRow = 0; topRow < width; topRow++) {
      stringRepresentation += getWallStatus([0, topRow], 'up') ? '_ ' : '  '
    }

    stringRepresentation += '\n'

    for (let y = 0; y < height; y++) {
      let rowString = ''
      for (let x = 0; x < width; x++) {
        if (x === 0 && getWallStatus([y, x], 'left')) {
          stringRepresentation += '|'
        }
        rowString += getCell([y, x]).toString(compareCoordinates(cursor ?? [-1, -1], [y, x]))
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
        rows.push(getCell([y, x]).toJson())
      }
      json.cells.push(rows)
    }

    return json
  }

  return {
    height,
    width,
    entrance,
    exit,
    getCell,
    isCellVisited,
    visitCell,
    getNeighborCoordinates,
    getUnvisitedCells,
    getVisitedNeighbors,
    getUnvisitedNeighbors,
    removeWall,
    getWallStatus,
    toString,
    toJson
  }
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

export const randomMaze = (): MazeType => randomEntry<MazeType>([...MAZES])
