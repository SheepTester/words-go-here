// @ts-check

/**
 * @typedef {Rational | number | bigint} RationalResolveable
 */

/**
 * Very inefficient rational implementation.
 */
class Rational {
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
    for (
      let divisor = 2n;
      divisor <=
      (this.numerator < this.denominator ? this.numerator : this.denominator);
      divisor++
    ) {
      while (
        this.numerator % divisor === 0n &&
        this.denominator % divisor === 0n
      ) {
        this.numerator /= divisor
        this.denominator /= divisor
      }
    }
    return this
  }

  toString () {
    if (this.denominator === 1n) {
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

/**
 * For math reasons, row operations will deal with 1-indexed rows.
 *
 * All elementary row operations are pure and return a new matrix.
 */
class Matrix {
  rows

  /**
   * @param {Rational[][]} rows Rows of numbers in the matrix. Each row should
   * have the same number of numbers.
   */
  constructor (rows) {
    this.rows = rows
  }

  /**
   * > *I interchange the first row and the third row.*
   * >
   * > — Professor Zelmanov
   *
   * Swaps two rows, given their indices.
   *
   * @param {number} row1 The position of one row in the swap.
   * @param {number} row2 The position of the other row in the swap.
   */
  interchange (row1, row2) {
    return new Matrix(
      this.rows.map((row, i) =>
        i + 1 === row1
          ? this.rows[row2]
          : i + 1 === row2
          ? this.rows[row1]
          : row
      )
    )
  }

  /**
   * > *I divide the second row by nine.*
   * >
   * > — Professor Zelmanov
   *
   * Multiplies all the numbers in a row by the given scalar.
   *
   * @param {number} target The position of the row to multiply.
   * @param {RationalResolveable} scalar The factor to multiply the row by.
   */
  multiply (target, scalar) {
    return new Matrix(
      this.rows.map((row, i) =>
        i + 1 === target ? row.map(number => number.multiply(scalar)) : row
      )
    )
  }

  /**
   * > *I want to kill this five and this two. So I subtract from the second row
   * > the first row multiplied by five.*
   * >
   * > — Professor Zelmanov
   *
   * Adds one row, multiplied by some scalar, to another.
   *
   * @param {number} source The position of the row to be multiplied.
   * @param {number} target The position of the row to be added to.
   * @param {RationalResolveable} scalar A factor to multiply the source row by
   * before adding to the target row.
   */
  addRow (source, target, scalar = 1) {
    return new Matrix(
      this.rows.map((row, i) =>
        i + 1 === target
          ? row.map((number, col) =>
              number.add(this.rows[source][col].multiply(scalar))
            )
          : row
      )
    )
  }

  /**
   * > *I drop this row because it is not informative any longer.*
   * >
   * > — Professor Zelmanov
   *
   * Removes a row from a matrix. Intended for removing a zero row.
   *
   * @param {number} row The position of the row to remove.
   */
  drop (row) {
    return new Matrix(this.rows.filter((_, i) => i + 1 !== row))
  }

  /**
   * Row reduce the matrix to echelon form.
   *
   * @param {Matrix} matrix
   */
  static rref (matrix) {
    //
  }
}
