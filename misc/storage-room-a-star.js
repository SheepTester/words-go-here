export class Board {
  constructor (width, height, defaultValue = null) {
    this.width = width
    this.height = height
    this._board = new Array(width * height).fill(defaultValue)
  }

  get (x, y) {
    return this._board[y * this.height + x]
  }

  set (x, y, value) {
    this._board[y * this.height + x] = value
  }

  isValid (x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  getSafely (x, y) {
    return this.isValid(x, y) ? this.get(x, y) : null
  }

  setSafely (x, y, value) {
    if (this.isValid(x, y)) {
      this.set(x, y, value)
    }
  }

  getLocation (value) {
    const index = this._board.indexOf(value)
    return index < 0 ? null : [index % this.width, Math.floor(index / this.width)]
  }

  sameSize (defaultValue) {
    return new Board(this.width, this.height, defaultValue)
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

function aStar (start, guessDist, isGoal) {
  if (!start.board.isValid(start.x, start.y)) return null

  // Queue will be maintained such that it is in order of ascending f score
  const queue = []
  const cameFrom = new Map([start.board, start.board.sameSize()])
  // g score
  const bestScores = new Map([start.board, start.board.sameSize(Infinity)])
  bestScores.get(start.board).set(start.x, start.y, 0)
  // f score
  const probWorthIfUsed = new Map([start.board, start.board.sameSize(Infinity)])
  bestScores.get(start.board).set(start.x, start.y, guessDist(start))

  function processNeighbour (from, scoreToNeighbour, next) {
    if (!next) return
    const currentBestScore = bestScores.get(next.board).get(next.x, next.y)
    if (scoreToNeighbour < currentBestScore) {
      cameFrom.get(next.board).set(next.x, next.y, from)
      bestScores.get(next.board).set(next.x, next.y, scoreToNeighbour)
      const probWorth = scoreToNeighbour + guessDist(next)
      probWorthIfUsed.get(next.board).set(next.x, next.y, probWorth)
      // Insert in proper position in queue per f score
      const index = queue.findIndex(({ pos }) => pos === next)
      if (index !== -1) {
        queue.splice(index, 1)
      }
      queue.splice(
        queue.findIndex(({ probWorth: worth }) => probWorth < worth),
        0,
        { pos: next, probWorth }
      )
    }
  }

  while (queue.length) {
    const next = queue.shift()
    if (isGoal(next)) return { next, sources }
    const bestScore = bestScores.get(next.board).get(next.x, next.y)
    processNeighbour(next, bestScore + 1, next.board.getSafely(next.x - 1, next.y))
    processNeighbour(next, bestScore + 1, next.board.getSafely(next.x + 1, next.y))
    processNeighbour(next, bestScore + 1, next.board.getSafely(next.x, next.y - 1))
    processNeighbour(next, bestScore + 1, next.board.getSafely(next.x, next.y + 1))
    const cell = next.board.get(next.x, next.y)
    if (cell && cell.ladder) {
      processNeighbour(next, bestScore + (cell.length || 1), cell.ladder)
    }
  }

  return null
}
