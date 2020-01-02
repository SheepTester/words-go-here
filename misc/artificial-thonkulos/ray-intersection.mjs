import { Vector2 } from './vectors.mjs'

export function segmentIntersection (origin, rayDir, a, b, isRay = false) {
  // Ray (for t_r >= 0):
  // <x, y> = origin + rayDir * t_r
  // Segment (for t_s: [0, 1]):
  // <x, y> = a + segmentDir * t_s
  // where segmentDir = b - a
  const segmentDir = b.clone().sub(a)
  // At the intersection, origin + rayDir * t_r = a + segmentDir * t_s
  // This can break down into two equations, one for each component
  // origin.x + rayDir.x * t_r = a.x + segmentDir.x * t_s (same for y)
  // t_r = (a.x + segmentDir.x * t_s - origin.x) / rayDir.x (same for y)
  // (segmentDir.x * t_s + (a.x - origin.x)) / rayDir.x
  // = (segmentDir.y * t_s + (a.y - origin.y)) / rayDir.y
  // rayDir.y * segmentDir.x * t_s + rayDir.y * (a.x - origin.x)
  // = rayDir.x * segmentDir.y * t_s + rayDir.x * (a.y - origin.y)
  // t_s * (rayDir.y * segmentDir.x - rayDir.x * segmentDir.y)
  // = rayDir.x * (a.y - origin.y) - rayDir.y * (a.x - origin.x)
  // t_s = (rayDir.x * (a.y - origin.y) - rayDir.y * (a.x - origin.x))
  //   / (rayDir.y * segmentDir.x - rayDir.x * segmentDir.y)
  const segmentT = (rayDir.x * (a.y - origin.y) - rayDir.y * (a.x - origin.x)) /
    (rayDir.y * segmentDir.x - rayDir.x * segmentDir.y)
  // If t_s is outside of [0, 1], then the intersection was not in the segment
  if (segmentT < 0 || segmentT > 1) return null
  // Recall from before that
  // t_r = (a.x + segmentDir.x * t_s - origin.x) / rayDir.x
  const rayT = (a.x + segmentDir.x * segmentT - origin.x) / rayDir.x
  // If t_r < 0, then the intersection was not on the ray (if it's a ray)
  if (isRay && rayT < 0) return null
  // Get point at t_r
  return {
    segmentT,
    rayT,
    point: origin.clone().add(rayDir.clone().scale(rayT))
  }
}

export function rayPolylineIntersection (origin, direction, polyline) {
  let closestIntersection = null
  let closestDistance = Infinity
  for (let i = 1; i < polyline.length; i++) {
    if (polyline[i - 1] && polyline[i]) {
      const intersection = segmentIntersection(origin, direction, polyline[i - 1], polyline[i], true)
      if (!intersection) continue
      const { point } = intersection
      const distance = point.clone().sub(origin).length
      if (distance < closestDistance) {
        closestDistance = distance
        closestIntersection = point
      }
    }
  }
  return closestIntersection
}

/**
 * Get closest point in a polyline to a point
 */
export function getClosestToPolyline (point, polyline) {
  let closest = { distance: Infinity }
  let segments = 0
  for (let i = 1; i < polyline.length; i++) {
    const a = polyline[i - 1]
    const b = polyline[i]
    if (a && b) {
      const normal = new Vector2(a.y - b.y, b.x - a.x)
      const intersection = segmentIntersection(point, normal, a, b, false)
      if (intersection) {
        const {
          segmentT,
          point: intersectionPoint
        } = intersection
        const distance = intersectionPoint.clone().sub(point).length
        if (distance < closest.distance) {
          closest = {
            t: segments + segmentT,
            point: intersectionPoint,
            distance
          }
        }
      } else {
        // Try using the endpoints of the segment if the normal doesn't intersect
        // the segment
        const distanceA = a.clone().sub(point).length
        if (distanceA < closest.distance) {
          closest = {
            t: segments,
            point: a.clone(),
            distance: distanceA
          }
          // Continue to check B in case it's closer
        }
        const distanceB = b.clone().sub(point).length
        if (distanceB < closest.distance) {
          closest = {
            t: segments,
            point: b.clone(),
            distance: distanceB
          }
        }
      }
      segments++
    }
  }
  return closest.point ? closest : null
}
