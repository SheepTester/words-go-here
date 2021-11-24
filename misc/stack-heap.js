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
  triangle: 'M1 21h22L12 2 1 21z',
  star:
    'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
}
function makeShape ({ shape, colour }) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttributeNS(null, 'width', '24')
  svg.setAttributeNS(null, 'height', '24')
  svg.setAttributeNS(null, 'viewBox', '0 0 24 24')
  svg.classList.add('shape')

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttributeNS(null, 'd', shapes[shape])
  path.classList.add(colour)
  svg.append(path)

  return svg
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
  // Shuffle all the pairs
  for (let i = combos.length - 1; i > 0; i--) {
    const index = Math.floor(Math.random() * (i + 1))
    ;[combos[index], combos[i]] = [combos[i], combos[index]]
  }
  const pairs = []
  // Insert at the earliest appropriate spot
  while (combos.length > 0) {
    const pair = combos.pop()
    if (pairs.length === 0) {
      pairs.push(pair)
    } else if (
      pairs[0].shape !== pair.shape &&
      pairs[0].colour !== pair.colour
    ) {
      pairs.unshift(pair)
    } else {
      const index = pairs.findIndex(
        ({ shape, colour }, i) =>
          shape !== pair.shape &&
          colour !== pair.colour &&
          (i + 1 === pairs.length ||
            (pairs[i + 1].shape !== pair.shape &&
              pairs[i + 1].colour !== pair.colour))
      )
      if (index !== -1) {
        pairs.splice(index + 1, 0, pair)
      } else {
        if (pair._recycled) {
          throw { pair, combos, pairs }
        }
        pair._recycled = true
        combos.unshift(pair)
      }
    }
  }
  return pairs
}

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

  createGetter = (className, object, getProxy) => (_, methodName, isStatic) => {
    if (methodName === 'isProxy') {
      return true
    }

    const method = object[methodName]
    if (typeof method === 'function') {
      const argNames = getArgNames(method)
      return (...args) => {
        let returnValue
        this.#deferred.push(() => {
          this.#stack.push({
            title: `${className}.${method.name}`,
            return: returnValue,
            this: isStatic ? undefined : object,
            ...mapNamesToValues(argNames, args)
          })
        })
        // Set `returnValue` in a separate statement because it may never happen
        // if an error is thrown, for example.
        returnValue = method.call(getProxy(), ...args)
        return returnValue
      }
    } else {
      return method
    }
  }

  wrapClass = Class => {
    const classProxy = new Proxy(Class, {
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
          get: this.createGetter(Class.name, instance, () => proxy, false)
        })
        return proxy
      },

      get: this.createGetter(Class.name, Class, () => classProxy, true)
    })
    return classProxy
  }

  array (type, ...values) {
    this.#deferred.push(() => {
      this.#heap.set(values, { type, values, isArray: true })
    })
    return values
  }

  unwind () {
    for (const deferred of this.#deferred) {
      deferred()
    }
    this.#deferred = []
    return this
  }

  #renderValue (references, value) {
    const elem = document.createElement('div')
    elem.className = 'value'
    if (typeof value === 'object' && value !== null) {
      if (value.isProxy || Array.isArray(value)) {
        value = this.#heap.get(value)
      }
      elem.append(makeShape(references.get(value)))
    } else if (typeof value === 'string') {
      elem.append(`"${value.replace(/["\\]/g, char => '\\' + char)}"`)
    } else {
      elem.append(`${value}`)
    }
    return elem
  }

  render () {
    /** Assign a coloured shape to each object */
    const references = new Map()
    const combos = shuffleCombos()
    for (const object of this.#heap.values()) {
      references.set(object, combos.pop())
    }

    const heap = document.createElement('div')
    heap.className = 'heap'
    for (const object of this.#heap.values()) {
      const wrapper = document.createElement('div')
      wrapper.className = 'object'
      heap.append(wrapper)

      const shape = makeShape(references.get(object))
      shape.classList.add('reference')

      const className = document.createElement('div')
      className.className = 'class-name'
      className.textContent = object.constructor.name

      wrapper.append(shape, className)

      if (object.isArray) {
        className.textContent = object.type

        const items = document.createElement('div')
        items.className = 'items'
        items.textContent = `{ ${object.values
          .map(item => (item === null ? 'null' : `"${item}"`))
          .join(', ')} }`
        wrapper.append(items)
      } else {
        for (const [fieldName, value] of Object.entries(object)) {
          const field = document.createElement('div')
          field.className = 'binding'
          wrapper.append(field)

          const name = document.createElement('div')
          name.className = 'name'
          name.textContent = fieldName

          field.append(name, this.#renderValue(references, value))
        }
      }
    }

    const stack = document.createElement('div')
    stack.className = 'stack'
    for (const { title, return: returnValue, ...args } of this.#stack) {
      const wrapper = document.createElement('div')
      wrapper.className = 'stack-frame'
      stack.append(wrapper)

      const titleElem = document.createElement('div')
      titleElem.className = 'stack-title'
      titleElem.textContent = title

      const argValues = document.createElement('div')
      argValues.className = 'arguments'

      for (const [fieldName, value] of Object.entries(args)) {
        if (value === undefined) {
          continue
        }

        const field = document.createElement('div')
        field.className = 'binding'
        argValues.append(field)

        const name = document.createElement('div')
        name.className = 'name'
        name.textContent = fieldName

        field.append(name, this.#renderValue(references, value))
      }

      wrapper.append(titleElem, argValues)

      if (returnValue !== undefined) {
        const returnElem = this.#renderValue(references, returnValue)
        returnElem.classList.add('return-value')
        wrapper.append(returnElem)
      }
    }

    return { heap, stack }
  }
}
