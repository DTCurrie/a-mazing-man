import classNames from 'classnames'
import { compareCoordinates, Coordinates } from './lib/coordinates'
import { huntAndKill, HuntAndKillType } from './mazes/hunt-and-kill'

export interface TileOptions {
  coordinates: Coordinates
}

export interface Tile extends TileOptions {
  content: string
  element: HTMLDivElement
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
  onWin: () => void
}

export interface Board {
  element: HTMLDivElement
  tiles: Tile[][]
  listTiles: () => Tile[]
  getTile: (coordinates: Coordinates) => Tile
}

export const createBoard = ({ onWin }: BoardOptions): Board => {
  const element = document.createElement('div')
  const maze = huntAndKill({ type: HuntAndKillType.Serpentine, width: 100, height: 100 }).generate()
  const tiles: Tile[][] = Array.from(
    Array(maze.height),
    (_, y) => Array.from(
      Array(maze.width),
      (_, x) => {
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
  const getTile = ([x, y]: Coordinates): Tile => tiles[x][y]

  element.className = classNames('grid grid-flow-dense grid-cols-[repeat(auto-fill,_2rem)] gap-0 bg-[#45a23e]')
  element.style.width = `${maze.width * 2}rem`
  element.style.height = `${maze.height * 2}rem`

  for (const tile of listTiles()) {
    element.append(tile.element)
  }

  const player = 'O'
  let playerPosition = maze.entrance
  getTile(playerPosition).element.textContent = player
  getTile(playerPosition).element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center'
  })

  window.addEventListener('keydown', (event) => {
    event.preventDefault()
    console.log('event', event)
    const callback = ({
      ArrowLeft: () => {
        const next: Coordinates = [playerPosition[0], playerPosition[1] - 1]
        console.log('ArrowLeft')
        if (playerPosition[1] - 1 >= 0 && !maze.getWallStatus(playerPosition, 'left')) {
          getTile(playerPosition).element.textContent = ''
          playerPosition = next
          getTile(playerPosition).element.textContent = player
        }
      },
      ArrowRight: () => {
        const next: Coordinates = [playerPosition[0], playerPosition[1] + 1]
        console.log('ArrowRight')
        if (playerPosition[1] + 1 < maze.width && !maze.getWallStatus(playerPosition, 'right')) {
          getTile(playerPosition).element.textContent = ''
          playerPosition = next
          getTile(playerPosition).element.textContent = player
        }
      },
      ArrowUp: () => {
        const next: Coordinates = [playerPosition[0] - 1, playerPosition[1]]
        console.log('ArrowUp')
        if (playerPosition[0] - 1 >= 0 && !maze.getWallStatus(playerPosition, 'up')) {
          getTile(playerPosition).element.textContent = ''
          playerPosition = next
          getTile(playerPosition).element.textContent = player
        }
      },
      ArrowDown: () => {
        const next: Coordinates = [playerPosition[0] + 1, playerPosition[1]]
        console.log('ArrowDown')
        if (playerPosition[0] + 1 < maze.height && !maze.getWallStatus(playerPosition, 'down')) {
          getTile(playerPosition).element.textContent = ''
          playerPosition = next
          getTile(playerPosition).element.textContent = player
        }
      }
    })[event.key]
    callback?.()

    getTile(playerPosition).element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })

    setTimeout(() => {
      if (compareCoordinates(playerPosition, maze.exit)) {
        onWin()
      }
    }, 10)
  })

  return {
    element,
    tiles,
    listTiles,
    getTile
  }
}
