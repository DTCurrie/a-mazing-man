import { stateMachine } from '../../main'
import { Maze, MazeOptions, MazeType } from '../../maze/maze'
import { aldousBroder } from '../../maze/mazes/aldous-broder'
import { depthFirst } from '../../maze/mazes/depth-first'
import { growingTree } from '../../maze/mazes/growing-tree'
import { huntAndKill } from '../../maze/mazes/hunt-and-kill'
import { State } from '../state'
import { createPlayState } from './play'

export interface PickGeneratorStateOptions {
  type: MazeType
  options: MazeOptions
}

export const createPickGeneratorState = ({ type, options }: PickGeneratorStateOptions): State => {
  const generateMaze = (): Maze => {
    switch (type) {
      case 'aldousBroder': return aldousBroder(options).generate()
      case 'depthFirst': return depthFirst(options).generate()
      case 'growingTree': return growingTree({ ...options, backtrackChance: Math.random() }).generate()
      case 'huntAndKill': return huntAndKill({ ...options }).generate()
    }
  }

  const onEnter = (): void => {
    const maze = generateMaze()
    console.log('maze', type, maze.toJson())
    stateMachine.transition(createPlayState({ maze, type }))
  }

  return {
    onEnter
  }
}
