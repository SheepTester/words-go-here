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
export class Group<U extends Record<string, Uniform | GPUBindGroupEntry>> {
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
      entries: Object.values(uniforms).map(entry =>
        entry instanceof Uniform ? entry.entry : entry
      )
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
    fragment: {
      module,
      entryPoint: 'fragment_main',
      targets: [
        {
          format,
          // https://stackoverflow.com/a/72682494
          blend: {
            color: {
              operation: 'add',
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha'
            },
            alpha: {}
          }
        }
      ]
    },
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
            chunk.block(
              x,
              y,
              z,
              (position[0] + position[2]) % 2 === 0 ? Block.STONE : Block.GLASS
            )
          }
        }
      }
    }
    return chunk.mesh(device, pipeline)
  }

  const chunks: ChunkRenderer[] = []
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      chunks.push(generateChunk([x, 0, z]))
    }
  }
  const testChunk = new Chunk([0, 1, 0])
  // https://0fps.net/2013/07/03/ambient-occlusion-for-minecraft-like-worlds/
  // Lone block (no AO)
  testChunk.block(1, 3, 6, Block.WHITE)
  // Corners touching (AO level 1)
  testChunk.block(1, 3, 3, Block.WHITE)
  testChunk.block(2, 4, 2, Block.WHITE)
  // Sides touching (AO level 1)
  testChunk.block(5, 3, 3, Block.WHITE)
  testChunk.block(5, 4, 2, Block.WHITE)
  // Side + corner touching (AO level 2)
  testChunk.block(9, 3, 3, Block.WHITE)
  testChunk.block(9, 4, 2, Block.WHITE)
  testChunk.block(10, 4, 2, Block.WHITE)
  // Two sides, no corner (AO level 3)
  testChunk.block(5, 3, 6, Block.WHITE)
  testChunk.block(5, 4, 7, Block.WHITE)
  testChunk.block(6, 4, 6, Block.WHITE)
  // Two sides, corner (AO level 3)
  testChunk.block(9, 3, 6, Block.WHITE)
  testChunk.block(9, 4, 7, Block.WHITE)
  testChunk.block(10, 4, 6, Block.WHITE)
  testChunk.block(10, 4, 7, Block.WHITE)
  chunks.push(testChunk.mesh(device, pipeline))

  const source = await fetch('./textures.png')
    .then(r => r.blob())
    .then(blob => createImageBitmap(blob, { colorSpaceConversion: 'none' }))
  const texture = device.createTexture({
    label: 'texture',
    format: 'rgba8unorm',
    size: [source.width, source.height],
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT
  })
  device.queue.copyExternalImageToTexture(
    { source, flipY: true },
    { texture },
    { width: source.width, height: source.height }
  )
  const sampler = device.createSampler()

  const common = new Group(device, pipeline, 0, {
    perspective: new Uniform(device, 0, 4 * 4 * 4),
    camera: new Uniform(device, 1, 4 * 4 * 4),
    sampler: { binding: 2, resource: sampler },
    texture: { binding: 3, resource: texture.createView() },
    textureSize: new Uniform(device, 4, 4 * 2)
  })
  common.uniforms.textureSize.data(
    new Float32Array([source.width / 16, source.height / 16])
  )

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
            clearValue: [0.75, 0.85, 1, 1],
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
