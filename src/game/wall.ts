import { MeshToonMaterial, Mesh, BoxGeometry } from 'three'
import { Entity } from './entity'

export interface Wall extends Entity {
  rotate: () => void
}

export const createWall = (): Wall => {
  const geometry = new BoxGeometry(1.1, 0.1, 1.1)
  const material = new MeshToonMaterial({ color: 0x616161 })
  const mesh = new Mesh(geometry, material)

  mesh.castShadow = true

  return {
    mesh: () => mesh,
    rotate: () => mesh.rotateZ(Math.PI / 2)
  }
}
