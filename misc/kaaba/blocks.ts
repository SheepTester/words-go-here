export type BlockId = number

export const enum Block {
  AIR = 0,
  STONE = 1
}

export function isSolid (block: BlockId): boolean {
  return block === Block.STONE
}
