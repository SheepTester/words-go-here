/**
 * Copied from https://github.com/SheepTester/uxdy/blob/main/tss2/util.ts
 */
export class Semaphore {
  #spots
  #queue = []

  constructor (max) {
    this.#spots = max
  }

  async acquire () {
    if (this.#spots > 0) {
      this.#spots--
    } else {
      const entry = Promise.withResolvers()
      this.#queue.push(entry)
      await entry.promise
    }
    let disposed = false
    return {
      [Symbol.dispose]: () => {
        if (disposed) {
          return
        }
        disposed = true
        const next = this.#queue.shift()
        if (next) {
          next.resolve()
        } else {
          this.#spots++
        }
      }
    }
  }
}
