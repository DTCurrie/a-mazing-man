import { Entity } from '../entity'

export type Button = Entity<HTMLButtonElement>
export type ButtonType = 'button' | 'menu' | 'submit' | 'reset'
export interface ButtonOptions {
  type?: ButtonType
  label: string
  action: () => void
}

export const createButton = ({
  type = 'button',
  label,
  action
}: ButtonOptions): Button => {
  const element = document.createElement('button')
  element.type = type
  element.classList.add('px-2', 'py-1', 'bg-white')
  element.innerHTML = label

  element.onclick = (ev) => {
    ev.preventDefault()
    action()
  }

  return { element }
}
