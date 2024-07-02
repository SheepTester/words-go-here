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
      label: `🪙 uniform @binding(${binding})`,
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
      label: `🌲 group(${groupId})`,
      layout: pipeline.getBindGroupLayout(groupId),
      entries: Object.values(uniforms).map(entry =>
        entry instanceof Uniform ? entry.entry : entry
      )
    })
    this.uniforms = uniforms
  }
}

function captureError (device: GPUDevice, stage: string): () => Promise<void> {
  device.pushErrorScope('internal')
  device.pushErrorScope('out-of-memory')
  device.pushErrorScope('validation')

  return async () => {
    const validationError = await device.popErrorScope()
    const memoryError = await device.popErrorScope()
    const internalError = await device.popErrorScope()
    if (validationError) {
      throw new TypeError(
        `WebGPU validation error during ${stage}.\n${validationError.message}`
      )
    }
    if (memoryError) {
      throw new TypeError(
        `WebGPU out of memory error during ${stage}.\n${memoryError.message}`
      )
    }
    if (internalError) {
      throw new TypeError(
        `WebGPU internal error during ${stage}.\n${internalError.message}`
      )
    }
  }
}

export type Device = {
  device: GPUDevice
  resize: (width: number, height: number) => void
  render: (
    view: GPUTexture,
    camera: ReturnType<typeof mat4.clone>
  ) => Promise<void>
  getBlock: (x: number, y: number, z: number) => Block
  setBlock: (x: number, y: number, z: number, block: Block) => void
}

