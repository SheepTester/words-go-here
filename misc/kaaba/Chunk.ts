import { BlockId, isSolid } from './blocks.ts'

export const SIZE = 32

export const enum FaceDirection {
  TOP = 0,
  BOTTOM = 1,
  LEFT = 2,
  RIGHT = 3,
  BACK = 4,
  FRONT = 5
}

export type Face = [
  x: number,
  y: number,
  z: number,
  direction: FaceDirection,
  blockId: BlockId
]

export class Chunk {
  #data: Uint8Array = new Uint8Array(SIZE * SIZE * SIZE)

  /**
   * Gets the block at the given coordinates. If `block` is specified, it sets
   * the block at that position and returns the new ID.
   */
  block (x: number, y: number, z: number, block?: BlockId): BlockId {
    const index = (x * SIZE + y) * SIZE + z
    if (block !== undefined) {
      this.#data[index] = block
      return block
    } else {
      return this.#data[index]
    }
  }

  faces (): Face[] {
    const faces: Face[] = []
    for (const [i, block] of this.#data.entries()) {
      if (!isSolid(block)) {
        continue
      }
    }
    return faces
  }
}
