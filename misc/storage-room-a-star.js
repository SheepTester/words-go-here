export class Board {
  constructor (width, height) {
    this.width = width
    this.height = height
    this._board = new Array(width * height).fill(null)
  }

  get (x, y) {
    return this._board[y * this.height + x]
  }

  set (x, y, value) {
    this._board[y * this.height + x] = value
  }

  _isSafe (x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  getSafely (x, y) {
    return this._isSafe(x, y) ? this.get(x, y) : null
  }

  setSafely (x, y, value) {
    if (this._isSafe(x, y)) {
      this.set(x, y, value)
    }
  }
}
