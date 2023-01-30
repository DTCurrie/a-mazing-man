import { Entity } from '../entity'

export type ScreenContainer = Entity<HTMLDivElement>

export const createScreenContainer = (): ScreenContainer => {
  const element = document.createElement('div')
  element.classList.add('flex', 'flex-col', 'w-screen', 'h-screen', 'justify-center', 'items-center', 'gap-2')

  return { element }
}
