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

class Diagram {
  /** Objects */
  heap = []

  /** Function calls */
  stack = []

  wrapClass = Class => {
    return new Proxy(Class, {
      construct: (_, args) => {
        // Stack and heap order will be wrong if the constructor creates objects
        const instance = new Class(...args)
        this.heap.push(instance)
        if (Class.length > 0) {
          const constructorNames = getArgNames(Class)
          this.stack.push({
            title: `${Class.name} (constructor)`,
            this: instance,
            ...mapNamesToValues(constructorNames, args)
          })
        }
        const proxy = new Proxy(instance, {
          get: (_, methodName) => {
            const method = instance[methodName]
            if (typeof method === 'function') {
              const argNames = getArgNames(method)
              return (...args) => {
                this.stack.push({
                  title: `${Class.name}.${method.name}`,
                  this: instance,
                  ...mapNamesToValues(argNames, args)
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
}
