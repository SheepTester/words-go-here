/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import '@webgpu/types'
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
  render(context.getCurrentTexture().createView(), aspectRatio)
}).observe(canvas)

function paint () {
  if (aspectRatio) {
    render(context.getCurrentTexture().createView(), aspectRatio)
  }
  requestAnimationFrame(paint)
}
// paint()
