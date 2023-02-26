import { Color, OrthographicCamera, PointLight, Scene, WebGLRenderer } from 'three'
import { createStateMachine } from './game/state'
import { createStartState } from './game/states/start'
import './index.css'

export const width = (): number => window.innerWidth
export const height = (): number => window.innerHeight

export const scene = new Scene()
export const camera = new OrthographicCamera(width() / -2, width() / 2, height() / 2, height() / -2, 1, 1000)
export const light = new PointLight(0xffffff, 1)
export const renderer = new WebGLRenderer()
export const stateMachine = createStateMachine(createStartState())

const render = (): void => {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}

scene.background = new Color(0x334155)

scene.add(camera)
camera.zoom = 100
camera.updateProjectionMatrix()

scene.add(light)

renderer.setSize(width(), height())
document.body.appendChild(renderer.domElement)

render()
