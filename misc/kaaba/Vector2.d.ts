declare module 'https://sheeptester.github.io/javascripts/Vector2.js' {
  export interface IVector2 {
    x?: number
    y?: number
  }

  export class Vector2 implements Iterable<number>, IVector2 {
    x: number
    y: number

    constructor (x?: number, y?: number)

    readonly length: number
    readonly lengthSquared: number
    readonly angle: number

    set (vector: IVector2): this
    add (vector: IVector2): this
    sub (vector: IVector2): this
    scale (factor?: number): this
    unit (): this
    rotate (angle?: number): this
    equals (vector: IVector2): boolean
    bounded (bounds: { min?: number | null; max?: number | null }): boolean
    map (fn: (component: number) => number): this
    affix (affixes: { prefix?: string; suffix?: string }): this
    clone (): Vector2
    toString (): `<${number}, ${number}>`
    [Symbol.iterator] (): Generator<number>

    static fromMouseEvent (event: {
      clientX?: number
      clientY?: number
    }): Vector2

    static fromRectPos (position: { left?: number; top?: number }): Vector2

    static fromRectSize (size: { width?: number; height?: number }): Vector2
  }
}
