import { Coordinates } from '../lib/coordinates'
import { randomEntry, randomRange } from '../lib/random'
import { Cell, createCell } from './cell'
import { Direction, DIRECTIONS, opposites } from './direction'

export type Neighbors = Record<Direction, Coordinates>
export interface Maze {
  width: number
  height: number
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
  pickOuterCell: (direction: Direction) => Coordinates
  toString: (cursor?: Coordinates) => string
  toJson: () => unknown
}

export type MazeOptions = Partial<Pick<Maze, 'width' | 'height'>>

export const createMaze = ({ width = 10, height = 10 }: MazeOptions): Maze => {
  const cells: Cell[][] = []

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

  const pickOuterCell = (direction: Direction): Coordinates => {
    switch (direction) {
      case 'left': return [randomRange(0, height), 0]
      case 'right': return [randomRange(0, height), width - 1]
      case 'up': return [0, randomRange(0, width)]
      case 'down': return [height - 1, randomRange(0, width)]
    }
  }

  const toString = (cursor?: Coordinates): string => {
    let stringRepresentation = ''

    for (let topRow = 0; topRow < width; topRow++) {
      // Adds a top wall to the top cells
      stringRepresentation += getWallStatus([0, topRow], 'up') ? '_ ' : '  '
    }

    stringRepresentation += '\n'

    for (let y = 0; y < height; y++) {
      let rowString = ''
      for (let x = 0; x < width; x++) {
        if (x === 0 && getWallStatus([y, x], 'left')) {
          // Adds a wall to the left most cell
          stringRepresentation += '|'
        }
        rowString += getCell([y, x]).toString(cursor?.[0] === y && cursor[1] === x)
      }

      // Add a new line if the last cell of the row
      stringRepresentation += y + 1 < height ? rowString + '\n' : rowString
    }

    return stringRepresentation
  }

  const toJson = (): unknown => {
    const json = {
      width,
      height,
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

  const entranceDirection = randomEntry<Direction>([...DIRECTIONS])
  const entrance = pickOuterCell(entranceDirection)
  const exit = pickOuterCell(opposites[entranceDirection])

  getCell(entrance).removeWall(entranceDirection)
  getCell(exit).removeWall(opposites[entranceDirection])

  return {
    width,
    height,
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
    pickOuterCell,
    toString,
    toJson
  }
}
