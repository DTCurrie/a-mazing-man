import { Vector2 } from 'three'
import { randomEntry, randomRange, shuffleArray } from '../../lib/random'
import { Maze, MazeOptions, createMaze, Neighbors, MazeGenerator } from '../../maze/maze'
import { Direction, getValidDirections } from '../../lib/direction'

export type HuntAndKillOptions = MazeOptions
export type HuntAndKill = MazeGenerator

export const huntAndKill = ({ height, width, entrance, exit }: HuntAndKillOptions): HuntAndKill => {
  const walk = (start: Vector2, maze: Maze): Maze => {
    const modifiedMaze = { ...maze }
    let current = new Vector2().copy(start)
    let unvisited = modifiedMaze.getUnvisitedNeighbors(current)
    let directions = shuffleArray(getValidDirections(unvisited))

    for (let i = 0; i < directions.length;) {
      const direction = randomEntry(directions)
      modifiedMaze.removeWall(current, direction)

      const next = unvisited[direction] as Vector2
      current = next

      modifiedMaze.visitCell(current)
      unvisited = modifiedMaze.getUnvisitedNeighbors(current)
      directions = shuffleArray(getValidDirections(unvisited))
      i = 0
    }

    return modifiedMaze
  }

  const hunt = (maze: Maze): { coordinates: Vector2, neighbors: Partial<Neighbors> } | undefined => {
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
    let current = new Vector2(randomRange(0, width), randomRange(0, height))

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
