export interface State {
  onEnter?: (previous?: State) => void
  onExit?: (next?: State) => void
}

export interface StateMachine {
  getCurrent: () => State
  transition: (next: State) => void
}

export const createStateMachine = (initialState: State): StateMachine => {
  let current: State

  const getCurrent = (): State => current

  const transition = (next: State): void => {
    current?.onExit?.(next)
    const previous = current
    current = next
    next.onEnter?.(previous)
  }

  transition(initialState)

  return {
    getCurrent,
    transition
  }
}
