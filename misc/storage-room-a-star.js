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

  getLocation (value) {
    const index = this._board.indexOf(value)
    return index < 0 ? null : [index % this.width, Math.floor(index / this.width)]
  }
}

export class ElemBoard extends Board {
  constructor (sourceBoard) {
    super(sourceBoard.width, sourceBoard.height)

    const wrapper = document.createElement('div')
    wrapper.className = 'board'
    wrapper.style.setProperty('--width', this.width)
    wrapper.style.setProperty('--height', this.height)
    this._wrapper = wrapper

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const cell = sourceBoard.get(x, y)
        if (cell) {
          const cellElem = document.createElement('div')
          cellElem.className = 'cell'
          cellElem.style.backgroundImage = `url("${cell.texture}")`
          cellElem.style.setProperty('--x', x)
          cellElem.style.setProperty('--y', y)
          cellElem.dataset.x = x
          cellElem.dataset.y = y
          wrapper.appendChild(cellElem)
          this.set(x, y, cellElem)
        }
      }
    }
  }

  moveTo (x, y) {
    this._wrapper.style.setProperty('--x', x)
    this._wrapper.style.setProperty('--y', y)
    return this
  }

  addTo (parent) {
    parent.appendChild(this._wrapper)
    return this
  }

  setTag (tag) {
    this._wrapper.dataset.tag = tag
    return this
  }
}
