/**
 * Assumes that the first method of a class is the class constructor. Expects the code style to be comformant with Standard.
 */
function getArgNames (classOrFunc) {
  return classOrFunc
    .toString()
    .match(/\w+ \(((?:\w+, )*\w+)?\)/)[1]
    .split(', ')
}

function mapNamesToValues (names, values) {
  return Object.fromEntries(names.map((name, i) => [name, values[i]]))
}

const shapes = {
  circle: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z',
  rect: 'M3 3h18v18H3z',
  triangle: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  star:
    'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
}
function makeShape (type, colour) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttributeNS(null, 'viewBox', '0 0 24 24')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttributeNS(null, 'd', shapes[type])
  path.classList.add(colour)
}

const colours = ['red', 'orange', 'green', 'blue', 'purple']

/**
 * Shuffle shape-colour pairs such that adjacent pairs do not share a colour or
 * shape.
 */
function shuffleCombos () {
  const combos = Object.keys(shapes).flatMap(shape =>
    colours.map(colour => ({ shape, colour }))
  )
  for (let i = combos.length - 1; i > 0; i--) {
    const index = Math.floor(Math.random() * (i + 1))
    ;[combos[index], combos[i]] = [combos[i], combos[index]]
  }
  const killed = []
  for (let i = 1; i < combos.length; i++) {
    if (
      combos[i - 1].shape === combos[i].shape ||
      combos[i - 1].colour === combos[i].colour
    ) {
      killed.push(...combos.splice(i--, 1))
    }
  }
  while (killed.length > 0) {
    const last = combos[combos.length - 1]
    const next = killed.findIndex(
      ({ shape, colour }) => shape !== last.shape && colour !== last.colour
    )
    if (next !== -1) {
      combos.push(...killed.splice(next, 1))
    } else {
      throw { combos, killed }
    }
  }
}
for (let i = 1000; i--; ) shuffleCombos()

export class Diagram {
  /** Objects */
  #heap = new Map()

  /** Function calls */
  #stack = []

  /**
   * Functions to run at the end so that everything gets added in the proper
   * order.
   */
  #deferred = []

  wrapClass = Class => {
    return new Proxy(Class, {
      construct: (_, args) => {
        this.#deferred.push(() => {
          this.#heap.set(proxy, instance)
          if (Class.length > 0) {
            const constructorNames = getArgNames(Class)
            this.#stack.push({
              title: `${Class.name} (constructor)`,
              this: instance,
              ...mapNamesToValues(constructorNames, args)
            })
          }
        })
        const instance = new Class(...args)
        const proxy = new Proxy(instance, {
          get: (_, methodName) => {
            if (methodName === 'isProxy') {
              return true
            }

            const method = instance[methodName]
            if (typeof method === 'function') {
              const argNames = getArgNames(method)
              return (...args) => {
                this.#deferred.push(() => {
                  this.#stack.push({
                    title: `${Class.name}.${method.name}`,
                    this: instance,
                    ...mapNamesToValues(argNames, args)
                  })
                })
                return method.call(proxy, ...args)
              }
            } else {
              return method
            }
          }
        })
        return proxy
      }
    })
  }

  unwind () {
    for (const deferred of this.#deferred) {
      deferred()
    }
    this.#deferred = []
  }
}
