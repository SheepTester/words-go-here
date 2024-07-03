export const enum Block {
  AIR = 0,
  STONE = 1,
  GLASS = 2,
  WHITE = 3
}

const textures: Partial<Record<Block, number>> = {
  [Block.STONE]: 0,
  [Block.GLASS]: 1,
  [Block.WHITE]: 2
}

export function isOpaque (block: Block): boolean {
  return block === Block.STONE || block === Block.WHITE
}

export function isSolid (block: Block): boolean {
  return block !== Block.AIR
}

export function getTexture (block: Block): number | null {
  return textures[block] ?? null
}
