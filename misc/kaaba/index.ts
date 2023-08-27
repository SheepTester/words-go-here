/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import '@webgpu/types'
import { init } from './webgpu.ts'

const canvas = document.getElementById('canvas')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new TypeError('Failed to find the canvas element.')
}
const context = canvas.getContext('webgpu')
if (!context) {
  throw new TypeError('Failed to get WebGPU canvas context.')
}
if (!navigator.gpu) {
  throw new TypeError('Client does not support WebGPU. Sad!')
}
const format = navigator.gpu.getPreferredCanvasFormat()
const { device, render } = await init(format)
context.configure({ device, format })
render(context.getCurrentTexture().createView())
