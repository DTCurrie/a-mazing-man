import { Vector2 } from 'three'
import { randomRange } from '../../lib/random'
import { createMaze, Maze, MazeGenerator, MazeOptions } from '../../maze/maze'
import { getValidDirections } from '../../lib/direction'

export type DepthFirstOptions = MazeOptions
export type DepthFirst = MazeGenerator

export const depthFirst = ({ height, width, entrance, exit }: DepthFirstOptions): DepthFirst => {
  const generate = (): Maze => {
    const maze = createMaze({ height, width, entrance, exit })

    let current = new Vector2(randomRange(0, width), randomRange(0, height))
    const stack: Vector2[] = [current]

    for (let i = 0; i < stack.length;) {
      maze.visitCell(current)

      const unvisited = maze.getUnvisitedNeighbors(current)
      const directions = getValidDirections(unvisited)

      if (directions.length > 0) {
        const direction = directions[randomRange(0, directions.length)]
        const next = unvisited[direction] as Vector2

        stack.push(current)
        maze.removeWall(current, direction)
        current = next
      } else {
        const popped = stack.pop()
        if (popped === undefined) {
          break
        }

        current = popped
      }
    }

    return maze
  }

  return { generate }
}
