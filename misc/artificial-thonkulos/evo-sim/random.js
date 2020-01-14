// https://stackoverflow.com/a/47593316

function xmur3 (str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = h << 13 | h >>> 19
  }
  return () => {
    h = Math.imul(h ^ h >>> 16, 2246822507)
    h = Math.imul(h ^ h >>> 13, 3266489909)
    return (h ^= h >>> 16) >>> 0
  }
}

function sfc32 (a, b, c, d) {
  return () => {
    a >>>= 0
    b >>>= 0
    c >>>= 0
    d >>>= 0
    let t = (a + b) | 0
    a = b ^ b >>> 9
    b = c + (c << 3) | 0
    c = (c << 21 | c >>> 11)
    d = d + 1 | 0
    t = t + d | 0
    c = c + t | 0
    return (t >>> 0) / 4294967296
  }
}

class SeededRandom {
  constructor (key) {
    const seeder = xmur3(key)
    this._random = sfc32(seeder(), seeder(), seeder(), seeder())
  }

  random (from = 0, to = 1) {
    return this._random() * (to - from) + from
  }
}
