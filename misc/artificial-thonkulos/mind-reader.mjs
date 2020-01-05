import { sigmoid } from './utils.mjs'

export class MindReader {
  constructor (options = {}) {
    this.options = options

    const {
      brainType
    } = options
    this.layers = brainType.layers
    this.bias = brainType.bias
    this.fn = brainType.fn
    this.maxLayers = Math.max(...brainType.layers)
  }

  getExpectedSize () {
    const { options, layers, maxLayers } = this
    const {
      nodeRadius = 20,
      nodeSpacing = 5,
      layerSpacing = 60
    } = options
    const nodeDiameter = nodeRadius * 2
    return {
      width: layers.length * nodeDiameter + (layers.length - 1) * layerSpacing,
      height: maxLayers * nodeDiameter + (maxLayers - 1) * nodeSpacing
    }
  }

  render (ctx, weights, inputs) {
    const { options, bias, layers, maxLayers, fn } = this
    if (inputs.length !== layers[0]) {
      throw new Error('Wucky: The Brain is picky and wants a specific number of inputs.')
    }
    const {
      nodeRadius = 20,
      nodeSpacing = 5, // Distance between the inner sides of nodes in the same layer
      layerSpacing = 60, // Distance between the inner sides of nodes of two layers
      nodeWidth = 2, // Stroke width of node circle
      nodeColour = '#fff', // Node stroke colour
      textColour = '#fff', // Text colour
      connectionWidth = 2,
      connectionStyle = '#f0f',
      labelConnections = true,
      x = 0,
      y = 0
    } = options
    const nodeDiameter = nodeRadius * 2
    const layerDistance = layerSpacing + nodeDiameter
    const height = maxLayers * nodeDiameter + (maxLayers - 1) * nodeSpacing
    const baseY = y + height / 2

    ctx.fillStyle = textColour
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    // Connections
    ctx.strokeStyle = connectionStyle
    const layerValues = [inputs]
    const textQueue = []
    let weight = 0
    for (let i = 1; i < layers.length; i++) {
      const x1 = x + layerDistance * (i - 1) + nodeDiameter
      const x2 = x + layerDistance * i
      let layer = []
      for (let j = 0; j < layers[i]; j++) {
        const y2 = baseY + (nodeDiameter + nodeSpacing) * (j - layers[i] / 2) + nodeRadius
        let sum = 0
        for (let k = 0; k < layers[i - 1]; k++) {
          const y1 = baseY + (nodeDiameter + nodeSpacing) * (k - layers[i - 1] / 2) + nodeRadius
          const sigmoidWeight = sigmoid(weights[weight])
          ctx.globalAlpha = sigmoidWeight
          ctx.lineWidth = sigmoidWeight * 2 + 1
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()

          if (labelConnections) {
            // Average of y positions weighted towards the right one
            textQueue.push([weights[weight].toFixed(4), x2, 0.85 * y2 + 0.15 * y1])
          }

          sum += weights[weight] * layerValues[i - 1][k]
          weight++
        }
        if (bias) {
          if (labelConnections) {
            textQueue.push(['+ ' + weights[weight].toFixed(4), x2 + nodeDiameter, y2 + 7])
          }

          sum += weights[weight]
          weight++
        }
        layer.push(fn ? fn(sum) : sum)
      }
      layerValues.push(layer)
    }

    if (labelConnections) {
      ctx.font = '8px monospace'
      ctx.globalAlpha = 0.8
      // Draw text on top of the connections
      for (const [text, x, y] of textQueue) {
        ctx.fillText(text, x, y)
      }
    }

    // Nodes
    ctx.lineWidth = nodeWidth
    ctx.strokeStyle = nodeColour
    ctx.font = '12px monospace'
    ctx.beginPath()
    for (let i = 0; i < layers.length; i++) {
      for (let j = 0; j < layers[i]; j++) {
        const centreX = x + layerDistance * i + nodeRadius
        const centreY = baseY + (nodeDiameter + nodeSpacing) * (j - layers[i] / 2) + nodeRadius

        ctx.globalAlpha = layerValues[i][j]
        ctx.beginPath()
        ctx.moveTo(centreX + nodeRadius, centreY)
        ctx.arc(centreX, centreY, nodeRadius, 0, 2 * Math.PI)
        ctx.stroke()

        ctx.globalAlpha = 1
        ctx.fillText(layerValues[i][j].toFixed(4), centreX + nodeRadius, centreY)
      }
    }
  }
}
