import { Coordinates } from '../lib/coordinates'
import { randomEntry, randomRange, shuffleArray } from '../lib/random'
import { Maze, MazeOptions, createMaze, Neighbors } from './maze'
import { Direction } from './direction'

export enum HuntAndKillType {
  Random = 'random',
  Serpentine = 'serpentine'
}

export interface HuntAndKillOptions extends MazeOptions {
  type?: HuntAndKillType
}

export interface HuntAndKill extends HuntAndKillOptions {
  generate: () => Maze
}

export const huntAndKill = ({ width = 10, height = 10, type = HuntAndKillType.Random }: HuntAndKillOptions): HuntAndKill => {
  const getValidDirections = (neighbors: Partial<Neighbors>): Direction[] => Object.keys(neighbors).map((key) => key as Direction)

  const randomizedWalk = (start: Coordinates, maze: Maze): Maze => {
    const modifiedMaze = { ...maze }
    let currentCell: Coordinates = [...start]
    let unvisitedNeighbors = modifiedMaze.getUnvisitedNeighbors(currentCell)
    let validDirections = shuffleArray(getValidDirections(unvisitedNeighbors))

    for (let i = 0; i < validDirections.length;) {
      const direction = randomEntry(validDirections)
      modifiedMaze.removeWall(currentCell, direction)

      const next = unvisitedNeighbors[direction] as Coordinates
      currentCell = next

      modifiedMaze.visitCell(currentCell)
      unvisitedNeighbors = modifiedMaze.getUnvisitedNeighbors(currentCell)
      validDirections = shuffleArray(getValidDirections(unvisitedNeighbors))
      i = 0
    }

    return modifiedMaze
  }

  const serpentineWalk = (start: Coordinates, maze: Maze): Maze => {
    const modifiedMaze = { ...maze }
    let currentCell: Coordinates = [...start]
    let unvisitedNeighbors = modifiedMaze.getUnvisitedNeighbors(currentCell)
    let validDirections = getValidDirections(unvisitedNeighbors)

    for (let i = 0; i < validDirections.length;) {
      const direction: Direction = validDirections[i]
      if (unvisitedNeighbors[direction] === undefined) {
        i++
        continue
      }

      modifiedMaze.removeWall(currentCell, direction)

      const next = unvisitedNeighbors[direction] as Coordinates
      currentCell = next

      modifiedMaze.visitCell(currentCell)
      unvisitedNeighbors = modifiedMaze.getUnvisitedNeighbors(currentCell)

      validDirections = shuffleArray(getValidDirections(unvisitedNeighbors))
    }

    return modifiedMaze
  }

  const randomHunt = (maze: Maze): { coordinates: Coordinates, neighbors: Partial<Neighbors> } | undefined => {
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

  const random = (): Maze => {
    let maze = createMaze({ width, height })
    let currentCoordinates: Coordinates = [randomRange(0, height), randomRange(0, width)]

    for (let i = maze.getUnvisitedCells().length; i > 0;) {
      maze = randomizedWalk(currentCoordinates, maze)
      const first = randomHunt(maze)

      if (first === undefined) {
        break
      }

      const { coordinates, neighbors } = first
      currentCoordinates = coordinates

      maze.removeWall(currentCoordinates, randomEntry<Direction>(Object.keys(neighbors) as Direction[]))
      maze.visitCell(coordinates)
      maze = randomizedWalk(currentCoordinates, maze)
      i = maze.getUnvisitedCells().length
    }

    return maze
  }

  const serpentine = (): Maze => {
    let maze = createMaze({ width, height })
    let currentCoordinates: Coordinates = [0, 0]
    maze = serpentineWalk(currentCoordinates, maze)

    for (let i = 0; i < maze.getUnvisitedCells().length;) {
      const coordinates = maze.getUnvisitedCells()[0]
      const neighbors = maze.getVisitedNeighbors(coordinates)

      currentCoordinates = coordinates

      maze.removeWall(currentCoordinates, randomEntry<Direction>(Object.keys(neighbors) as Direction[]))
      maze.visitCell(coordinates)
      maze = serpentineWalk(currentCoordinates, maze)
    }

    return maze
  }

  const generate = (): Maze => {
    const maze = type === 'random' ? random() : serpentine()

    return maze
  }

  return { type, width, height, generate }
}
