import { Coordinates } from './coordinates'
import { Direction, DIRECTIONS } from './direction'

export const randomIndex = (list: unknown[]): number => Math.floor(Math.random() * list.length)
export const randomEntry = <T = unknown>(list: T[]): T => list[randomIndex(list)]

export const randomRange = (min: number, max: number, step: number = 1): number => {
  const array = Array.from(Array(max), (_, k) => k).slice(min).filter((_, i) => i % step === 0)
  return randomEntry(array)
}

export const randomDirection = (): Direction => randomEntry<Direction>([...DIRECTIONS])

export const randomOuterBound = (height: number, width: number, direction: Direction): Coordinates => {
  switch (direction) {
    case 'left': return [randomRange(0, height), 0]
    case 'right': return [randomRange(0, height), width - 1]
    case 'up': return [0, randomRange(0, width)]
    case 'down': return [height - 1, randomRange(0, width)]
  }
}

export const randomInnerBound = (height: number, width: number): Coordinates => [
  randomRange(Math.floor(height * 0.25), Math.floor(height * 0.75)),
  randomRange(Math.floor(width * 0.25), Math.floor(width * 0.75))
]

export const shuffleArray = <T = unknown>(list: T[]): T[] => {
  const shuffled = [...list]

  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }

  return shuffled
}
