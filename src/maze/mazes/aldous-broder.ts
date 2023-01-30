import { Coordinates } from '../../lib/coordinates'
import { randomEntry } from '../../lib/random'
import { createMaze, Maze, MazeGenerator, MazeOptions } from '../../maze/maze'
import { getValidDirections } from '../../lib/direction'

export type AldousBroderOptions = MazeOptions
export type AldousBroder = MazeGenerator

export const aldousBroder = ({ height, width, entrance, exit }: AldousBroderOptions): AldousBroder => {
  const generate = (): Maze => {
    const maze = createMaze({ height, width, entrance, exit })

    let current: Coordinates = randomEntry(maze.getUnvisitedCells())

    for (let i = 1; i < height * width;) {
      maze.visitCell(current)

      const unvisited = maze.getUnvisitedNeighbors(current)
      const directions = getValidDirections(unvisited)

      if (directions.length === 0) {
        const visited = maze.getVisitedNeighbors(current)
        const next = visited[randomEntry(getValidDirections(visited))] as Coordinates
        current = next
        continue
      }

      const direction = randomEntry(directions)
      const next = unvisited[direction] as Coordinates

      maze.removeWall(current, direction)
      maze.visitCell(next)
      i++
      current = next
    }

    return maze
  }

  return { generate }
}
