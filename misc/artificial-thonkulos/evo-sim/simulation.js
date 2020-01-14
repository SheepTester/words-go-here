// Not a module because web workers don't support modules :/

class Vector2 {
  constructor (x = 0, y = 0) {
    this.set({ x, y })
  }

  get lengthSquared () {
    return this.x * this.x + this.y * this.y
  }

  get length () {
    if (this._length === undefined) {
      this._length = Math.hypot(this.x, this.y)
    }
    return this._length
  }

  // components
  get comps () {
    return [this.x, this.y]
  }

  set ({ x, y }) {
    this.x = x
    this.y = y
    return this
  }

  add ({ x, y }) {
    this.x += x
    this.y += y
    return this
  }

  sub ({ x, y }) {
    this.x -= x
    this.y -= y
    return this
  }

  scale (factor) {
    this.x *= factor
    this.y *= factor
    return this
  }

  unit () {
    return this.scale(1 / this.length)
  }

  clone () {
    return new Vector2(this.x, this.y)
  }
}

const mutables = {
  x: { baseDiff: 0.5 }, // Node initial position x
  y: { baseDiff: 0.5 }, // Node initial position y
  friction: { baseDiff: 0.1, min: 0, max: 1 }, // Node friction constant
  spring: { baseDiff: 0.9, min: 0.01, max: 0.08 }, // Muscle spring constant
  length: { min: 0.4, max: 2 }, // Muscle length
  heartbeat: { baseDiff: 0.25, min: 0.01 }
}
function randomMutable (random, type) {
  const { min, max } = mutables[type]
  return random.random(min, max)
}
function mutate (random, type, num, intensity) {
  const { min = -Infinity, max = Infinity, baseDiff = 1 } = mutables[type]
  num += random.random(-1, 1) * baseDiff * intensity
  return num > max ? max : num < min ? min : num
}

const GRAVITY = 9.8 // Acceleration due to gravity (m/s^2)
const GROUND = 0 // Ground height (m)

class Node {
  // friction is coefficient of friction
  constructor ({ friction, mass = 1, radius = 0.2, initPos: [x, y] }) {
    this.friction = friction
    this.mass = mass
    this.radius = radius
    this.initPos = new Vector2(x, y)
    this.pos = new Vector2(x, y)
    this.vel = new Vector2()
    this.forces = new Vector2()
  }

  reset () {
    this.pos.set(this.initPos)
    this.vel.set({ x: 0, y: 0 })
    this.resetForces()
  }

  resetForces () {
    this.forces.set({ x: 0, y: 0 })
  }

  calcForces () {
    // Weight
    this.forces.add({ x: 0, y: this.mass * GRAVITY })

    if (this.touchingGround()) {
      const normal = this.forces.y
      this.forces.add({ x: 0, y: -normal })
      // Friction
      this.forces.add({
        x: -Math.sign(this.vel.x) * normal * this.friction,
        y: 0
      })
    }
  }

  touchingGround () {
    // If mass and size are correlated, then should adjust radius here
    return this.pos.y >= GROUND - this.radius
  }

  move (time) {
    // a = F/m
    const acceleration = this.forces.clone().scale(1 / this.mass)
    // x_f = x_i + v_i * t + a * t^2 / 2
    this.pos.add(this.vel.clone().scale(time))
      .add(acceleration.clone().scale(time * time / 2))
    // v_f = v_i + a * t
    this.vel.add(acceleration.scale(time))

    if (this.pos.y > GROUND - this.radius) {
      this.pos.y = GROUND - this.radius
    }
  }

  mutate (random, intensity) {
    this.initPos.set({
      x: mutate(random, 'x', this.initPos.x, intensity),
      y: mutate(random, 'y', this.initPos.y intensity)
    })
    this.friction = mutate(random, 'friction', this.friction, intensity)
  }

  clone () {
    return new Node(this.toJSON())
  }

  toJSON () {
    return {
      friction: this.friction,
      mass: this.mass,
      radius: this.radius,
      initPos: this.initPos.comps
    }
  }

  static makeRandom (random, x, y) {
    return new Node({
      friction: randomMutable(random, 'friction'),
      initPos: [x, y]
    })
  }
}

class Muscle {
  // constant is spring constant
  // length is like the normal length
  constructor ({
    constant,
    damping = 1,
    contractLength,
    extendLength,
    contractTime,
    extendTime,
    node1,
    node2
  }) {
    this.constant = constant
    this.contractLength = contractLength
    this.extendLength = extendLength
    this.contractTime = contractTime
    this.extendTime = extendTime
    this.damping = damping
    this.node1 = node1
    this.node2 = node2
  }

