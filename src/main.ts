import { createApp } from './app'
import { createStateMachine } from './game/state'
import { createStartState } from './game/states/start'
import './index.css'

export const app = createApp()
document.body.prepend(app)

export const stateMachine = createStateMachine(createStartState())
