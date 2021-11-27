// @ts-check

/**
 * I want to use bitwise operators but I would rather have readable and
 * inefficient code because the rest of the program is inefficient anyways.
 *
 * @see https://en.wikipedia.org/wiki/Binary_GCD_algorithm#Algorithm
 * @param {bigint} a
 * @param {bigint} b
 */
function gcd (a, b) {
  let multiplier = 1n
  while (a !== 0n && b !== 0n) {
    if (a % 2n === 0n) {
      if (b % 2n === 0n) {
        // If both are even, then 2 is a common factor.
        multiplier *= 2n
        a /= 2n
        b /= 2n
      } else {
        // b is odd, so 2 is not a common factor. Remove it from a.
        a /= 2n
      }
    } else {
      if (b % 2n === 0n) {
        // Likewise, but a is odd rather than b.
        b /= 2n
      } else {
        // From Wikipedia:
        // gcd(u, v) = gcd(|u − v|, min(u, v))
        // Only works if both are odd.

        // Math.abs and Math.min don't support BigInts, so I'm just using an if
        // statement here.
        if (a > b) {
          // a - b will be positive, and min(a, b) will be b, so we can keep b
          // and set a = a - b.
          a -= b
        } else {
          b -= a
        }
      }
    }
  }
  return multiplier * (a === 0n ? b : a)
}

/**
 * @typedef {Rational | number | bigint} RationalResolveable
 */

/**
 * Very inefficient rational implementation.
 */
export class Rational {
  numerator
  denominator

  /**
   * Both the numerator and denominator must be integers. The denominator cannot
   * be zero.
   *
   * @param {bigint} numerator
   * @param {bigint} denominator
   */
  constructor (numerator, denominator = 1n) {
    this.numerator = numerator
    this.denominator = denominator
  }

  /**
   * @param {RationalResolveable} other
   */
  add (other) {
    if (typeof other === 'number') other = Rational.from(other)
    if (typeof other === 'bigint') {
      return new Rational(
        this.numerator + other * this.denominator,
        this.denominator
      )
    } else {
      return new Rational(
        this.numerator * other.denominator + other.numerator * this.denominator,
        this.denominator * other.denominator
      )
    }
  }

  /**
   * @param {RationalResolveable} other
   */
  multiply (other) {
    if (typeof other === 'number') other = Rational.from(other)
    if (typeof other === 'bigint') {
      return new Rational(this.numerator * other, this.denominator)
    } else {
      return new Rational(
        this.numerator * other.numerator,
        this.denominator * other.denominator
      )
    }
  }

  /**
   * Impure! Validates the denominator and simplifies the fraction.
   */
  simplify () {
    if (this.denominator === 0n) {
      throw new RangeError(
        'The denominator of a rational number cannot be zero.'
      )
    }
    const negative = this.numerator < 0n !== this.denominator < 0n
    if (this.numerator < 0n) this.numerator *= -1n
    if (this.denominator < 0n) this.denominator *= -1n
    const cancel = gcd(this.numerator, this.denominator)
    this.numerator /= cancel
    this.denominator /= cancel
    if (negative) {
      this.numerator *= -1n
    }
    return this
  }

  get isZero () {
    return this.numerator === 0n
  }

  get isOne () {
    return this.numerator === this.denominator
  }

  get isInteger () {
    this.simplify()
    return this.denominator === 1n
  }

  /** The reciprocal */
  get inverse () {
    return new Rational(this.denominator, this.numerator)
  }

  toString () {
    if (this.isInteger) {
      return `${this.numerator}`
    } else {
      return `${this.numerator}/${this.denominator}`
    }
  }

  valueOf () {
    return Number(this.numerator) / Number(this.denominator)
  }

  /**
   * Creates a Rational from the number. This number must be finite, but it need
   * not be an integer. Decimals will be read in base 10, so 0.3333333333333333
   * (from float division of 1 / 3) will be read as 3333333333333333 /
   * 10000000000000000.
   *
   * @param {number | bigint} number
   */
  static from (number) {
    if (typeof number === 'bigint') {
      return new Rational(number)
    } else if (Number.isFinite(number)) {
      if (Number.isInteger(number)) {
        return new Rational(BigInt(number))
      } else {
        const string = number.toString()
        const [coefficientStr, exponentStr = '0'] = string.split(/e[-+]/)
        let exponent = BigInt(exponentStr)
        if (coefficientStr.includes('.')) {
          exponent -= BigInt(coefficientStr.split('.')[1].length)
        }
        const coefficient = BigInt(coefficientStr.split('.').join(''))
        if (exponent < 0) {
          return new Rational(coefficient, 10n ** -exponent)
        } else {
          return new Rational(coefficient, 10n ** exponent)
        }
      }
    } else {
      throw new RangeError('Number is not finite.')
    }
  }
}
