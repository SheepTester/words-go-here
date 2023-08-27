import { Block } from './blocks.ts'
import { Chunk, SIZE } from './Chunk.ts'

export type Device = {
  device: GPUDevice
  render: (view: GPUTextureView) => void
}

export async function init (format: GPUTextureFormat): Promise<Device> {
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    throw new TypeError('Failed to obtain WebGPU adapter.')
  }
  const device = await adapter.requestDevice()
  device.lost.then(info => {
    console.warn('WebGPU device lost. :(', info.message, info)
  })

  const module = device.createShaderModule({
    label: '😎 shaders 😎',
    code: await fetch('./shader-test.wgsl').then(r => r.text())
  })
  // Pipeline is like WebGL program; contains the shaders
  const pipeline = device.createRenderPipeline({
    label: '✨ pipeline ✨',
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vertex_main',
      buffers: [
        // vertex buffer
        {
          // Bytes between the start of each vertex datum
          arrayStride: 4 * 4,
          // Change attribute per instance rather than vertex
          stepMode: 'instance',
          attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }]
        }
      ]
    },
    // targets[0] corresponds to @location(0) in fragment_main's return value
    fragment: { module, entryPoint: 'fragment_main', targets: [{ format }] },
    primitive: { cullMode: 'back' }
  })

  const vertexData = new Float32Array([
    0, 0, 1, 0, -0.1, -0.5, 0.5, 0.5, -0.5, 0, 0, 0
  ])
  const vertices = device.createBuffer({
    label: 'vertex buffer vertices',
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(vertices, 0, vertexData)

  const uniform = device.createBuffer({
    label: 'Xx uniform buffer xX',
    size: 1 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  })
  // Bind groups have shared resources across all invocations of the shaders (eg
  // uniforms, textures, but not attributes)
  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniform } }]
  })

  return {
    device,
    render: view => {
      device.queue.writeBuffer(uniform, 0, new Float32Array([0.4]))

      // Encodes commands
      const encoder = device.createCommandEncoder({ label: 'Xx encoder xX ' })
      // You can run multiple render passes
      const pass = encoder.beginRenderPass({
        label: 'Xx render pass xX',
        colorAttachments: [
          {
            view,
            clearValue: [0, 0, 0.4, 1],
            loadOp: 'clear',
            storeOp: 'store'
          }
        ]
      })
      pass.setPipeline(pipeline)
      pass.setVertexBuffer(0, vertices)
      pass.setBindGroup(0, group)
      pass.draw(6, 3)
      pass.end()
      // finish() returns a command buffer
      device.queue.submit([encoder.finish()])
    }
  }
}

// const chunk = new Chunk()
// for (let y = 0; y < SIZE; y++) {
//   for (let x = 0; x < SIZE; x++) {
//     for (let z = 0; z < SIZE; z++) {
//       // Decreasing probability as you go up
//       if (Math.random() < (SIZE - y) / SIZE) {
//         chunk.block(x, y, z, Block.STONE)
//       }
//     }
//   }
// }

// const faces = chunk.faces()
