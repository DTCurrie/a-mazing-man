import { Direction, directionOpposites, DIRECTIONS } from '../../lib/direction'
import { randomIndex, randomOuterBound, randomRange } from '../../lib/random'
import { stateMachine } from '../../main'
import { MAZES } from '../../maze/maze'
import { settings } from '../../settings'
import { State } from '../state'
import { createButton } from '../ui/button'
import { createHeading } from '../ui/heading'
import { createScreenContainer } from '../ui/screen-container'
import { createPickGeneratorState } from './pick-generator'

export const createStartState = (): State => {
  const screen = createScreenContainer()

  const onEnter = (): void => {
    screen.element.append(createHeading({ level: '1', content: 'A-Mazing, Man!' }).element)
    screen.element.append(createButton({
      label: 'START!',
      action: () => {
        const height = randomRange(settings.board.size.min, settings.board.size.max)
        const width = randomRange(settings.board.size.min, settings.board.size.max)
        const directions: Direction[] = [...DIRECTIONS]

        const entranceIndex = randomIndex(directions)
        const entranceDirection = directions[entranceIndex]
        const entrance = randomOuterBound(height, width, entranceDirection)

        const exit = randomOuterBound(height, width, directionOpposites[entranceDirection])

        stateMachine.transition(createPickGeneratorState({
          type: MAZES[0],
          // type: randomMaze(),
          options: { height, width, entrance, exit }
        }))
      }
    }).element)

    document.body.append(screen.element)
  }

  const onExit = (): void => {
    screen.element.remove()
  }

  return {
    onEnter,
    onExit
  }
}
