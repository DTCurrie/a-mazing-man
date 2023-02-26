import * as THREE from 'three'
import Inspector from 'three-inspect'
import { camera, renderer, scene } from '../main'

export const createInspector = (): Inspector | undefined => {
  /**
 * This should be a conditional that is compiled away
 * when building for production to ensure tree-shaking.
 */
  if (import.meta.env.DEV) {
    return new Inspector(
      THREE, /* the THREE object used in your project */
      scene,
      camera,
      renderer
    // composer /* optional */
    )
  }

  return undefined
}
