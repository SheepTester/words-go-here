export class GenerationManager {
  constructor (options = {}) {
    this.options = options

    const { count = 100 } = options
    this.count = count
  }

  makeGeneration () {
    const { brainType } = this.options
    const count = this.count

    const generation = []
    for (let i = 0; i < count; i++) {
      generation.push(brainType.makeRandom())
    }
    return generation
  }

  /**
   * The generation is expected to be sorted best first
   */
  nextGeneration (generation) {
    const { keepRate = 0.2, randomRate = 0.2, children = 1 } = this.options
    const count = this.count

    if (generation.length !== count) {
      throw new Error('Wucky: This is not my generation')
    }

    const newGeneration = []

    const keep = Math.round(keepRate * count)
    for (let i = 0; i < keep && newGeneration.length < count; i++) {
      newGeneration.push(generation[i])
    }

    const randoms = Math.round(randomRate * count)
    for (let i = 0; i < randoms && newGeneration.length < count; i++) {
      newGeneration.push(brainType.makeRandom())
    }

    // For each individual, breed it with each winner before it (until the
    // required population count is met)
    // (Children are also given radiation treatment for mutations)
    for (let i = 0; i < generation.length; i++) {
      for (let j = 0; j < i; j++) {
        if (newGeneration.length >= count) {
          return newGeneration
        }
        for (let k = 0; k < children; k++) {
          newGeneration.push(brainType.radiation(brainType.sex(generation[i], generation[j])))
        }
      }
    }
    throw new Error('Wucky: Not enough children are being born!')
  }
}
