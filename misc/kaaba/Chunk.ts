import { mat4 } from 'wgpu-matrix'
import { Block, getTexture, isOpaque, isSolid } from './blocks.ts'
import { Group, Uniform } from './webgpu.ts'

export const SIZE = 32

export const enum FaceDirection {
  BACK = 0,
  FRONT = 1,
  LEFT = 2,
  RIGHT = 3,
  BOTTOM = 4,
  TOP = 5
}

const directions = [
  { face: FaceDirection.BACK, normal: [0, 0, -1] },
  { face: FaceDirection.FRONT, normal: [0, 0, 1] },
  { face: FaceDirection.LEFT, normal: [-1, 0, 0] },
  { face: FaceDirection.RIGHT, normal: [1, 0, 0] },
  { face: FaceDirection.BOTTOM, normal: [0, -1, 0] },
  { face: FaceDirection.TOP, normal: [0, 1, 0] }
]

const squareVertices: [x: number, y: number][] = [
  [0.0, 0.0],
  [0.0, 1.0],
  [1.0, 1.0],
  [1.0, 1.0],
  [1.0, 0.0],
  [0.0, 0.0]
]
function getFaceVertex (face: number, index: number): ChunkPosition {
  const squareVertex = squareVertices[index]
  const flipped: ChunkPosition =
    face & 1 // Rotate ("flip") around center of cube
      ? [1.0 - squareVertex[0], squareVertex[1], 1.0]
      : [squareVertex[0], squareVertex[1], 0.0]
  const rotated: ChunkPosition =
    face & 4 // 10x: bottom/top
      ? [flipped[0], flipped[2], 1.0 - flipped[1]]
      : face & 2 // 01x: left/right
      ? [flipped[2], flipped[1], 1.0 - flipped[0]] // 00x: back/front
      : flipped
  return rotated
}

function showFace (block: Block, neighbor: Block | null): boolean {
  return block !== neighbor && !isOpaque(neighbor)
}

export type ChunkPosition = [x: number, y: number, z: number]

export class Chunk {
  #data: Uint8Array = new Uint8Array(SIZE * SIZE * SIZE)
  position: ChunkPosition

  constructor (position: ChunkPosition) {
    this.position = position
  }

  /**
   * Gets the block at the given coordinates. If `block` is specified, it sets
   * the block at that position and returns the new ID.
   */
  block (x: number, y: number, z: number, block?: Block): Block | null {
    if (x < 0 || y < 0 || z < 0 || x >= SIZE || y >= SIZE || z >= SIZE) {
      return null
    }
    const index = (x * SIZE + y) * SIZE + z
    if (block !== undefined) {
      this.#data[index] = block
      return block
    } else {
      return this.#data[index]
    }
  }

  mesh (device: GPUDevice): GPUBuffer {
    const faces: number[] = []
    for (let x = 0; x < SIZE; x++) {
      for (let y = 0; y < SIZE; y++) {
        for (let z = 0; z < SIZE; z++) {
          const block = this.block(x, y, z)
          const texture = getTexture(block)
          if (block === null || texture === null) {
            continue
          }
          for (const {
            face,
            normal: [dx, dy, dz]
          } of directions) {
            if (showFace(block, this.block(x + dx, y + dy, z + dz))) {
              let ao = 0
              let i = 0
              // For each corner (yeah the indices are confusing)
              for (const [i, index] of [0, 1, 4, 3].entries()) {
                const [cx, cy, cz] = getFaceVertex(face, index)
                const opaques =
                  +isOpaque(
                    this.block(
                      x + (dx || (cx ? 1 : -1)),
                      y + (dy || (cy ? 1 : -1)),
                      z + (dz || (cz ? 1 : -1))
                    )
                  ) +
                  (dx === 0
                    ? +isOpaque(
                        this.block(x + (dx || (cx ? 1 : -1)), y + dy, z + dz)
                      )
                    : 0) +
                  (dy === 0
                    ? +isOpaque(
                        this.block(x + dx, y + (dy || (cy ? 1 : -1)), z + dz)
                      )
                    : 0) +
                  (dz === 0
                    ? +isOpaque(
                        this.block(x + dx, y + dy, z + (dz || (cz ? 1 : -1)))
                      )
                    : 0)
                ao |= opaques << (i * 2)
              }
              faces.push(x, y, z, face, texture, ao, 0, 0)
            }
          }
        }
      }
    }
    // WebGPU is little-endian, so the first byte has the smaller 8 bits of a
    // u32
    const vertexData = new Uint8Array(faces)
    const vertices = device.createBuffer({
      label: `chunk (${this.position.join(', ')}) vertex buffer vertices`,
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(vertices, 0, vertexData)
    return vertices
  }
}

export class ChunkRenderer {
  chunk: Chunk
  device: GPUDevice
  chunkGroup: Group<{ transform: Uniform }>
  vertices: GPUBuffer | null = null

  constructor (chunk: Chunk, device: GPUDevice, pipeline: GPURenderPipeline) {
    this.chunk = chunk
    this.device = device
    this.chunkGroup = new Group(device, pipeline, 1, {
      transform: new Uniform(device, 0, 4 * 4 * 4)
    })
    this.chunkGroup.uniforms.transform.data(
      mat4.translation(chunk.position.map(pos => pos * SIZE))
    )
  }

  refreshMesh (): GPUBuffer {
    this.vertices = this.chunk.mesh(this.device)
    return this.vertices
  }

  render (pass: GPURenderPassEncoder) {
    this.vertices ??= this.chunk.mesh(this.device)
    pass.setBindGroup(1, this.chunkGroup.group)
    pass.setVertexBuffer(0, this.vertices)
    pass.draw(6, this.vertices.size / 8)
  }
}
