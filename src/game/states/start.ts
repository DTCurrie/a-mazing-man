import { Direction, directionOpposites, DIRECTIONS } from '../../lib/direction'
import { randomIndex, randomOuterBound, randomRange } from '../../lib/random'
import { app, stateMachine } from '../../main'
import { randomMaze } from '../../maze/maze'
import { settings } from '../../settings'
import { State } from '../state'
import { createButton } from '../ui/button'
import { createHeading } from '../ui/heading'
import { createScreenContainer } from '../ui/screen-container'
import { createPickGeneratorState } from './pick-generator'

export const createStartState = (): State => {
  const onEnter = (): void => {
    app.innerHTML = ''

    const screen = createScreenContainer()
    screen.element.append(createHeading({ level: '1', content: 'A-Mazing, Man!' }).element)
    screen.element.append(createButton({
      label: 'START!',
      action: () => {
        const height = randomRange(settings.board.min.height, settings.board.max.height)
        const width = randomRange(settings.board.min.width, settings.board.max.width)
        const directions: Direction[] = [...DIRECTIONS]

        const entranceIndex = randomIndex(directions)
        const entranceDirection = directions[entranceIndex]
        const entrance = randomOuterBound(height, width, entranceDirection)

        const exit = randomOuterBound(height, width, directionOpposites[entranceDirection])

        stateMachine.transition(createPickGeneratorState({
          type: randomMaze(),
          options: { height, width, entrance, exit }
        }))
      }
    }).element)

    app.append(screen.element)
  }

  return {
    onEnter
  }
}
