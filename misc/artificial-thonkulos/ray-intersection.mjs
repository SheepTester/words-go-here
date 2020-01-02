export function raySegmentIntersection (origin, rayDir, a, b) {
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
  // If t_r < 0, then the intersection was not on the ray
  if (rayT < 0) return null
  // Get point at t_r
  return origin.clone().add(rayDir.clone().scale(rayT))
}

export function rayPolygonIntersection (origin, direction, polygon) {
  let closestIntersection = null
  let closestDistance = Infinity
  for (let i = 1; i < polygon.length; i++) {
    if (polygon[i - 1] && polygon[i]) {
      const point = raySegmentIntersection(origin, direction, polygon[i - 1], polygon[i])
      if (!point) continue
      const distance = point.clone().sub(origin).length
      if (distance < closestDistance) {
        closestDistance = distance
        closestIntersection = point
      }
    }
  }
  return closestIntersection
}
