
import { Board, createBoard } from './game/board'
import './index.css'

const app = document.createElement('div')
app.id = 'app'
app.innerHTML = 'Loading ...'

const onWin = (): void => {
  alert('you win')
  start()
}
const start = (): Board => {
  const board = createBoard({
    onWin
  })

  app.innerHTML = ''
  app.append(board.element)
  return board
}

start()

document.body.prepend(app)
