import { Coordinates } from '../../lib/coordinates'
import { randomEntry } from '../../lib/random'
import { createMaze, Maze, MazeGenerator, MazeOptions } from '../maze'
import { getValidDirections } from '../../lib/direction'

export interface GrowingTreeOptions extends MazeOptions {
  backtrackChance?: number
}

export type GrowingTree = MazeGenerator

export const growingTree = ({ height, width, backtrackChance = 0.5, entrance, exit }: GrowingTreeOptions): GrowingTree => {
  const generate = (): Maze => {
    const maze = createMaze({ height, width, entrance, exit })

    let current: Coordinates = randomEntry(maze.getUnvisitedCells())
    const active: Coordinates[] = [current]

    for (let i = 0; i < active.length;) {
      if (Math.random() < backtrackChance) {
        current = active[active.length - 1]
      } else {
        current = randomEntry(active)
      }

      const visited = maze.getUnvisitedNeighbors(current)
      const directions = getValidDirections(visited)

      if (directions.length === 0) {
        const index = active.indexOf(current)
        active.splice(index, 1)
        continue
      }

      const direction = randomEntry(directions)
      const next = visited[direction] as Coordinates

      active.push(next)
      maze.removeWall(current, direction)
      maze.visitCell(next)
    }

    return maze
  }

  return { generate }
}
