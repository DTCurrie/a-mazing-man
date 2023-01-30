import { Coordinates } from '../lib/coordinates'
import { Entity } from './entity'

export interface PlayerOptions {
  sprite: string
  initialPosition: Coordinates
}

export interface Player extends Entity<HTMLDivElement> {
  getSprite: () => string
  getPosition: () => Coordinates
  setPosition: (next: Coordinates) => void
}

export const createPlayer = ({ sprite = 'O', initialPosition = [0, 0] }: PlayerOptions): Player => {
  const element = document.createElement('div')
  let position = initialPosition

  const getSprite = (): string => sprite
  const getPosition = (): Coordinates => position
  const setPosition = (next: Coordinates): void => { position = next }

  element.textContent = sprite

  return { element, getSprite, getPosition, setPosition }
}
