export class Vector2 {
  constructor (x = 0, y = 0) {
    this.set({ x, y })
  }

  get length () {
    return Math.hypot(this.x, this.y)
  }

  get comps () {
    return [this.x, this.y]
  }

  set ({ x = this.x, y = this.y }) {
    this.x = x
    this.y = y
    return this
  }

  add ({ x = 0, y = 0 }) {
    this.x += x
    this.y += y
    return this
  }

  sub ({ x = 0, y = 0 }) {
    this.x -= x
    this.y -= y
    return this
  }

  scale (factor = 1) {
    this.x *= factor
    this.y *= factor
    return this
  }

  unit () {
    return this.scale(1 / this.length)
  }

  rotate (angle = 0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const { x, y } = this
    this.x = x * cos - y * sin
    this.y = x * sin + y * cos
    return this
  }

  equals ({ x = 0, y = 0 }) {
    return this.x === x && this.y === y
  }

  clone () {
    return new Vector2(this.x, this.y)
  }
}
