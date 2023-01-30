export type Coordinates = [y: number, x: number]

export const compareCoordinates = (a: Coordinates, b: Coordinates): boolean => a[0] === b[0] && a[1] === b[1]
