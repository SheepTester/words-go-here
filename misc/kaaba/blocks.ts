export const enum Block {
  AIR = 0,
  STONE = 1,
  GLASS = 2
}

const textures: Partial<Record<Block, number>> = {
  [Block.STONE]: 0,
  [Block.GLASS]: 1
}

export function isOpaque (block: Block | null): boolean {
  return block === Block.STONE
}

export function getTexture (block: Block | null): number | null {
  return block !== null ? textures[block] ?? null : null
}
