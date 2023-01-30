import { Coordinates, compareCoordinates } from '../../lib/coordinates'
import { Direction, directionOpposites, DIRECTIONS } from '../../lib/direction'
import { randomIndex, randomOuterBound, randomRange } from '../../lib/random'
import { app, stateMachine } from '../../main'
import { Maze, MazeType, randomMaze } from '../../maze/maze'
import { settings } from '../../settings'
import { createBoard } from '../board'
import { createPlayer } from '../player'
import { State } from '../state'
import { createPickGeneratorState } from './pick-generator'

export interface PlayStateOptions {
  maze: Maze
  type: MazeType
}

export const createPlayState = ({ maze, type }: PlayStateOptions): State => {
  const player = createPlayer({ sprite: '0', initialPosition: maze.entrance })
  const board = createBoard({ maze, type })

  const movePlayer = (direction: Direction): Coordinates => {
    let next: Coordinates = [...player.getPosition()]
    switch (direction) {
      case 'left':
        if (next[1] - 1 >= 0 && !maze.getWallStatus(next, 'left')) {
          next = [next[0], next[1] - 1]
        }
        break
      case 'right':
        if (next[1] + 1 < maze.width && !maze.getWallStatus(next, 'right')) {
          next = [next[0], next[1] + 1]
        }
        break
      case 'up':
        if (next[0] - 1 >= 0 && !maze.getWallStatus(next, 'up')) {
          next = [next[0] - 1, next[1]]
        }
        break
      case 'down':

        if (next[0] + 1 < maze.height && !maze.getWallStatus(next, 'down')) {
          next = [next[0] + 1, next[1]]
        }
        break
    }

    return next
  }

  const moveCallbacks: Record<string, () => Coordinates> = {
    ArrowLeft: () => movePlayer('left'),
    ArrowRight: () => movePlayer('right'),
    ArrowUp: () => movePlayer('up'),
    ArrowDown: () => movePlayer('down')
  }

  const eventCallback = (event: KeyboardEvent): () => Coordinates => {
    const callback = moveCallbacks[event.key]
    if (callback !== undefined) {
      event.preventDefault()
    }

    return callback
  }

  const eventHandler = (event: KeyboardEvent): void => {
    const next = eventCallback(event)?.()

    if (next === undefined) {
      return
    }

    if (!compareCoordinates(player.getPosition(), next)) {
      board.getTile(player.getPosition()).element.textContent = ''
      player.setPosition(next)
      board.getTile(next).element.textContent = player.getSprite()
    }

    requestAnimationFrame(() => {
      board.getTile(next).element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      })

      if (compareCoordinates(next, maze.exit)) {
        board.element.classList.add('opacity-0')
        const height = randomRange(settings.board.min.height, settings.board.max.height)
        const width = randomRange(settings.board.min.width, settings.board.max.width)
        const directions: Direction[] = [...DIRECTIONS]

        const entranceIndex = randomIndex(directions)
        const entranceDirection = directions[entranceIndex]
        const entrance = randomOuterBound(height, width, entranceDirection)
        directions.splice(entranceIndex, 1)

        const exit = randomOuterBound(height, width, directionOpposites[entranceDirection])

        setTimeout(() => {
          stateMachine.transition(createPickGeneratorState({
            type: randomMaze(),
            options: {
              height,
              width,
              entrance,
              exit
            }
          }))
        }, 250)
      }
    })
  }

  const onEnter = (): void => {
    board.getTile(player.getPosition()).element.textContent = player.getSprite()

    app.innerHTML = ''
    app.append(board.element)

    window.addEventListener('keydown', eventHandler)

    requestAnimationFrame(() => {
      board.getTile(player.getPosition()).element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      })
    })
  }

  const onExit = (): void => {
    window.removeEventListener('keydown', eventHandler)
  }

  return {
    onEnter,
    onExit
  }
}
