import classNames from 'classnames'
import { compareCoordinates, Coordinates } from '../lib/coordinates'
import { Maze, MazeType } from '../maze/maze'
import { Entity } from './entity'

export interface TileOptions {
  coordinates: Coordinates
}

export interface Tile extends TileOptions, Entity<HTMLDivElement> {
  content: string
  x: () => number
  y: () => number
}

export const createTile = ({ coordinates }: TileOptions): Tile => {
  const element = document.createElement('div')

  const x = (): number => coordinates[0]
  const y = (): number => coordinates[1]

  element.dataset.x = `${x()}`
  element.dataset.y = `${y()}`
  element.className = classNames('flex justify-center items-center w-8 h-8 text-2xl text-white')

  return {
    content: '',
    coordinates,
    element,
    x,
    y
  }
}

export interface BoardOptions {
  maze: Maze
  type: MazeType
}

export interface Board extends Entity<HTMLDivElement> {
  listTiles: () => Tile[]
  getTile: (coordinates: Coordinates) => Tile
}

export const createBoard = ({ maze, type }: BoardOptions): Board => {
  const element = document.createElement('div')

  const tiles: Tile[][] = Array.from(
    Array(maze.height), (_, y) => Array.from(
      Array(maze.width), (_, x) => {
        const coordinates: Coordinates = [y, x]
        const tile = createTile({ coordinates })
        const cell = maze.getCell(coordinates)
        const walls = cell.listWalls()

        for (const wall of walls) {
          switch (wall) {
            case 'left':
              tile.element.classList.add(coordinates[1] === 0 ? 'border-l-4' : 'border-l-2', 'border-l-black')
              break
            case 'right':
              tile.element.classList.add(coordinates[1] === maze.width - 1 ? 'border-r-4' : 'border-r-2', 'border-r-black')
              break
            case 'up':
              tile.element.classList.add(coordinates[0] === 0 ? 'border-t-4' : 'border-t-2', 'border-t-black')
              break
            case 'down':
              tile.element.classList.add(coordinates[0] === maze.height - 1 ? 'border-b-4' : 'border-b-2', 'border-b-black')
              break
          }
        }

        if (compareCoordinates(coordinates, maze.entrance)) {
          tile.element.classList.add('bg-lime-500')
        }

        if (compareCoordinates(coordinates, maze.exit)) {
          tile.element.classList.add('bg-yellow-300')
        }

        return tile
      }))

  const listTiles = (): Tile[] => tiles.flatMap(col => col.flatMap((row) => row))
  const getTile = ([y, x]: Coordinates): Tile => tiles[y][x]
  // background: linear-gradient(to top, #3204fdba, #9907facc), url(https://picsum.photos/1280/853/?random=1) no-repeat top center;

  element.className = classNames('grid grid-flow-dense grid-cols-[repeat(auto-fill,_2rem)] gap-0 m-auto transition-opacity duration-250 ease-in-out bg-gradient-to-t', {
    'maze-aldous-broder': type === 'aldousBroder',
    'maze-depth-first': type === 'depthFirst',
    'maze-growing-tree': type === 'growingTree',
    'maze-hunt-and-kill': type === 'huntAndKill'
  })
  element.style.width = `${maze.width * 2}rem`
  element.style.height = `${maze.height * 2}rem`

  for (const tile of listTiles()) {
    element.append(tile.element)
  }

  return {
    element,
    listTiles,
    getTile
  }
}
