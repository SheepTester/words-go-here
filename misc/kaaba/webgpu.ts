// _ @deno-types="npm:wgpu-matrix"
import { mat4 } from 'wgpu-matrix'
import { Block } from './blocks.ts'
import { Chunk, SIZE } from './Chunk.ts'

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
  render: (view: GPUTexture, camera: ReturnType<typeof mat4.clone>) => void
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
  const { messages } = await module.getCompilationInfo()
  if (messages.some(message => message.type === 'error')) {
    console.log(messages)
    throw new SyntaxError('Shader failed to compile.')
  }
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
    primitive: { cullMode: 'back' },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus'
    }
  })

  const chunk = new Chunk()
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      for (let z = 0; z < SIZE; z++) {
        // Decreasing probability as you go up
        if (Math.random() < (SIZE - y) / SIZE) {
          chunk.block(x, y, z, Block.STONE)
        }
      }
    }
  }
  const faces = chunk.faces()
  const faceCount = faces.length / 8

  // WebGPU is little-endian, so the first byte has the smaller 8 bits of a u32
  const vertexData = new Uint8Array(faces)
  const vertices = device.createBuffer({
    label: 'vertex buffer vertices',
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(vertices, 0, vertexData)

  const chunk2 = new Chunk()
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      for (let z = 0; z < SIZE; z++) {
        // Decreasing probability as you go down
        if (Math.random() < (y + 1) / SIZE) {
          chunk2.block(x, y, z, Block.STONE)
        }
      }
    }
  }
  const faces2 = chunk2.faces()
  const faceCount2 = faces2.length / 8
  const vertexData2 = new Uint8Array(faces2)
  const vertices2 = device.createBuffer({
    label: 'vertex buffer vertices (chunk 2)',
    size: vertexData2.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(vertices2, 0, vertexData2)

  const perspective = new Uniform(device, 0, 4 * 4 * 4)
  const camera = new Uniform(device, 1, 4 * 4 * 4)
  // Bind groups have shared resources across all invocations of the shaders (eg
  // uniforms, textures, but not attributes)
  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [perspective.entry, camera.entry]
  })

  const transform1 = new Uniform(device, 0, 4 * 4 * 4)
  const chunk1Group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(1),
    entries: [transform1.entry]
  })
  const transform2 = new Uniform(device, 0, 4 * 4 * 4)
  const chunk2Group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(1),
    entries: [transform2.entry]
  })

  let depthTexture: GPUTexture | null = null

  return {
    device,
    render: (canvasTexture, cameraTransform) => {
      perspective.data(
        new Float32Array(
          mat4.perspective(
            Math.PI / 4,
            canvasTexture.width / canvasTexture.height,
            0.1,
            1000
          )
        )
      )
      camera.data(new Float32Array(cameraTransform))
      transform1.data(mat4.identity())
      transform2.data(mat4.translation([-SIZE, 0, 0]))

      if (
        depthTexture?.width !== canvasTexture.width ||
        depthTexture.height !== canvasTexture.height
      ) {
        depthTexture?.destroy()
        depthTexture = device.createTexture({
          size: [canvasTexture.width, canvasTexture.height],
          format: 'depth24plus',
          usage: GPUTextureUsage.RENDER_ATTACHMENT
        })
      }

      // Encodes commands
      const encoder = device.createCommandEncoder({ label: 'Xx encoder xX ' })
      // You can run multiple render passes
      const pass = encoder.beginRenderPass({
        label: 'Xx render pass xX',
        colorAttachments: [
          {
            view: canvasTexture.createView(),
            clearValue: [0, 0, 0.4, 1],
            loadOp: 'clear',
            storeOp: 'store'
          }
        ],
        depthStencilAttachment: {
          view: depthTexture.createView(),
          depthClearValue: 1.0,
          depthLoadOp: 'clear',
          depthStoreOp: 'store'
        }
      })
      pass.setPipeline(pipeline)
      pass.setBindGroup(0, group)
      pass.setBindGroup(1, chunk1Group)
      pass.setVertexBuffer(0, vertices)
      pass.draw(6, faceCount)
      pass.setBindGroup(1, chunk2Group)
      pass.setVertexBuffer(0, vertices2)
      pass.draw(6, faceCount2)
      pass.end()
      // finish() returns a command buffer
      device.queue.submit([encoder.finish()])
    }
  }
}
