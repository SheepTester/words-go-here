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
    if (Number.isNaN(x) || Number.isNaN(y) ||
      !Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error('nan/inf spooted')
    }
    this.x = x
    this.y = y
    return this
  }

  add ({ x, y }) {
    if (Number.isNaN(x) || Number.isNaN(y) ||
      !Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error('nan/inf spooted')
    }
    this.x += x
    this.y += y
    return this
  }

  sub ({ x, y }) {
    if (Number.isNaN(x) || Number.isNaN(y) ||
      !Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error('nan/inf spooted')
    }
    this.x -= x
    this.y -= y
    return this
  }

  scale (factor) {
    if (Number.isNaN(factor) || !Number.isFinite(factor)) {
      throw new Error('nan/inf spooted')
    }
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

const GRAVITY = 9.8 // acceleration due to gravity (m/s^2)
const GROUND = 0 // Ground height (m)
const NODE_RADIUS = 0.1 // radius of a node (m)

class Node {
  // friction is coefficient of friction
  constructor(friction, mass = 10) {
    this.friction = friction
    this.mass = mass
    this.pos = new Vector2()
    this.vel = new Vector2()
    this.forces = new Vector2()
  }

  resetForces () {
    this.forces.set({x: 0, y: 0})
  }

  calcForces () {
    // Weight
    this.forces.add({x: 0, y: this.mass * GRAVITY})

    if (this.touchingGround()) {
      const normal = this.forces.y
      this.forces.add({x: 0, y: -normal})
      // Friction
      this.forces.add({
        x: -Math.sign(this.vel.x) * normal * this.friction,
        y: 0
      })
      // this.forces.add(this.vel.clone().unit().scale(-normal * this.friction))
    }
  }

  touchingGround () {
    // If mass and size are correlated, then should adjust radius here
    return this.pos.y >= GROUND - NODE_RADIUS
  }

  move (time) {
    // a = F/m
    const acceleration = this.forces.clone().scale(1 / this.mass)
    // x_f = x_i + v_i * t + a * t^2 / 2
    this.pos.add(this.vel.clone().scale(time))
      .add(acceleration.clone().scale(time * time / 2))
    // v_f = v_i + a * t
    this.vel.add(acceleration.scale(time))

    if (this.pos.y > GROUND - NODE_RADIUS) {
      this.pos.y = GROUND - NODE_RADIUS
    }
  }
}

class Muscle {
  // constant is spring constant
  // length is like the normal length
  constructor(constant, length, node1, node2) {
    this.constant = constant
    this.length = length
    this.damping = 1
    this.node1 = node1
    this.node2 = node2
  }

  applyForces () {
    // Vector from node 1 to 2's position
    const oneToTwo = this.node2.pos.clone().sub(this.node1.pos)
    const nodeLength = oneToTwo.length
    const displacement = nodeLength - this.length
    const force = this.constant * displacement
    // Apply elastic force in other's direction with magnitude of force
    this.node1.forces
      .add(oneToTwo.clone().unit().scale(force))
      .add(this.node1.vel.clone().scale(-this.damping))
    this.node2.forces
      .add(oneToTwo.clone().unit().scale(-force))
      .add(this.node2.vel.clone().scale(-this.damping))
  }
}

class Creature {
  constructor () {
    this.nodes = []
    this.muscles = []
  }

  addMuscle (newMuscle) {
    const { node1, node2 } = newMuscle
    for (const muscle of this.muscles) {
      if (muscle === newMuscle) {
        throw new Error('already have musccle!')
      }
      if (muscle.node1 === node1 && muscle.node2 === node2 ||
        muscle.node1 === node2 && muscle.node1 === mode1) {
        throw new Error('Nodes already connected by a muscle!')
      }
    }
    if (!this.nodes.includes(node1)) this.nodes.push(node1)
    if (!this.nodes.includes(node2)) this.nodes.push(node2)
    this.muscles.push(newMuscle)
    return this
  }

  sim (time) {
    for (const node of this.nodes) {
      node.resetForces()
    }
    for (const muscle of this.muscles) {
      muscle.applyForces()
    }
    for (const node of this.nodes) {
      node.calcForces()
      node.move(time)
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

    return
    c.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    c.lineWidth = 0.05
    c.beginPath()
    for (const node of this.nodes) {
      c.moveTo(...node.pos.comps)
      c.lineTo(...node.pos.clone().add(node.vel).comps)
      c.moveTo(...node.pos.comps)
      c.lineTo(...node.pos.clone().add(node.forces).comps)
    }
    c.stroke()
  }
}
