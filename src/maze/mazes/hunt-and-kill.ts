import { Coordinates } from '../../lib/coordinates'
import { randomEntry, randomRange, shuffleArray } from '../../lib/random'
import { Maze, MazeOptions, createMaze, Neighbors, MazeGenerator } from '../../maze/maze'
import { Direction, getValidDirections } from '../../lib/direction'

export type HuntAndKillOptions = MazeOptions
export type HuntAndKill = MazeGenerator

export const huntAndKill = ({ height, width, entrance, exit }: HuntAndKillOptions): HuntAndKill => {
  const walk = (start: Coordinates, maze: Maze): Maze => {
    const modifiedMaze = { ...maze }
    let current: Coordinates = [...start]
    let unvisited = modifiedMaze.getUnvisitedNeighbors(current)
    let directions = shuffleArray(getValidDirections(unvisited))

    for (let i = 0; i < directions.length;) {
      const direction = randomEntry(directions)
      modifiedMaze.removeWall(current, direction)

      const next = unvisited[direction] as Coordinates
      current = next

      modifiedMaze.visitCell(current)
      unvisited = modifiedMaze.getUnvisitedNeighbors(current)
      directions = shuffleArray(getValidDirections(unvisited))
      i = 0
    }

    return modifiedMaze
  }

  const hunt = (maze: Maze): { coordinates: Coordinates, neighbors: Partial<Neighbors> } | undefined => {
    const unvisited = shuffleArray(maze.getUnvisitedCells())

    for (let i = 0; i < unvisited.length; i++) {
      const coordinates = unvisited[i]
      const neighbors = maze.getVisitedNeighbors(coordinates)

      if (Object.keys(neighbors).length > 0) {
        return {
          coordinates,
          neighbors
        }
      }
    }

    return undefined
  }

  const generate = (): Maze => {
    let maze = createMaze({ height, width, entrance, exit })
    let current: Coordinates = [randomRange(0, height), randomRange(0, width)]

    for (let i = maze.getUnvisitedCells().length; i > 0;) {
      maze = walk(current, maze)
      const first = hunt(maze)

      if (first === undefined) {
        break
      }

      const { coordinates, neighbors } = first
      current = coordinates

      maze.removeWall(current, randomEntry<Direction>(Object.keys(neighbors) as Direction[]))
      maze.visitCell(coordinates)
      maze = walk(current, maze)
      i = maze.getUnvisitedCells().length
    }

    return maze
  }

  return { generate }
}
