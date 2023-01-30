import { Entity } from '../entity'

export type Heading = Entity<HTMLHeadingElement>
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6'
export interface HeadingOptions {
  level: HeadingLevel
  content: string
}

export const headingClasses = (level: HeadingLevel): string[] => {
  switch (level) {
    case '1': return ['text-2xl', 'font-bold']
    case '2': return ['text-xl', 'font-bold']
    case '3': return ['text-xl']
    case '4': return ['text-lg', 'font-bold']
    case '5': return ['text-lg']
    case '6': return ['font-bold']
  }
}

export const createHeading = ({ level, content }: HeadingOptions): Heading => {
  const element = document.createElement(`h${level}`)
  element.classList.add(...headingClasses(level), 'text-white')
  element.innerHTML = content

  return { element }
}