  extending (clockTime) {
    return this.contractTime > this.extendTime
      ? clockTime > this.extendTime && clockTime <= this.contractTime
      : clockTime <= this.contractTime || clockTime > this.extendTime
  }

  applyForces (clockTime) {
    // Vector from node 1 to 2's position
    const length = this.extending(clockTime) ? this.extendLength : this.contractLength
    const oneToTwo = this.node2.pos.clone().sub(this.node1.pos)
    const nodeLength = oneToTwo.length
    const displacement = nodeLength - length
    const force = this.constant * displacement
    // Apply elastic force in other's direction with magnitude of force
    this.node1.forces
      .add(oneToTwo.clone().unit().scale(force))
      .add(this.node1.vel.clone().scale(-this.damping))
    this.node2.forces
      .add(oneToTwo.clone().unit().scale(-force))
      .add(this.node2.vel.clone().scale(-this.damping))
  }

  mutate (random, intensity) {
    this.constant = mutate(random, 'spring', this.constant, intensity)
    const length1 = mutate(random, 'length', this.contractLength, intensity)
    const length2 = mutate(random, 'length', this.extendLength, intensity)
    this.contractLength = Math.min(length1, length2)
    // TODO: Consider adding the max muscle thing: contractLength * (1 + 0.025 / constant)
    this.extendLength = Math.max(length1, length2)
    let timeDiff = Math.abs(this.contractTime - this.extendTime)
    timeDiff = Math.min(timeDiff, 1 - timeDiff) // Time is circular
    if (random.random() < 0.5) {
      this.contractTime += timeDiff * random.random(-1, 1) * intensity + 1
      this.contractTime %= 1
    } else {
      this.extendTime += timeDiff * random.random(-1, 1) * intensity + 1
      this.extendTime %= 1
    }
  }

  clone () {
    return new Muscle(this.toJSON())
  }

  toJSON () {
    return {
      constant: this.constant,
      damping: this.damping,
      contractLength: this.contractLength,
      extendLength: this.extendLength,
      contractTime: this.contractTime,
      extendTime: this.extendTime
    }
  }

  static makeRandom (random, node1, node2) {
    const distance = node1.initPos.clone().sub(node2.initPos).length
    const ratio = random.random(0.01, 0.2)
    return new Muscle({
      constant: random(0.02, 0.08),
      contractLength: distance * (1 - ratio),
      extendLength: distance * (1 + ratio),
      contractTime: random.random(),
      extendTime: random.random(),
      node1,
      node2
    })
  }
}

class Creature {
  constructor ({ nodes = [], muscles = [], mutability, heartbeat } = {}) {
    this.nodes = nodes.map(node => new Node(node))
    this.muscles = muscles.map(({ node1, node2, ...muscle }) => new Muscle({
      node1: this.nodes[node1],
      node2: this.nodes[node2],
      ...muscle
    }))
    this.mutability = mutability
    this.heartbeat = heartbeat
  }

