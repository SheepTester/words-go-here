import { Block, getTexture, isOpaque } from './blocks.ts'

export const SIZE = 32

export const enum FaceDirection {
  BACK = 0,
  FRONT = 1,
  LEFT = 2,
  RIGHT = 3,
  BOTTOM = 4,
  TOP = 5
}

function showFace (block: Block, neighbor: Block | null): boolean {
  return block !== neighbor && !isOpaque(neighbor)
}

export class Chunk {
  #data: Uint8Array = new Uint8Array(SIZE * SIZE * SIZE)

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

  faces (target: number[] = []): number[] {
    for (let x = 0; x < SIZE; x++) {
      for (let y = 0; y < SIZE; y++) {
        for (let z = 0; z < SIZE; z++) {
          const block = this.block(x, y, z)
          const texture = getTexture(block)
          if (block === null || texture === null) {
            continue
          }
          if (showFace(block, this.block(x - 1, y, z))) {
            target.push(x, y, z, FaceDirection.LEFT, texture, 0, 0, 0)
          }
          if (showFace(block, this.block(x + 1, y, z))) {
            target.push(x, y, z, FaceDirection.RIGHT, texture, 0, 0, 0)
          }
          if (showFace(block, this.block(x, y - 1, z))) {
            target.push(x, y, z, FaceDirection.BOTTOM, texture, 0, 0, 0)
          }
          if (showFace(block, this.block(x, y + 1, z))) {
            target.push(x, y, z, FaceDirection.TOP, texture, 0, 0, 0)
          }
          if (showFace(block, this.block(x, y, z - 1))) {
            target.push(x, y, z, FaceDirection.BACK, texture, 0, 0, 0)
          }
          if (showFace(block, this.block(x, y, z + 1))) {
            target.push(x, y, z, FaceDirection.FRONT, texture, 0, 0, 0)
          }
        }
      }
    }
    return target
  }
}
