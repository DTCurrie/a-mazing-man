export const DIRECTIONS = ['left', 'right', 'up', 'down'] as const
type Directions = typeof DIRECTIONS
export type Direction = Directions[number]

export const opposites: Record<Direction, Direction> = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up'
} as const
