import { Direction } from '../lib/direction'

export type Walls = Record<Direction, boolean>
export interface Cell {
  visited: () => boolean
  setVisited: (value: boolean) => void
  removeWall: (direction: Direction) => void
  addWall: (direction: Direction) => void
  listWalls: () => Direction[]
  getWall: (direction: Direction) => boolean
  toString: (cursor?: boolean) => string
  toJson: () => unknown
}

export const createCell = (): Cell => {
  const walls: Walls = {
    left: true,
    right: true,
    up: true,
    down: true
  }

  let _visited = false

  const visited = (): boolean => _visited
  const setVisited = (value: boolean): void => { _visited = value }

  const removeWall = (direction: Direction): void => {
    switch (direction) {
      case 'left': walls.left = false; break
      case 'right': walls.right = false; break
      case 'up': walls.up = false; break
      case 'down': walls.down = false; break
    }
  }

  const addWall = (direction: Direction): void => {
    switch (direction) {
      case 'left': walls.left = true; break
      case 'right': walls.right = true; break
      case 'up': walls.up = true; break
      case 'down': walls.down = true; break
    }
  }

  const listWalls = (): Direction[] =>
    Object.entries(walls)
      .filter(([_, isWall]) => isWall)
      .map(([direction]) => direction as Direction)

  const getWall = (direction: Direction): boolean => {
    switch (direction) {
      case 'left': return walls.left
      case 'right': return walls.right
      case 'up': return walls.up
      case 'down': return walls.down
    }
  }

  const toString = (cursor?: boolean): string => {
    let position = walls.down ? '_' : ' '
    if (cursor ?? false) {
      position = walls.down ? 'Ξ' : '='
    }
    return `${position}${walls.right ? '|' : ' '}`
  }

  const toJson = (): unknown => ({
    left: walls.left,
    right: walls.right,
    up: walls.up,
    down: walls.down,
    visited
  })

  return {
    visited,
    setVisited,
    removeWall,
    addWall,
    listWalls,
    getWall,
    toString,
    toJson
  }
}
