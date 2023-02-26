import { ColorRepresentation, Group, Vector2, Vector3 } from 'three'
import { Maze, MazeType } from '../maze/maze'
import { Tile, createTile } from './tile'
import { createWall } from './wall'

export interface BoardOptions {
  maze: Maze
  type: MazeType
}

export interface Board {
  tiles: () => Group
  getTile: (coordinates: Vector2) => Tile
}

const getBoardColor = (type: MazeType): ColorRepresentation => {
  switch (type) {
    case 'aldousBroder': return 0x6b7280b0
    case 'depthFirst': return 0x3b82f6b0
    case 'growingTree': return 0x22c55eb0
    case 'huntAndKill': return 0xf59e0bb0
  }
}

const getTileColor = (maze: Maze, type: MazeType, coordinates: Vector2): ColorRepresentation => {
  if (coordinates.equals(maze.entrance())) {
    return 0x84cc16
  }

  if (coordinates.equals(maze.exit())) {
    return 0xfde047
  }

  return getBoardColor(type)
}

export const createBoard = ({ maze, type }: BoardOptions): Board => {
  const tileGroup = new Group()

  const tiles: Tile[][] = Array.from(
    Array(maze.width()), (_, x) => Array.from(
      Array(maze.height()), (_, y) => {
        const coordinates = new Vector2(x, y)
        const tile = createTile({ coordinates, color: getTileColor(maze, type, coordinates) })
        const cell = maze.getCell(coordinates)
        const walls = cell.listWalls()

        if (coordinates.y === maze.height() - 1) {
          const wall = createWall()
          wall.mesh().position.copy(tile.mesh().position).add(new Vector3(0, 0.5, 0))
        } else if (coordinates.y === 0) {
          const wall = createWall()
          wall.mesh().position.copy(tile.mesh().position).add(new Vector3(0, -0.5, 0))
        }

        if (coordinates.x === 0) {
          const wall = createWall()
          wall.rotate()
          wall.mesh().position.copy(tile.mesh().position).add(new Vector3(-0.5, 0, 0))
        } else if (coordinates.x === maze.width() - 1) {
          const wall = createWall()
          wall.rotate()
          wall.mesh().position.copy(tile.mesh().position).add(new Vector3(0.5, 0, 0))
        }

        for (const direction of walls) {
          const wall = createWall()
          switch (direction) {
            case 'left':
              wall.rotate()
              wall.mesh().position.copy(tile.mesh().position).add(new Vector3(-0.5, 0, 0))
              break
            case 'right':
              wall.rotate()
              wall.mesh().position.copy(tile.mesh().position).add(new Vector3(0.5, 0, 0))
              break
            case 'up':
              wall.mesh().position.copy(tile.mesh().position).add(new Vector3(0, 0.5, 0))
              break
            case 'down':
              wall.mesh().position.copy(tile.mesh().position).add(new Vector3(0, -0.5, 0))
              break
          }

          tile.mesh().add(wall.mesh())
        }

        if (coordinates.equals(maze.entrance())) {
          // tile.element.classList.add('bg-lime-500')
        }

        if (coordinates.equals(maze.exit())) {
          // tile.element.classList.add('bg-yellow-300')
        }

        tileGroup.add(tile.mesh())
        tile.mesh().position.x = coordinates.x
        tile.mesh().position.y = coordinates.y
        return tile
      }))

  return {
    tiles: () => tileGroup,
    getTile: ({ x, y }: Vector2): Tile => tiles[x][y]
  }
}
