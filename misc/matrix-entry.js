import { Rational } from './Rational'

class ExpandableInput {
  elem = document.createElement('input')

  get value () {
    return +this.elem.value
  }
}

export class RationalInput {
  constructor (value = Rational.from(0)) {
    this.value = value
    this.elems = RationalInput.#createElems()
  }

  static #createElems () {
    return {}
  }
}

// NOT USED, too cokmplicated
