/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { Vector2 } from 'https://sheeptester.github.io/javascripts/Vector2.js'
import '@webgpu/types'
// _ @deno-types="npm:wgpu-matrix"
import { mat4 } from 'wgpu-matrix'
import { init } from './webgpu.ts'

function fail (error: Error): never {
  throw error
}

const canvas = document.getElementById('canvas')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new TypeError('Failed to find the canvas element.')
}
const context =
  canvas.getContext('webgpu') ??
  fail(new TypeError('Failed to get WebGPU canvas context.'))
if (!navigator.gpu) {
  throw new TypeError('Client does not support WebGPU. Sad!')
}
const format = navigator.gpu.getPreferredCanvasFormat()
const { device, render } = await init(format)
context.configure({ device, format })
let aspectRatio: number | null = null
// The view stores the size of the canvas
new ResizeObserver(([{ contentBoxSize }]) => {
  const [{ blockSize, inlineSize }] = contentBoxSize
  canvas.width = inlineSize
  canvas.height = blockSize
  aspectRatio = inlineSize / blockSize
}).observe(canvas)

const keys: Record<string, boolean> = {}
document.addEventListener('keydown', e => {
  if (e.target !== document && e.target !== document.body) {
    return
  }
  keys[e.key.toLowerCase()] = true
  if (document.pointerLockElement !== canvas) {
    e.preventDefault()
  }
})
document.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false
})

canvas.addEventListener('click', () => {
  canvas.requestPointerLock()
})
canvas.addEventListener('mousemove', e => {
  if (document.pointerLockElement !== canvas) {
    return
  }
  player.yaw += e.movementX / 500
  player.pitch += e.movementY / 500
})

/** In m/s^2. */
const MOVE_ACCEL = 50
/** In 1/s. F = kv. */
const FRICTION_COEFF = -5
const player = {
  x: 0,
  xv: 0,
  y: 32,
  yv: 0,
  z: 16,
  zv: 0,
  /** Head shake direction (rotation about y-axis) */
  yaw: 0,
  /** Nod direction (rotation about x-axis) */
  pitch: 0,
  /** Tilt (rotate about z-axis) */
  roll: 0
}
/** Accelerates and updates player position along the specified axis. */
function moveAxis<Axis extends 'x' | 'y' | 'z'> (
  axis: Axis,
  acceleration: number,
  time: number,
  userMoving: boolean
): void {
  let endVel = player[`${axis}v`] + acceleration * time
  if (!userMoving && Math.sign(player[`${axis}v`]) !== Math.sign(endVel)) {
    // Friction has set velocity to 0
    endVel = 0
  }
  // displacement = average speed * time
  player[axis] += ((player[`${axis}v`] + endVel) / 2) * time
  player[`${axis}v`] = endVel
}
let lastTime = Date.now()
function paint () {
  const now = Date.now()
  const elapsed = Math.min(now - lastTime, 100) / 1000
  lastTime = now

  // Using y component to mean z-axis

  // Move against direction of velocity
  const velocity = new Vector2(player.xv, player.zv)
  const acceleration =
    velocity.lengthSquared > 0 ? velocity.scale(FRICTION_COEFF) : new Vector2()

  const direction = new Vector2(0, 0)
  if (keys.a || keys.arrowleft) {
    direction.add({ x: -1 })
  }
  if (keys.d || keys.arrowright) {
    direction.add({ x: 1 })
  }
  if (keys.w || keys.arrowup) {
    direction.add({ y: -1 })
  }
  if (keys.s || keys.arrowdown) {
    direction.add({ y: 1 })
  }
  const moving = direction.lengthSquared > 0
  if (moving) {
    acceleration.add(direction.unit().scale(MOVE_ACCEL).rotate(player.yaw))
  }
  let yAccel = player.yv * FRICTION_COEFF
  if (keys[' ']) {
    yAccel += MOVE_ACCEL
  }
  if (keys.shift) {
    yAccel -= MOVE_ACCEL
  }

  moveAxis('x', acceleration.x, elapsed, moving)
  moveAxis('z', acceleration.y, elapsed, moving)
  moveAxis('y', yAccel, elapsed, keys[' '] || keys.shift)

  if (aspectRatio) {
    render(
      context.getCurrentTexture(),
      mat4.translate(
        mat4.rotateY(
          mat4.rotateX(mat4.rotationZ(player.roll), player.pitch),
          player.yaw
        ),
        [-player.x, -player.y, -player.z]
      )
    )
  }
  requestAnimationFrame(paint)
}
paint()