export async function init (
  format: GPUTextureFormat,
  onGpuTime: (delta: bigint) => void
): Promise<Device> {
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    throw new TypeError('Failed to obtain WebGPU adapter.')
  }
  const canTimestamp = adapter.features.has('timestamp-query')
  const device = await adapter.requestDevice({
    requiredFeatures: canTimestamp ? ['timestamp-query'] : []
  })
  device.lost.then(info => {
    console.warn('WebGPU device lost. :(', info.message, info)
  })

  const check = captureError(device, 'initialization')

  const querySet = canTimestamp
    ? device.createQuerySet({
        type: 'timestamp',
        count: 2
      })
    : null
  const resolveBuffer = querySet
    ? device.createBuffer({
        size: querySet.count * 8,
        usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
      })
    : null
  const resultBuffer = resolveBuffer
    ? device.createBuffer({
        size: resolveBuffer.size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
      })
    : null

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

  const modulePp = device.createShaderModule({
    label: '😮 post processing shader 😮',
    code: await fetch('./post-processing.wgsl').then(r => r.text())
  })
  const { messages: messagesPp } = await modulePp.getCompilationInfo()
  if (messagesPp.some(message => message.type === 'error')) {
    console.log(messagesPp)
    throw new SyntaxError('Post-processing shader failed to compile.')
  }
  const pipelinePp = device.createRenderPipeline({
    label: '🎨 post-processing pipeline 🎨',
    layout: 'auto',
    vertex: { module: modulePp, entryPoint: 'vertex_main' },
    fragment: {
      module: modulePp,
      entryPoint: 'fragment_main',
      targets: [{ format }]
    }
  })

  const chunkMap: Record<`${number},${number},${number}`, ChunkRenderer> = {}

  function generateChunk (position: ChunkPosition): ChunkRenderer {
    const chunk = new Chunk(position)
    const renderer = new ChunkRenderer(chunk, device, pipeline)
    chunkMap[`${position[0]},${position[1]},${position[2]}`] = renderer
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        for (let z = 0; z < SIZE; z++) {
          // Decreasing probability as you go up
          if (Math.random() < (SIZE - y) / SIZE) {
            chunk.block(
              x,
              y,
              z,
              (Math.floor(position[0] / 2) + position[2]) % 2 === 0
                ? Block.STONE
                : Block.GLASS
            )
          }
        }
      }
    }
    return renderer
  }

  const chunks: ChunkRenderer[] = []
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      chunks.push(generateChunk([x, 0, z]))
    }
  }
  const testChunk = new Chunk([0, 1, 0])

  // https://0fps.net/2013/07/03/ambient-occlusion-for-minecraft-like-worlds/
  // Note: in Minecraft 1.20, corner doesn't matter if there are two sides. And
  // a single corner seems to be darker than a single side. So maybe the levels
  // (for a given corner of a face) actually go:
  // 0. Lone block
  // 1. Single side
  // 2. Single corner (+ optional side I think)
  // 3. Two sides (corner doesn't matter)

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
  chunkMap['0,1,0'] = new ChunkRenderer(testChunk, device, pipeline)
  chunks.push(chunkMap['0,1,0'])

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

  const commonPp = new Group(device, pipelinePp, 0, {
    canvasSize: new Uniform(device, 0, 4 * 2),
    sampler: { binding: 1, resource: sampler }
  })

  let depthTexture: GPUTexture | null = null
  let screenTexture: GPUTexture | null = null

  await check()

  return {
    device,
    resize: (width, height) => {
      common.uniforms.perspective.data(
        new Float32Array(
          mat4.perspective(Math.PI / 2, width / height, 0.1, 1000)
        )
      )
      commonPp.uniforms.canvasSize.data(new Float32Array([width, height]))

      depthTexture?.destroy()
      depthTexture = device.createTexture({
        size: [width, height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      })

      screenTexture?.destroy()
      screenTexture = device.createTexture({
        size: [width, height],
        format,
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT
      })
    },
    render: async (canvasTexture, cameraTransform) => {
      if (!depthTexture || !screenTexture) {
        throw new Error('Attempted render before resize() was called.')
      }

      const check = captureError(device, 'render')

      common.uniforms.camera.data(new Float32Array(cameraTransform))

      // Encodes commands
      const encoder = device.createCommandEncoder({ label: 'Xx encoder xX ' })
      {
        // You can run multiple render passes
        const pass = encoder.beginRenderPass({
          label: 'Xx render pass xX',
          colorAttachments: [
            {
              view: screenTexture.createView(),
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
          },
          timestampWrites: querySet
            ? { querySet, beginningOfPassWriteIndex: 0, endOfPassWriteIndex: 1 }
            : undefined
        })
        pass.setPipeline(pipeline)
        pass.setBindGroup(0, common.group)
        for (const chunk of chunks) {
          chunk.render(pass)
        }
        pass.end()

        if (querySet && resolveBuffer && resultBuffer) {
          encoder.resolveQuerySet(querySet, 0, querySet.count, resolveBuffer, 0)
          if (resultBuffer.mapState === 'unmapped') {
            encoder.copyBufferToBuffer(
              resolveBuffer,
              0,
              resultBuffer,
              0,
              resultBuffer.size
            )
          }
        }
      }
      {
        const pass = encoder.beginRenderPass({
          label: 'Xx post processing pass xX',
          colorAttachments: [
            {
              view: canvasTexture.createView(),
              clearValue: [1, 0, 1, 1],
              loadOp: 'clear',
              storeOp: 'store'
            }
          ]
        })
        pass.setPipeline(pipelinePp)
        pass.setBindGroup(0, commonPp.group)
        pass.setBindGroup(
          1,
          new Group(device, pipelinePp, 1, {
            texture: { binding: 0, resource: screenTexture.createView() }
          }).group
        )
        pass.draw(6)
        pass.end()
      }
      // finish() returns a command buffer
      device.queue.submit([encoder.finish()])

      if (canTimestamp && resultBuffer?.mapState === 'unmapped') {
        resultBuffer.mapAsync(GPUMapMode.READ).then(() => {
          const times = new BigInt64Array(resultBuffer.getMappedRange())
          onGpuTime(times[1] - times[0])
          resultBuffer.unmap()
        })
      }

      await check()
    },
    getBlock: (x, y, z) => {
      const chunkX = Math.floor(x / SIZE)
      const chunkY = Math.floor(y / SIZE)
      const chunkZ = Math.floor(z / SIZE)
      const chunk = chunkMap[`${chunkX},${chunkY},${chunkZ}`]
      if (!chunk) {
        return Block.AIR
      }
      return (
        chunk.chunk.block(
          x - chunkX * SIZE,
          y - chunkY * SIZE,
          z - chunkZ * SIZE
        ) ?? Block.AIR
      )
    },
    setBlock: (x, y, z, block) => {
      const chunkX = Math.floor(x / SIZE)
      const chunkY = Math.floor(y / SIZE)
      const chunkZ = Math.floor(z / SIZE)
      if (!chunkMap[`${chunkX},${chunkY},${chunkZ}`]) {
        const renderer = new ChunkRenderer(
          new Chunk([chunkX, chunkY, chunkZ]),
          device,
          pipeline
        )
        chunkMap[`${chunkX},${chunkY},${chunkZ}`] = renderer
        chunks.push(renderer)
      }
      const renderer = chunkMap[`${chunkX},${chunkY},${chunkZ}`]
      renderer.chunk.block(
        x - chunkX * SIZE,
        y - chunkY * SIZE,
        z - chunkZ * SIZE,
        block
      )
      renderer.refreshMesh()
    }
  }
}
