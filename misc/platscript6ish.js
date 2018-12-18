function platformer(player, getTile, isSolid) {
  let {x, y, xv, yv, width, height} = player;
  if (xv === 0 && yv === 0) {
    return { xv: 0, yv: 0, collided: false };
  }
  let anchorX = xv < 0 ? x : x + width;
  let anchorY = yv < 0 ? y : y + height;
  let nextX = xv < 0 ? Math.floor(anchorX + Number.EPSILON) : Math.ceil(anchorX - Number.EPSILON);
  let nextY = yv < 0 ? Math.floor(anchorY + Number.EPSILON) : Math.ceil(anchorY - Number.EPSILON);
  let slope = yv / xv;
  function getCollisions(minX, maxX, minY, maxY) {
    const collisions = [];
    for (let x = minX; x < maxX; x++) {
      for (let y = minY; y < maxY; y++) {
        const tile = getTile(x, y);
        if (isSolid(tile)) collisions.push(tile);
      }
    }
    return collisions;
  }
  let xCollided = null, yCollided = null, newXV = xv, newYV = yv;
  while (xv === 0 || !xCollided && (xv < 0 ? nextX - anchorX >= xv : nextX - anchorX <= xv)
      || !yCollided && (yv < 0 ? nextY - anchorY >= yv : nextY - anchorY <= yv)) {
    let localY = slope * (nextX - anchorX) + anchorY;
    while (!xCollided && (yv < 0 ? localY > nextY : localY < nextY) && (xv < 0 ? nextX - anchorX >= xv : nextX - anchorX <= xv)) {
      const x = xv < 0 ? nextX - 1 : nextX;
      const minY = yv < 0 ? Math.floor(localY) : Math.floor(localY - height);
      const maxY = yv < 0 ? Math.ceil(localY + height) : Math.ceil(localY);
      const collisions = getCollisions(x, x + 1, minY, maxY);
      if (collisions.length) {
        xCollided = collisions;
        newXV = nextX - anchorX;
        anchorX = xv < 0 ? nextX + width : nextX;
        xv = 0;
        slope = Infinity;
      }
      xv < 0 ? nextX-- : nextX++;
      localY = slope * (nextX - anchorX) + anchorY;
    }
    if (xCollided && (yCollided || yv === 0)) break;
    if (!yCollided) {
      if (yv < 0 ? nextY - anchorY >= yv : nextY - anchorY <= yv) {
        const localX = ((nextY - anchorY) / slope || 0) + anchorX;
        const minX = xv < 0 ? Math.floor(localX) : Math.floor(localX - width);
        const maxX = xv < 0 ? Math.ceil(localX + width) : Math.ceil(localX);
        const y = yv < 0 ? nextY - 1 : nextY;
        const collisions = getCollisions(minX, maxX, y, y + 1);
        if (collisions.length) {
          yCollided = collisions;
          newYV = nextY - anchorY;
          anchorY = yv < 0 ? nextY + height : nextY;
          nextY = Math.ceil(anchorY);
          yv = 0;
          slope = 0;
          if (xCollided || xv === 0) break;
        }
        yv < 0 ? nextY-- : nextY++;
      } else {
        break;
      }
    }
  }
  return { // TODO
    xv: newXV, yv: newYV,
    collided: xCollided || yCollided,
    xCollided: xCollided,
    yCollided: yCollided,
    collisions: [...(xCollided || []), ...(yCollided || [])]
  }
}
