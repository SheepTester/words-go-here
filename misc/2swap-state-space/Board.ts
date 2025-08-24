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

export type State = {
  board: Board
  blocks: BlockState[]
}

function serializeState (state: State): string {
  return state.blocks.map(({ left, top }) => `${left} ${top}`).join(',')
}

export function * traverse (
  init: State,
  method: 'breadth' | 'depth'
): Generator<State> {
  const board = init.board
  const added: Record<string, State> = { [serializeState(init)]: init }
  const toVisit = new Deque<State>()
  toVisit.pushRight(init)
  const tryState = (state: State) => {
    const id = serializeState(state)
    if (!added[id]) {
      added[id] = state
      toVisit.pushRight(state)
    }
  }
  const occupied = new Uint8Array(board.width * board.height)
  while (true) {
    const next = method === 'breadth' ? toVisit.popLeft() : toVisit.popRight()
    if (next === null) {
      return
    }
    yield next
    occupied.fill(0)
    for (const [i, block] of board.blocks.entries()) {
      const { left, top } = next.blocks[i]
      for (let x = 0; x < block.width; x++) {
        for (let y = 0; y < block.width; y++) {
          occupied[(top + y) * board.width + left + x] = 1
        }
      }
    }
    for (const [i, block] of board.blocks.entries()) {
      const { left, top } = next.blocks[i]
      if (block.canHorizontal) {
        moveLeft: if (left > 0) {
          for (let j = 0; j < block.height; j++) {
            if (occupied[(top + j) * board.width + left - 1]) {
              break moveLeft
            }
          }
          tryState({
            ...next,
            blocks: next.blocks.map((block, j) =>
              j === i ? { left: left - 1, top } : block
            )
          })
        }
        moveRight: if (left < board.width - block.width) {
          for (let j = 0; j < block.height; j++) {
            if (occupied[(top + j) * board.width + left + block.width]) {
              break moveRight
            }
          }
          tryState({
            ...next,
            blocks: next.blocks.map((block, j) =>
              j === i ? { left: left + 1, top } : block
            )
          })
        }
      }
      if (block.canVertical) {
        moveUp: if (top > 0) {
          for (let j = 0; j < block.width; j++) {
            if (occupied[(top - 1) * board.width + left + j]) {
              break moveUp
            }
          }
          tryState({
            ...next,
            blocks: next.blocks.map((block, j) =>
              j === i ? { left, top: top - 1 } : block
            )
          })
        }
        moveDown: if (top < board.height - block.height) {
          for (let j = 0; j < block.width; j++) {
            if (occupied[(top + block.height) * board.width + left + j]) {
              break moveDown
            }
          }
          tryState({
            ...next,
            blocks: next.blocks.map((block, j) =>
              j === i ? { left, top: top + 1 } : block
            )
          })
        }
      }
    }
  }
}
