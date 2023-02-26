import { Mesh } from 'three'

export interface Entity {
  mesh: () => Mesh
}
