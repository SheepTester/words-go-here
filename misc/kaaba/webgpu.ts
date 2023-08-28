// _ @deno-types="npm:wgpu-matrix"
import { mat4, vec3 } from 'wgpu-matrix'
import { Block } from './blocks.ts'
import { Chunk, FaceDirection, SIZE } from './Chunk.ts'

class Uniform {
  #device: GPUDevice
  #buffer: GPUBuffer
  #binding: number

  constructor (device: GPUDevice, binding: number, size: number) {
    this.#device = device
    this.#buffer = device.createBuffer({
      label: `uniform @binding(${binding})`,
      size,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    this.#binding = binding
  }

  get entry (): GPUBindGroupEntry {
    return { binding: this.#binding, resource: { buffer: this.#buffer } }
  }

  data (data: BufferSource | SharedArrayBuffer, offset = 0): void {
    this.#device.queue.writeBuffer(this.#buffer, offset, data)
  }
}

export type Device = {
  device: GPUDevice
  render: (view: GPUTextureView, aspectRatio: number) => void
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
    code: await fetch('./shader.wgsl').then(r => r.text())
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
          arrayStride: 8,
          // Change attribute per instance rather than vertex
          stepMode: 'instance',
          attributes: [{ shaderLocation: 0, offset: 0, format: 'uint32x2' }]
        }
      ]
    },
    // targets[0] corresponds to @location(0) in fragment_main's return value
    fragment: { module, entryPoint: 'fragment_main', targets: [{ format }] },
    primitive: { cullMode: 'back' }
  })

  // WebGPU is little-endian, so the first byte has the smaller 8 bits of a u32
  const vertexData = new Uint8Array([
    // Face 1
    0,
    -1,
    0,
    FaceDirection.FRONT,
    0,
    0,
    0,
    0,
    // Face 2
    0,
    1,
    0,
    FaceDirection.BACK,
    1,
    0,
    0,
    0,
    // Face 3
    0,
    0,
    0,
    FaceDirection.RIGHT,
    1,
    0,
    0,
    0,
    // Face 4
    0,
    0,
    0,
    FaceDirection.LEFT,
    1,
    0,
    0,
    0
  ])
  const vertices = device.createBuffer({
    label: 'vertex buffer vertices',
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(vertices, 0, vertexData)

  const perspective = new Uniform(device, 0, 4 * 4 * 4)
  const camera = new Uniform(device, 1, 4 * 4 * 4)
  // Bind groups have shared resources across all invocations of the shaders (eg
  // uniforms, textures, but not attributes)
  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [perspective.entry, camera.entry]
  })

  return {
    device,
    render: (view, aspectRatio) => {
      perspective.data(
        new Float32Array(mat4.perspective(75, aspectRatio, 0.1, 1000))
      )
      // camera.data(new Float32Array(mat4.identity()))
      // camera.data(new Float32Array(mat4.translation([0, 0, -5])))
      camera.data(
        new Float32Array(
          mat4.rotateY(mat4.translation([0, 0, -10]), Date.now() / 500)
        )
      )

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
      pass.draw(6, 4)
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
