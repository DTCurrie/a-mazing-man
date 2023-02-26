export interface ScreenContainer {
  element: HTMLDivElement
}

export const createScreenContainer = (): ScreenContainer => {
  const element = document.createElement('div')
  element.classList.add('absolute', 'flex', 'flex-col', 'w-screen', 'h-screen', 'justify-center', 'items-center', 'gap-2', 'z-50', 'bg-slate-700')

  return { element }
}
