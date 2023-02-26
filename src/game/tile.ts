import { MeshToonMaterial, Mesh, BoxGeometry, ColorRepresentation, Vector2 } from 'three'
import { Entity } from './entity'

export interface TileOptions {
  coordinates: Vector2
  color: ColorRepresentation
}

export interface Tile extends Entity {
  coordinates: () => Vector2
  x: () => number
  y: () => number
}

export const createTile = ({ coordinates, color }: TileOptions): Tile => {
  const geometry = new BoxGeometry(1, 1, 0.1)
  const material = new MeshToonMaterial({ color })
  const mesh = new Mesh(geometry, material)

  return {
    mesh: () => mesh,
    coordinates: () => coordinates,
    x: (): number => coordinates.x,
    y: (): number => coordinates.y
  }
}
