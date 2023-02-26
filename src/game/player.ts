import { Mesh, MeshToonMaterial, SphereGeometry, Vector2, Vector3 } from 'three'
import { Entity } from './entity'

export interface PlayerOptions {
  initialPosition: Vector2
}

export interface Player extends Entity {
  position: () => Vector2
  move: (next: Vector2) => void
}

export const createPlayer = ({ initialPosition = new Vector2() }: PlayerOptions): Player => {
  const geometry = new SphereGeometry(0.375)
  const material = new MeshToonMaterial({ color: 0xebd234 })
  const mesh = new Mesh(geometry, material)
  let position = initialPosition

  const animate = (): void => {
    requestAnimationFrame(animate)
    mesh.position.lerp(new Vector3(position.x, position.y, mesh.position.z), 0.1)
  }

  mesh.castShadow = true
  mesh.position.x = initialPosition.x
  mesh.position.y = initialPosition.y
  animate()

  return {
    mesh: () => mesh,
    position: () => position,
    move: (next) => (position = next)
  }
}
