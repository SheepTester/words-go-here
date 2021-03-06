import { noop } from './utils.mjs'

export class RenderSimulation {
  constructor ({
    render = noop,
    simulate = noop,
    simTime = 0.01, // in seconds
    maxDelay = 0.5, // in seconds
    speed = 1
  } = {}) {
    this.render = render
    this.simulate = simulate
    this.simTime = simTime
    this.maxDelay = maxDelay
    this.speed = speed

    this._idealSimulationTime = 0
    this._timeSimulated = 0

    this._running = false
  }

  start () {
    if (!this._running) {
      this._running = true
      this._lastTime = Date.now()
      this._paint()
    }
  }

  stop () {
    if (this._running) {
      window.cancelAnimationFrame(this._lastRequestID)
      this._running = false
    }
  }

  _paint () {
    const now = Date.now()
    const elapsed = now - this._lastTime
    if (elapsed < this.maxDelay * 1000) {
      this._idealSimulationTime += elapsed * this.speed
      while (this._timeSimulated < this._idealSimulationTime) {
        this.simulate(this.simTime)
        this._timeSimulated += this.simTime * 1000
      }
    }
    this._lastTime = now

    this.render(this._timeSimulated / 1000, elapsed / 1000)

    // In case it calls `stop` during the simulate or render steps
    if (this._running) {
      this._lastRequestID = window.requestAnimationFrame(this._paint.bind(this))
    }
  }
}
