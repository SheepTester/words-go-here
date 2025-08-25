import { Board, displayState, GraphNode, traverse } from './Board'
import simSource from './sim.wgsl'

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

const adapter = await navigator.gpu.requestAdapter()
if (!adapter) {
  throw new TypeError('Failed to obtain WebGPU adapter.')
}
const device = await adapter.requestDevice()

const simPipeline = device.createComputePipeline({
  layout: 'auto',
  compute: { module: device.createShaderModule({ code: simSource }) }
})
const initialNodeData = new Float32Array(result.nodes.length * 6)
for (let i = 0; i < result.nodes.length; ++i) {
  initialNodeData[i * 6 + 0] = 2 * (Math.random() - 0.5)
  initialNodeData[i * 6 + 1] = 2 * (Math.random() - 0.5)
  initialNodeData[i * 6 + 2] = 2 * (Math.random() - 0.5)
  initialNodeData[i * 6 + 3] = 2 * (Math.random() - 0.5) * 0.1
  initialNodeData[i * 6 + 4] = 2 * (Math.random() - 0.5) * 0.1
  initialNodeData[i * 6 + 5] = 2 * (Math.random() - 0.5) * 0.1
}

const buffers = Array.from({ length: 2 }, _ => {
  const buffer = device.createBuffer({
    size: initialNodeData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  })
  new Float32Array(buffer.getMappedRange()).set(initialNodeData)
  buffer.unmap()
  return buffer
})
const bindGroups = buffers.map((buffer, i) =>
  device.createBindGroup({
    layout: simPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: buffer,
          offset: 0,
          size: initialNodeData.byteLength
        }
      },
      {
        binding: 1,
        resource: {
          buffer: buffers[(i + 1) % buffers.length],
          offset: 0,
          size: initialNodeData.byteLength
        }
      }
    ]
  })
)

const commandEncoder = device.createCommandEncoder()
const passEncoder = commandEncoder.beginComputePass()
passEncoder.setPipeline(simPipeline)
passEncoder.setBindGroup(0, bindGroups[0])
passEncoder.dispatchWorkgroups(Math.ceil(result.nodes.length / 64))
passEncoder.end()
device.queue.submit([commandEncoder.finish()])
