class EventEmitter {
  constructor () {
    this._listeners = {}
  }

  on (name, fn) {
    if (!this._listeners[name]) {
      this._listeners[name] = new Set()
    }
    this._listeners[name].add(fn)
    return this
  }

  off (name, fn) {
    if (this._listeners[name]) {
      this._listeners[name].delete(fn)
    }
    return this
  }

  emit (name, ...args) {
    if (this._listeners[name]) {
      for (const fn of this._listeners[name]) {
        fn(...args)
      }
    }
  }
}

export { EventEmitter }
