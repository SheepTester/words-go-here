class ElemThing {
  constructor (tagName = 'div', className = '', children = []) {
    this.elem = document.createElement(tagName)
    this.elem.className = className
    for (const child of children) {
      child.addTo(this.elem)
    }
  }

  addTo (parent) {
    parent.append(this.elem)
  }

  remove () {
    this.elem.remove()
  }
}

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
  }

  show () {
    if (this.hidden) {
      this.elem.classList.remove('hidden')
      this.hidden = false
      if (!this.elem.parentNode) {
        this.addTo(document.body)
      }
    }
  }

  hide () {
    if (!this.hidden) {
      this.elem.classList.add('hidden')
      this.hidden = true
    }
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
  }

  resizeCanvas () {
    const { width, height } = this.elem.getBoundingClientRect()
    this.width = width
    this.height = height
    const dpr = window.devicePixelRatio
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.scale(dpr, dpr)
  }
}

export { Container, View, Text, Button, Canvas }
