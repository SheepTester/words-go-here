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

export type GraphNode = {
  state: State
  neighbors: Set<GraphNode>
  /** shortest path to `init` */
  prev?: GraphNode
}
export type Graph = {
  nodes: GraphNode[]
  edges: [GraphNode, GraphNode][]
}

export function traverse (
  board: Board,
  init: State,
  method: 'breadth' | 'depth'
): Graph {
  const nodes: Record<string, GraphNode> = {}
  const edges = new Set<`${string}-${string}`>()
  const toVisit = new Deque<string>()

  const cells = new Uint8Array(board.width * board.height * 2)
  const getId = (state: State) => {
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
    return cells.join(' ')
  }
  const registerNeigbor = (state: State, sourceId: string) => {
    const id = getId(state)
    if (!nodes[id]) {
      nodes[id] = { state, neighbors: new Set(), prev: nodes[sourceId] }
      toVisit.pushRight(id)
    }
    nodes[id].neighbors.add(nodes[sourceId])
    nodes[sourceId].neighbors.add(nodes[id])
    edges.add(id < sourceId ? `${id}-${sourceId}` : `${sourceId}-${id}`)
  }

  const initId = getId(init)
  nodes[initId] = { state: init, neighbors: new Set() }
  toVisit.pushRight(initId)

  const occupied = new Uint8Array(board.width * board.height)
  while (true) {
    const nextId = method === 'breadth' ? toVisit.popLeft() : toVisit.popRight()
    if (nextId === null) {
      break
    }
    const next = nodes[nextId].state
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
          registerNeigbor(
            next.map((block, j) => (j === i ? { left: left - 1, top } : block)),
            nextId
          )
        }
        moveRight: if (left < board.width - block.width) {
          for (let j = 0; j < block.height; j++) {
            if (occupied[(top + j) * board.width + left + block.width]) {
              break moveRight
            }
          }
          registerNeigbor(
            next.map((block, j) => (j === i ? { left: left + 1, top } : block)),
            nextId
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
          registerNeigbor(
            next.map((block, j) => (j === i ? { left, top: top - 1 } : block)),
            nextId
          )
        }
        moveDown: if (top < board.height - block.height) {
          for (let j = 0; j < block.width; j++) {
            if (occupied[(top + block.height) * board.width + left + j]) {
              break moveDown
            }
          }
          registerNeigbor(
            next.map((block, j) => (j === i ? { left, top: top + 1 } : block)),
            nextId
          )
        }
      }
    }
  }

  return {
    nodes: Object.values(nodes),
    edges: Array.from(edges, edgeId => {
      const [source, target] = edgeId.split('-')
      return [nodes[source], nodes[target]]
    })
  }
}
