import { Board, displayState, GraphNode, traverse } from './Board'

const adapter = await navigator.gpu.requestAdapter()
if (!adapter) {
  throw new TypeError('Failed to obtain WebGPU adapter.')
}

const board: Board = {
  width: 4,
  height: 5,
  blocks: [
    { width: 1, height: 2, canHorizontal: true, canVertical: true },
    { width: 2, height: 2, canHorizontal: true, canVertical: true },
    { width: 1, height: 2, canHorizontal: true, canVertical: true },
    { width: 1, height: 2, canHorizontal: true, canVertical: true },
    { width: 2, height: 1, canHorizontal: true, canVertical: true },
    { width: 1, height: 1, canHorizontal: true, canVertical: true },
    { width: 1, height: 1, canHorizontal: true, canVertical: true },
    { width: 1, height: 2, canHorizontal: true, canVertical: true },
    { width: 1, height: 1, canHorizontal: true, canVertical: true },
    { width: 1, height: 1, canHorizontal: true, canVertical: true }
  ]
}
const result = traverse(
  board,
  [
    { left: 0, top: 0 },
    { left: 1, top: 0 },
    { left: 3, top: 0 },
    { left: 0, top: 2 },
    { left: 1, top: 2 },
    { left: 1, top: 3 },
    { left: 2, top: 3 },
    { left: 3, top: 2 },
    { left: 0, top: 4 },
    { left: 3, top: 4 }
  ],
  'breadth'
)
console.log(result)

let moves = 0
let s = ''
let next: GraphNode | undefined = result.nodes[result.nodes.length - 1]
while (next) {
  s = `${displayState(board, next.state)}\n\n${s}`
  next = next.prev
  if (next) {
    moves++
  }
}
console.groupCollapsed(`Longest path (${moves} moves)`)
console.log(s)
console.groupEnd()

console.log(
  'max neighbors',
  result.nodes.reduce((cum, curr) => Math.max(cum, curr.neighbors.size), 0)
)
console.log(
  'avg neighbors',
  result.nodes.reduce((cum, curr) => cum + curr.neighbors.size, 0) /
    result.nodes.length
)
