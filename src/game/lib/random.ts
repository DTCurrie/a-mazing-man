export const randomIndex = (list: unknown[]): number => Math.floor(Math.random() * list.length)
export const randomEntry = <T = unknown>(list: T[]): T => list[randomIndex(list)]

export const randomRange = (min: number, max: number, step: number = 1): number => {
  const array = Array.from(Array(max), (_, k) => k).slice(min).filter((_, i) => i % step === 0)
  return randomEntry(array)
}

export const shuffleArray = <T = unknown>(list: T[]): T[] => {
  const shuffled = [...list]

  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }

  return shuffled
}
