// _ @deno-types="npm:wgpu-matrix"
import { mat4 } from 'wgpu-matrix'
import { Block } from './blocks.ts'
import { Chunk, ChunkPosition, ChunkRenderer, SIZE } from './Chunk.ts'

export class Uniform {
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

/**
 * Bind groups have shared resources across all invocations of the shaders (eg
 * uniforms, textures, but not attributes).
 */
export class Group<U extends Record<string, Uniform>> {
  group: GPUBindGroup
  uniforms: U

  constructor (
    device: GPUDevice,
    pipeline: GPURenderPipeline,
    groupId: number,
    uniforms: U
  ) {
    this.group = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(groupId),
      entries: Object.values(uniforms).map(uniform => uniform.entry)
    })
    this.uniforms = uniforms
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

  function generateChunk (position: ChunkPosition): ChunkRenderer {
    const chunk = new Chunk(position)
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
    return chunk.mesh(device, pipeline)
  }

  const chunks: ChunkRenderer[] = []
  for (let x = -5; x <= 5; x++) {
    for (let z = -5; z <= 5; z++) {
      chunks.push(generateChunk([x, 0, z]))
    }
  }

  const common = new Group(device, pipeline, 0, {
    perspective: new Uniform(device, 0, 4 * 4 * 4),
    camera: new Uniform(device, 1, 4 * 4 * 4)
  })

  let depthTexture: GPUTexture | null = null

  return {
    device,
    render: (canvasTexture, cameraTransform) => {
      common.uniforms.perspective.data(
        new Float32Array(
          mat4.perspective(
            Math.PI / 2,
            canvasTexture.width / canvasTexture.height,
            0.1,
            1000
          )
        )
      )
      common.uniforms.camera.data(new Float32Array(cameraTransform))

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
      pass.setBindGroup(0, common.group)
      for (const chunk of chunks) {
        chunk(pass)
      }
      pass.end()
      // finish() returns a command buffer
      device.queue.submit([encoder.finish()])
    }
  }
}
