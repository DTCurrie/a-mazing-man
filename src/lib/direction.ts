import { Neighbors } from '../maze/maze'

export const DIRECTIONS = ['left', 'right', 'up', 'down'] as const
type Directions = typeof DIRECTIONS
export type Direction = Directions[number]

export const directionOpposites: Record<Direction, Direction> = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up'
} as const

export const getValidDirections = (neighbors: Partial<Neighbors>): Direction[] => Object.keys(neighbors).map((key) => key as Direction)
