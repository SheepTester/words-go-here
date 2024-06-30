// https://github.com/fenomas/fast-voxel-raycast/blob/master/index.js
/**
 * `dx`, `dy`, and `dz` should represent a normalized vector
 */
export function traceRay_impl<T> (
  getVoxel: (x: number, y: number, z: number) => T,
  px: number,
  py: number,
  pz: number,
  dx: number,
  dy: number,
  dz: number,
  max_d = 64,
  hit_pos?: [x: number, y: number, z: number],
  hit_norm?: [x: number, y: number, z: number]
): T | 0 {
  // consider raycast vector to be parametrized by t
  //   vec = [px,py,pz] + t * [dx,dy,dz]

  // algo below is as described by this paper:
  // http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf

  var t = 0.0,
    floor = Math.floor,
    ix = floor(px) | 0,
    iy = floor(py) | 0,
    iz = floor(pz) | 0,
    stepx = dx > 0 ? 1 : -1,
    stepy = dy > 0 ? 1 : -1,
    stepz = dz > 0 ? 1 : -1,
    // dx,dy,dz are already normalized
    txDelta = Math.abs(1 / dx),
    tyDelta = Math.abs(1 / dy),
    tzDelta = Math.abs(1 / dz),
    xdist = stepx > 0 ? ix + 1 - px : px - ix,
    ydist = stepy > 0 ? iy + 1 - py : py - iy,
    zdist = stepz > 0 ? iz + 1 - pz : pz - iz,
    // location of nearest voxel boundary, in units of t
    txMax = txDelta < Infinity ? txDelta * xdist : Infinity,
    tyMax = tyDelta < Infinity ? tyDelta * ydist : Infinity,
    tzMax = tzDelta < Infinity ? tzDelta * zdist : Infinity,
    steppedIndex = -1

  // main loop along raycast vector
  while (t <= max_d) {
    // exit check
    var b = getVoxel(ix, iy, iz)
    if (b) {
      if (hit_pos) {
        hit_pos[0] = px + t * dx
        hit_pos[1] = py + t * dy
        hit_pos[2] = pz + t * dz
      }
      if (hit_norm) {
        hit_norm[0] = hit_norm[1] = hit_norm[2] = 0
        if (steppedIndex === 0) hit_norm[0] = -stepx
        if (steppedIndex === 1) hit_norm[1] = -stepy
        if (steppedIndex === 2) hit_norm[2] = -stepz
      }
      return b
    }

    // advance t to next nearest voxel boundary
    if (txMax < tyMax) {
      if (txMax < tzMax) {
        ix += stepx
        t = txMax
        txMax += txDelta
        steppedIndex = 0
      } else {
        iz += stepz
        t = tzMax
        tzMax += tzDelta
        steppedIndex = 2
      }
    } else {
      if (tyMax < tzMax) {
        iy += stepy
        t = tyMax
        tyMax += tyDelta
        steppedIndex = 1
      } else {
        iz += stepz
        t = tzMax
        tzMax += tzDelta
        steppedIndex = 2
      }
    }
  }

  // no voxel hit found
  if (hit_pos) {
    hit_pos[0] = px + t * dx
    hit_pos[1] = py + t * dy
    hit_pos[2] = pz + t * dz
  }
  if (hit_norm) {
    hit_norm[0] = hit_norm[1] = hit_norm[2] = 0
  }

  return 0
}
