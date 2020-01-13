// Not a module because web workers don't support modules :/

class Vector2 {
  constructor (x = 0, y = 0) {
    this.set({ x, y })
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

const GRAVITY = 9.8 // Acceleration due to gravity (m/s^2)
const GROUND = 0 // Ground height (m)

class Node {
  // friction is coefficient of friction
  constructor ({ friction, mass = 1, radius = 0.2, initPos: [x, y] }) {
    this.friction = friction
    this.mass = mass
    this.radius = radius
    this.initPos = new Vector2(x, y)
    this.pos = new Vector2()
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

  mutate (intensity) {
    this.initPos.add({
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity
    })
    this.friction += (Math.random() * 2 - 1) * 0.1 * intensity
    if (this.friction > 4) this.friction = 4
    else if (this.friction < 0) this.friction = 0
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
}

class Muscle {
  // constant is spring constant
  // length is like the normal length
  constructor ({
    constant,
    damping = 1,
    compressLength,
    extendLength,
    compressTime,
    extendTime,
    node1,
    node2
  }) {
    this.constant = constant
    this.compressLength = compressLength
    this.extendLength = extendLength
    this.compressTime = compressTime
    this.extendTime = extendTime
    this.damping = damping
    this.node1 = node1
    this.node2 = node2
  }

  applyForces (clockTime) {
    // Vector from node 1 to 2's position
    const length = (this.compressTime > this.extendTime
      ? clockTime > this.extendTime && clockTime <= this.compressTime
      : clockTime <= this.compressTime || clockTime > this.extendTime)
      ? this.extendLength : this.compressLength
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

  mutate (intensity) {
    this.constant += (Math.random() * 2 - 1) * 0.9 * intensity
    if (this.constant < 0.01) this.constant = 0.01
    else if (this.constant > 0.08) this.constant = 0.08
  }

  clone () {
    return new Muscle(this.toJSON())
  }

  toJSON () {
    return {
      constant: this.constant,
      damping: this.damping,
      compressLength: this.compressLength,
      extendLength: this.extendLength,
      compressTime: this.compressTime,
      extendTime: this.extendTime,
      // nodes??
    }
  }
}

class Creature {
  constructor () {
    this.nodes = []
    this.muscles = []
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
      muscle.applyForces(this.clock % 1)
    }
    for (const node of this.nodes) {
      node.calcForces()
      node.move(time)
      // Reset for next frame
      node.resetForces()
    }
  }

  render (c) {
    for (const muscle of this.muscles) {
      const { node1, node2, length, constant } = muscle
      const displacement = (node1.pos.clone().sub(node2.pos).length - length)
      c.strokeStyle = `rgb(129, 85, 49, ${0.9 - 0.7 / (constant / 10 + 1)})`
      c.lineWidth = 0.05 / (displacement / length + 1) + 0.02
      c.beginPath()
      c.moveTo(...node1.pos.comps)
      c.lineTo(...node2.pos.comps)
      c.stroke()
    }

    for (const node of this.nodes) {
      c.fillStyle = `hsl(0, 50%, ${100 / (node.friction + 1)}%)`
      const { x, y } = node.pos
      c.beginPath()
      c.moveTo(x + NODE_RADIUS, y)
      c.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI)
      c.fill()
    }
  }
}
