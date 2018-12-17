function platformer(player, getTile, isSolid) {
  const {x, y, xv, yv, width, height} = player;
  if (xv === 0 && yv === 0) {
    return { xv: 0, yv: 0, collided: false };
  }
  const anchorX = xv < 0 ? x : x + width;
  const anchorY = yv < 0 ? y : y + height;
  let nextX = (xv < 0 ? Math.floor : Math.ceil)(anchorX); // maybe calc. offset instead of + width
  let nextY = (yv < 0 ? Math.floor : Math.ceil)(anchorY);
  const slope = yv / xv;
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
  let collided = null, newXV = xv, newYV = yv, axis;
  while (xv === 0 || (xv < 0 ? nextX - anchorX >= xv : nextX - anchorX <= xv)
      || (yv < 0 ? nextY - anchorY >= yv : nextY - anchorY <= yv)) {
    let localY = slope * (nextX - anchorX) + anchorY;
    while ((yv < 0 ? localY > nextY : localY < nextY) && (xv < 0 ? nextX - anchorX >= xv : nextX - anchorX <= xv)) {
      const x = xv < 0 ? nextX - 1 : nextX;
      const minY = yv < 0 ? Math.floor(localY) : Math.floor(localY - height);
      const maxY = yv < 0 ? Math.ceil(localY + height) : Math.ceil(localY);
      const collisions = getCollisions(x, x + 1, minY, maxY);
      if (collisions.length) {
        collided = collisions;
        newXV = nextX - anchorX;
        newYV = localY - anchorY;
        axis = 'x';
        break;
      }
      xv < 0 ? nextX-- : nextX++;
      localY = slope * (nextX - anchorX) + anchorY;
    }
    if (!collided && (yv < 0 ? nextY - anchorY >= yv : nextY - anchorY <= yv)) {
      const localX = (nextY - anchorY) / slope + anchorX;
      const minX = xv < 0 ? Math.floor(localX) : Math.floor(localX - width);
      const maxX = xv < 0 ? Math.ceil(localX + width) : Math.ceil(localX);
      const y = yv < 0 ? nextY - 1 : nextY;
      const collisions = getCollisions(minX, maxX, y, y + 1);
      if (collisions.length) {
        collided = collisions;
        newXV = localX - anchorX;
        newYV = nextY - anchorY;
        axis = 'y';
        break;
      }
      yv < 0 ? nextY-- : nextY++;
    } else {
      break;
    }
  }
  return { // TODO
    xv: newXV, yv: newYV,
    collided: collided,
    axis: axis
  }
}
