// https://github.com/fenomas/fast-voxel-raycast/blob/master/index.js

export type Vector3 = [x: number, y: number, z: number]

export type RaycastResult = {
  block: Vector3
  position: Vector3
  /** May be [0, 0, 0] if the starting position is inside a block */
  normal: Vector3
}

/**
 * @param direction Should be normalized.
 * @param maxDistance Defaults to 64.
 */
export function * raycast<T> (
  getVoxel: (x: number, y: number, z: number) => T,
  [px, py, pz]: Vector3,
  [dx, dy, dz]: Vector3,
  maxDistance = 64
): Generator<RaycastResult> {
  let t = 0
  let ix = Math.floor(px)
  let iy = Math.floor(py)
  let iz = Math.floor(pz)
  const stepx = Math.sign(dx)
  const stepy = Math.sign(dy)
  const stepz = Math.sign(dz)
  // dx, dy, dz are already normalized
  const txDelta = Math.abs(1 / dx)
  const tyDelta = Math.abs(1 / dy)
  const tzDelta = Math.abs(1 / dz)
  // location of nearest voxel boundary, in units of t
  let txMax =
    txDelta < Infinity
      ? txDelta * (stepx > 0 ? ix + 1 - px : px - ix)
      : Infinity
  let tyMax =
    tyDelta < Infinity
      ? tyDelta * (stepy > 0 ? iy + 1 - py : py - iy)
      : Infinity
  let tzMax =
    tzDelta < Infinity
      ? tzDelta * (stepz > 0 ? iz + 1 - pz : pz - iz)
      : Infinity
  let steppedIndex: 'x' | 'y' | 'z' | null = null

  // main loop along raycast vector
  while (t <= maxDistance) {
    // exit check
    const b = getVoxel(ix, iy, iz)
    if (b) {
      yield {
        block: [ix, iy, iz],
        position: [px + t * dx, py + t * dy, pz + t * dz],
        normal: [
          steppedIndex === 'x' ? -stepx : 0,
          steppedIndex === 'y' ? -stepy : 0,
          steppedIndex === 'z' ? -stepz : 0
        ]
      }
    }

    // advance t to next nearest voxel boundary
    switch (Math.min(txMax, tyMax, tzMax)) {
      case txMax:
        ix += stepx
        t = txMax
        txMax += txDelta
        steppedIndex = 'x'
        break
      case tyMax:
        iy += stepy
        t = tyMax
        tyMax += tyDelta
        steppedIndex = 'y'
        break
      case tzMax:
        iz += stepz
        t = tzMax
        tzMax += tzDelta
        steppedIndex = 'z'
        break
      default:
        throw new Error('The minimum is none of these. ??')
    }
  }
}
