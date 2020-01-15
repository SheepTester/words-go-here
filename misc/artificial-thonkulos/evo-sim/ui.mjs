import { EventEmitter } from '../event-emitter.mjs'

class ElemThing extends EventEmitter {
  constructor (tagName = 'div', className = '', children = []) {
    super()
    this.elem = document.createElement(tagName)
    this.elem.className = className
    for (const child of children) {
      this.elem.append(child.elem)
    }
    this.descendants = [].concat(children, ...children.map(c => c.descendants))
  }
}

// Has display flex
class Container extends ElemThing {
  constructor (className = '', elems = []) {
    super('div', className, elems)
    this.elem.classList.add('container')
  }
}

class View extends Container {
  constructor (className = '', elems = []) {
    super(className, elems)
    this.elem.classList.add('view')
    this.elem.classList.add('hidden')
    this.hidden = true

    for (const descendant of this.descendants) {
      descendant.view = this
      descendant.emit('view', this)
    }
  }

  show () {
    if (this.hidden) {
      this.elem.classList.remove('hidden')
      this.hidden = false
      if (!this.elem.parentNode) {
        this.addTo(document.body)
      }
      this.emit('show')
    }
  }

  hide () {
    if (!this.hidden) {
      this.elem.classList.add('hidden')
      this.hidden = true
      this.emit('hide')
    }
  }

  addTo (parent) {
    parent.append(this.elem)
  }

  remove () {
    if (!this.hidden) {
      this.hide()
    }
    this.elem.remove()
  }

  resize () {
    let ready
    const onReady = new Promise(resolve => {
      ready = resolve
    })
    this.emit('resize', onReady)
    ready()
  }
}

class Text extends ElemThing {
  constructor (className = '', text = '') {
    super('p', className)
    this.elem.classList.add('text')
    this.elem.textContent = text
  }
}

class Button extends ElemThing {
  constructor (className = '', label = '', onclick = () => {}) {
    super('button', className)
    this.elem.classList.add('button')
    this.elem.textContent = label
    this.elem.addEventListener('click', e => {
      onclick(this)
    })
  }
}

class Canvas extends ElemThing {
  constructor (className = '') {
    super('div', className)
    this.elem.classList.add('canvas-wrapper')
    this.canvas = document.createElement('canvas')
    this.canvas.classList.add('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.elem.appendChild(this.canvas)

    this.on('view', view => {
      view.on('resize', this.resizeCanvas.bind(this))
    })
  }

  async resizeCanvas (onReady) {
    const { width, height } = this.elem.getBoundingClientRect()
    this.width = width
    this.height = height
    const dpr = window.devicePixelRatio
    await onReady
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.ctx.scale(dpr, dpr)
    this.ctx.fillRect(20, 20, 20, 40)
  }
}

export { Container, View, Text, Button, Canvas }