  fix () {
    for (let i = 0; i < this.muscles.length; i++) {
      const { node1, node2 } = this.muscles[i]
      for (let j = 0; j < i; j++) {
        const muscle = this.muscles[j]
        if (muscle.node1 === node1 && muscle.node2 === node2 ||
          muscle.node1 === node2 && muscle.node2 === mode1) {
          this.muscles.splice(i, 1)
          i--
          break
        }
      }
    }
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      if (!this.muscles.some(({ node1, node2 }) => node1 === node || node2 === node)) {
        this.nodes.splice(i, 1)
        i--
      }
    }
  }

  reset () {
    this.clock = 0
    for (const node of this.nodes) {
      node.reset()
    }
  }

  sim (time) {
    this.clock += time
    for (const muscle of this.muscles) {
      muscle.applyForces(this.clock / this.heartbeat % 1)
    }
    for (const node of this.nodes) {
      node.calcForces()
      node.move(time)
      // Reset for next frame
      node.resetForces()
    }
  }

  render (ctx) {
    for (const muscle of this.muscles) {
      const { node1, node2, constant } = muscle
      const displacement = (node1.pos.clone().sub(node2.pos).length - length)
      ctx.strokeStyle = `rgb(129, 85, 49, ${0.9 - 0.7 / (constant / 10 + 1)})`
      ctx.lineWidth = muscle.extending(this.clock / this.heartbeat % 1) ? 0.05 : 0.02
      ctx.beginPath()
      ctx.moveTo(...node1.pos.comps)
      ctx.lineTo(...node2.pos.comps)
      ctx.stroke()
    }

    for (const node of this.nodes) {
      ctx.fillStyle = `hsl(0, 50%, ${100 / (node.friction + 1)}%)`
      const { x, y } = node.pos
      ctx.beginPath()
      ctx.moveTo(x + NODE_RADIUS, y)
      ctx.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  addRandomNode (random) {
    const baseNode = this.nodes[Math.floor(random.random(0, this.nodes.length))]
    const angle = random.random(0, 2 * Math.PI)
    const displacement = Math.sqrt(random.random(0, 0.25))
    const newNode = Node.makeRandom(
      random,
      baseNode.initPos.x + Math.cos(angle) * displacement,
      baseNode.initPos.y + Math.sin(angle) * displacement
    )
    let closestDist = Infinity
    let closestNode = null
    for (const node of this.nodes) {
      if (node === baseNode) continue
      const dist = node.initPos.sub(newNode.initPos).lengthSquared
      if (dist < closestDist) {
        closestDist = dist
        closestNode = node
      }
    }

    this.nodes.push(newNode)
    this.muscles.push(Muscle.makeRandom(random, baseNode, newNode))
    this.muscles.push(Muscle.makeRandom(random, closestNode, newNode))
  }

  removeRandomNode (random) {
    const index = random.random(0, this.nodes.length)
    const node = this.nodes[index]
    this.nodes.splice(index, 1)
    for (let i = 0; i < this.muscles.length; i++) {
      const muscle = this.muscles[i]
      if (muscle.node1 === node || muscle.node2 === node) {
        this.muscles.splice(i, 1)
        i--
      }
    }
  }

  mutate (random) {
    this.heartbeat = mutate(random, 'heartbeat', this.heartbeat, this.mutability)
    for (const node of this.nodes) {
      node.mutate(random, this.mutability)
    }
    for (const muscle of this.muscles) {
      muscle.mutate(random, this.mutability)
    }

    if (this.nodes.length < 3 || random.random() < 0.04 * this.mutability) {
      this.addRandomNode(random)
    }
    if (random.random() < 0.04 * this.mutability) {
      const index = Math.floor(random.random(0, this.nodes.length - 1))
      this.muscles.push(Muscle.makeRandom(
        random,
        this.nodes[index],
        this.nodes[Math.floor(random.random(index + 1, this.nodes.length))]
      ))
    }
    if (this.muscles.length > 3 && random.random() < 0.04 * this.mutability) {
      this.removeRandomNode(random)
    }
    if (this.muscles.length > 1 && random.random() < 0.04 * this.mutability) {
      this.muscles.splice(random.random(0, this.muscles.length), 1)
    }
    this.fix()

    this.mutability *= random.random(0.8, 1.25)
    if (this.mutability > 2) this.mutability = 2
  }

  clone () {
    return new Creature(this.toJSON())
  }

  toJSON () {
    return {
      nodes: this.nodes.map(node => node.toJSON()),
      muscles: this.muscles.map(muscle => {
        const obj = muscle.toJSON()
        obj.node1 = this.nodes.indexOf(muscle.node1)
        obj.node2 = this.nodes.indexOf(muscle.node2)
        return obj
      }),
      mutability: this.mutability,
      heartbeat: this.heartbeat
    }
  }

  static makeRandom (random) {
    const nodes = new Array(Math.floor(random.random(3, 6)))
    const muscles = new Array(Math.floor(random.random(nodes.length - 1, (nodes.length - 2) * 3)))
    for (let i = 0; i < nodes.length; i++) {
      nodes[i] = Node.makeRandom(random, random.random(-1, 1), random.random(-1, 1))
    }
    for (let i = 0; i < muscles.length; i++) {
      let node1, node2
      if (i < nodes.length - 1) {
        node1 = nodes[i]
        node2 = nodes[i + 1]
      } else {
        const index = Math.floor(random.random(0, nodes.length - 1))
        node1 = nodes[index]
        node2 = nodes[Math.floor(random.random(index + 1, nodes.length))]
      }
      muscles[i] = Muscle.makeRandom(random, node1, node2)
    }
    const creature = new Creature({
      nodes,
      muscles,
      heartbeat: random.random(0.5, 1.5),
      mutability: 1
    })
    creature.fix()
    return creature
  }
}
