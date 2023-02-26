import { Vector2, Vector3 } from 'three'
import { Direction, directionOpposites, DIRECTIONS } from '../../lib/direction'
import { randomIndex, randomOuterBound, randomRange } from '../../lib/random'
import { camera, light, scene, stateMachine } from '../../main'
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
  console.log('maze entrance', maze.entrance())
  const player = createPlayer({ initialPosition: maze.entrance() })
  console.log('player pos', player.position())
  const board = createBoard({ maze, type })
  const cameraOffset = new Vector3(0, 0, 5)
  let frame: number

  const movePlayer = (direction: Direction): Vector2 => {
    const next: Vector2 = player.position()
    switch (direction) {
      case 'left':
        if (next.x - 1 >= 0 && !maze.getWallStatus(next, 'left')) {
          next.add(new Vector2(-1, 0))
        }
        break
      case 'right':
        if (next.x + 1 < maze.width() && !maze.getWallStatus(next, 'right')) {
          next.add(new Vector2(1, 0))
        }
        break
      case 'up':
        if (next.y + 1 < maze.height() && !maze.getWallStatus(next, 'up')) {
          next.add(new Vector2(0, 1))
        }
        break
      case 'down':
        if (next.y - 1 >= 0 && !maze.getWallStatus(next, 'down')) {
          next.add(new Vector2(0, -1))
        }
        break
    }

    return next
  }

  const moveCallbacks: Record<string, () => Vector2> = {
    ArrowLeft: () => movePlayer('left'),
    ArrowRight: () => movePlayer('right'),
    ArrowUp: () => movePlayer('up'),
    ArrowDown: () => movePlayer('down')
  }

  const eventCallback = (event: KeyboardEvent): () => Vector2 => {
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

    player.move(next)

    camera.position.copy(player.mesh().position).add(cameraOffset)
    camera.lookAt(player.mesh().position)

    if (next.equals(maze.exit())) {
      const height = randomRange(settings.board.size.min, settings.board.size.max)
      const width = randomRange(settings.board.size.min, settings.board.size.max)
      const directions: Direction[] = [...DIRECTIONS]

      const entranceIndex = randomIndex(directions)
      const entranceDirection = directions[entranceIndex]
      const entrance = randomOuterBound(height, width, entranceDirection)
      directions.splice(entranceIndex, 1)

      const exit = randomOuterBound(height, width, directionOpposites[entranceDirection])

      stateMachine.transition(createPickGeneratorState({
        type: randomMaze(),
        options: {
          height,
          width,
          entrance,
          exit
        }
      }))
    }
  }

  const cameraFollow = (): void => {
    frame = requestAnimationFrame(cameraFollow)
    camera.position.lerp(new Vector3(player.position().x, player.position().y, cameraOffset.z), 0.1)
    camera.lookAt(player.mesh().position)
    light.lookAt(player.mesh().position)
  }

  const onEnter = (): void => {
    scene.add(player.mesh())
    scene.add(board.tiles())

    light.position.set(maze.width() / 2, maze.height() / 2, 7.5)

    cameraFollow()

    window.addEventListener('keydown', eventHandler)
  }

  const onExit = (): void => {
    scene.remove(player.mesh())
    scene.remove(board.tiles())

    cancelAnimationFrame(frame)

    window.removeEventListener('keydown', eventHandler)
  }

  return {
    onEnter,
    onExit
  }
}
