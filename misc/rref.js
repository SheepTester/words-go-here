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
    if (row1 < 1 || row1 > this.rows.length) {
      throw new RangeError(`The row ${row1} is out of bounds.`)
    }
    if (row2 < 1 || row2 > this.rows.length) {
      throw new RangeError(`The row ${row2} is out of bounds.`)
    }
    return new Matrix(
      this.rows.map((row, i) =>
        i + 1 === row1
          ? this.rows[row2 - 1]
          : i + 1 === row2
          ? this.rows[row1 - 1]
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
              number.add(this.rows[source - 1][col].multiply(scalar))
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

  get columns () {
    return this.rows[0].length
  }

  /**
   * 1-indexed.
   *
   * @param {number} row
   * @param {number} column
   */
  get (row, column) {
    return this.rows[row - 1][column - 1]
  }

  toString () {
    return this.rows.map(row => row.join('\t')).join('\n')
  }

  /**
   * Row reduce the matrix to echelon form.
   *
   * @param {Matrix} matrix
   */
  static rref (matrix) {
    let row = 1
    for (let col = 1; col <= matrix.columns; col++) {
      // Find a row I would like in this position.
      let oneRow, nonZeroRow
      for (let r = row; r <= matrix.rows.length; r++) {
        if (!matrix.get(r, col).isZero && nonZeroRow === undefined) {
          nonZeroRow = r
        }
        if (matrix.get(r, col).isOne && oneRow === undefined) {
          oneRow = r
        }
      }

      // Prioritize a row starting with 1.
      if (oneRow !== undefined) {
        if (oneRow !== row) {
          console.log(
            `Let us interchange rows ${oneRow} and ${row} because I would like to have 1 in this position.`
          )
          matrix = matrix.interchange(oneRow, row)
          console.log(matrix.toString())
        }
      } else if (nonZeroRow !== undefined) {
        if (nonZeroRow !== row) {
          console.log(`Let us interchange rows ${nonZeroRow} and ${row}.`)
          matrix = matrix.interchange(nonZeroRow, row)
          console.log(matrix.toString())
        }
      } else {
        // Rest of column is zeroes; this column is a free variable.
        continue
      }

      let entryInverse = matrix.get(row, col).inverse

      // Kill other entries in the column that are easy to kill.
      for (let i = 1; i <= matrix.rows.length; i++) {
        if (i !== row) {
          const entry = matrix.get(i, col)
          const c = entry.multiply(entryInverse).multiply(-1)
          // If it's an integer then it is easy.
          if (!entry.isZero && c.isInteger) {
            console.log(
              `I add to row ${i} row ${row} multiplied by ${c} in order to kill this ${entry}.`
            )
            matrix = matrix.addRow(row, i, c)
          }
        }
      }
      console.log(matrix.toString())

      // Divide the row to make the leading entry 1.
      if (!entryInverse.isOne) {
        console.log(`I multiply row ${row} by ${entryInverse}.`)
        matrix = matrix.multiply(row, entryInverse)
        console.log(matrix.toString())

        entryInverse = matrix.get(row, col).inverse
      }

      // Kill the rest of the entries in the column.
      for (let i = 1; i <= matrix.rows.length; i++) {
        if (i !== row) {
          const entry = matrix.get(i, col)
          if (!entry.isZero) {
            const c = entry.multiply(entryInverse).multiply(-1)
            console.log(
              `I add to row ${i} row ${row} multiplied by ${c} in order to kill this ${entry}.`
            )
            matrix = matrix.addRow(row, i, c)
          }
        }
      }
      console.log(matrix.toString())

      // Check for zero rows
      for (let r = row + 1; r <= matrix.rows.length; r++) {
        if (matrix.rows[r - 1].every(entry => entry.isZero)) {
          console.log(`I have this zero row. I forget about it.`)
          matrix = matrix.drop(r--)
          console.log(matrix.toString())
        }
      }

      row++
    }
    return matrix
  }
}

const matrix = new Matrix(
  [
    [1, 2, 7, -2, -6],
    [1, 0, 3, -5, 1],
    [0, 1, 2, 3, -2],
    [-3, 2, -5, 14, 7]
  ].map(row => row.map(Rational.from))
)
console.log(matrix.toString())
console.log(Matrix.rref(matrix))
