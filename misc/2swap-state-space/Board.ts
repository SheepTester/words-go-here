import { Deque } from './Deque.ts'

export type Block = {
  width: number
  height: number
  canHorizontal: boolean
  canVertical: boolean
}

export type Board = {
  width: number
  height: number
  blocks: Block[]
}

export type BlockState = {
  left: number
  top: number
}

export type State = BlockState[]

export function displayState (board: Board, state: State): string {
  const cells = new Int32Array(board.width * board.height)
  cells.fill(-1)
  for (const [i, block] of board.blocks.entries()) {
    const { left, top } = state[i]
    for (let y = 0; y < block.height; y++) {
      for (let x = 0; x < block.width; x++) {
        cells[(top + y) * board.width + left + x] = i
      }
    }
  }
  let display = ''
  for (const [i, cell] of cells.entries()) {
    if (i > 0 && i % board.width === 0) {
      display += '\n'
    }
    display += cell === -1 ? ' ' : cell.toString(36).toUpperCase()
  }
  return display
}

export function * traverse (
  board: Board,
  init: State,
  method: 'breadth' | 'depth'
): Generator<State> {
  const added = new Set<string>()
  const toVisit = new Deque<State>()

  const cells = new Uint8Array(board.width * board.height * 2)
  const tryState = (state: State) => {
    cells.fill(0)
    for (const [i, block] of board.blocks.entries()) {
      const { left, top } = state[i]
      for (let y = 0; y < block.height; y++) {
        for (let x = 0; x < block.width; x++) {
          cells[((top + y) * board.width + left + x) * 2] =
            (+block.canHorizontal * 0x80) | block.width
          cells[((top + y) * board.width + left + x) * 2 + 1] =
            (+block.canVertical * 0x80) | block.height
        }
      }
    }
    const id = cells.join(' ')
    if (!added.has(id)) {
      added.add(id)
      toVisit.pushRight(state)
    }
  }
  tryState(init)

  const occupied = new Uint8Array(board.width * board.height)
  while (true) {
    const next = method === 'breadth' ? toVisit.popLeft() : toVisit.popRight()
    if (next === null) {
      return
    }
    yield next
    occupied.fill(0)
    for (const [i, block] of board.blocks.entries()) {
      const { left, top } = next[i]
      for (let y = 0; y < block.height; y++) {
        for (let x = 0; x < block.width; x++) {
          occupied[(top + y) * board.width + left + x] = 1
        }
      }
    }
    for (const [i, block] of board.blocks.entries()) {
      const { left, top } = next[i]
      if (block.canHorizontal) {
        moveLeft: if (left > 0) {
          for (let j = 0; j < block.height; j++) {
            if (occupied[(top + j) * board.width + left - 1]) {
              break moveLeft
            }
          }
          tryState(
            next.map((block, j) => (j === i ? { left: left - 1, top } : block))
          )
        }
        moveRight: if (left < board.width - block.width) {
          for (let j = 0; j < block.height; j++) {
            if (occupied[(top + j) * board.width + left + block.width]) {
              break moveRight
            }
          }
          tryState(
            next.map((block, j) => (j === i ? { left: left + 1, top } : block))
          )
        }
      }
      if (block.canVertical) {
        moveUp: if (top > 0) {
          for (let j = 0; j < block.width; j++) {
            if (occupied[(top - 1) * board.width + left + j]) {
              break moveUp
            }
          }
          tryState(
            next.map((block, j) => (j === i ? { left, top: top - 1 } : block))
          )
        }
        moveDown: if (top < board.height - block.height) {
          for (let j = 0; j < block.width; j++) {
            if (occupied[(top + block.height) * board.width + left + j]) {
              break moveDown
            }
          }
          tryState(
            next.map((block, j) => (j === i ? { left, top: top + 1 } : block))
          )
        }
      }
    }
  }
}
