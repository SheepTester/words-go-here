export class Board {
  constructor (width, height, defaultValue = null) {
    this.width = width
    this.height = height
    this._board = new Array(width * height).fill(defaultValue)
    this.tag = Math.random().toString(36).slice(2)
    this.distances = new Map()
  }

  get (x, y) {
    return this._board[y * this.width + x]
  }

  set (x, y, value) {
    this._board[y * this.width + x] = value
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
    return this
  }

  getLocation (value) {
    const index = this._board.indexOf(value)
    return index < 0 ? null : [index % this.width, Math.floor(index / this.width)]
  }

  sameSize (defaultValue) {
    return new Board(this.width, this.height, defaultValue)
  }

  setTag (tag) {
    this.tag = tag
    return this
  }

  setDistanceTo (board, dist) {
    this.distances.set(board, dist)
    board.distances.set(this, dist)
    return this
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
    this.setTag(sourceBoard.tag)

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

    this.x = 0
    this.y = 0
  }

  moveTo (x, y) {
    this.x = x
    this.y = y
    this._wrapper.style.setProperty('--x', x)
    this._wrapper.style.setProperty('--y', y)
    return this
  }

  addTo (parent) {
    parent.appendChild(this._wrapper)
    return this
  }

  setTag (tag) {
    super.setTag(tag)
    this._wrapper.dataset.tag = tag
    return this
  }
}

function getDefault (map, key, makeDefault) {
  let value = map.get(key)
  if (!value) {
    value = makeDefault()
    map.set(key, value)
  }
  return value
}

function aStar (start, guessDist, isGoal) {
  if (!start.board.isValid(start.x, start.y)) return null

  // Queue will be maintained such that it is in order of ascending f score
  const guessedStartDist = guessDist(start)
  const queue = [{ pos: start, probWorth: guessedStartDist }]
  const cameFrom = new Map([[start.board, start.board.sameSize()]])
  // g score
  const bestScores = new Map([[start.board, start.board.sameSize(Infinity)]])
  bestScores.get(start.board).set(start.x, start.y, 0)
  // f score
  const probWorthIfUsed =
    new Map([[start.board, start.board.sameSize(Infinity)]])
  bestScores.get(start.board).set(start.x, start.y, guessedStartDist)

  function processNeighbour (from, scoreToNeighbour, next, fromChest) {
    if (!next.board.isValid(next.x, next.y)) {
      return
    }
    const cell = next.board.get(next.x, next.y)
    if (cell && !cell.ladder && !isGoal(next)) {
      return
    }

    const nextBoardBestScores =
      getDefault(bestScores, next.board, () => next.board.sameSize(Infinity))
    const currentBestScore = nextBoardBestScores.get(next.x, next.y)
    if (scoreToNeighbour < currentBestScore) {
      getDefault(cameFrom, next.board, () => next.board.sameSize())
        .set(next.x, next.y, from)
      nextBoardBestScores.set(next.x, next.y, scoreToNeighbour)
      const probWorth = scoreToNeighbour + guessDist(next)
      getDefault(probWorthIfUsed, next.board, () =>
        next.board.sameSize(Infinity))
        .set(next.x, next.y, probWorth)
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
    const { pos: next } = queue.shift()
    if (isGoal(next)) {
      const path = []
      let temp = next
      do {
        path.unshift(temp)
        temp = cameFrom.get(temp.board).get(temp.x, temp.y)
      } while (temp)
      // Presumably start's cameFrom should be empty?
      return { goal: next, path }
    }
    const bestScore = bestScores.get(next.board).get(next.x, next.y)
    const { board } = next
    processNeighbour(next, bestScore + 1, { board, x: next.x - 1, y: next.y })
    processNeighbour(next, bestScore + 1, { board, x: next.x + 1, y: next.y })
    processNeighbour(next, bestScore + 1, { board, x: next.x, y: next.y - 1 })
    processNeighbour(next, bestScore + 1, { board, x: next.x, y: next.y + 1 })
    const cell = next.board.get(next.x, next.y)
    if (cell && cell.ladder) {
      processNeighbour(next, bestScore + (cell.length || 1), cell.ladder)
    }
  }

  return null
}

function posToString ({ board, x, y }) {
  return `${board.tag}(${x}, ${y})`
}

// This uses A* to pathfind to multiple goals. I think my approach is naïve---it
// heads to the closest goal, then heads to the next closest one, and so on. The
// algorithm can be fooled by leading it away with a trail of breadcrumbs from a
// chest that is somewhat close to the starting point but not the closest,
// requiring it to circle back to the start after getting to the end of the
// trail.
// * = chest; @ = start
//  * * * * * * * * * * * * <-- it'll first go along this line of chests...
// @
//
//  * <-- ...before circling all the way back here;
//        a shorter path would be to visit this chest near the beginning
export function pathFind (start, goals) {
  const path = []
  const strGoals = new Map(Array.from(goals, goal => [posToString(goal), goal]))
  function guessDistToClosestGoal (pos) {
    return Math.min(...Array.from(strGoals.values(), goal => {
      if (goal.board === pos.board) {
        // Manhattan distance
        return Math.abs(goal.x - pos.x) + Math.abs(goal.y - pos.y)
      } else {
        // 7 is a magic number!
        return (pos.board.distances.get(goal.board) || 1) * 7
      }
    }))
  }
  function isGoal (pos) {
    return strGoals.has(posToString(pos))
  }
  while (strGoals.size) {
    const result = aStar(start, guessDistToClosestGoal, isGoal)
    if (!result) return null
    const { goal, path: subPath } = result
    strGoals.delete(posToString(goal))
    path.push(...subPath)
    start = path[path.length - 1]
  }
  return path
}
