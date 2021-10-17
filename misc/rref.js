class Matrix {
  rows

  constructor (rows) {
    this.rows = rows
  }

  /**
   * > *I interchange the first row and the third row.*
   * >
   * > — Professor Zelmanov
   *
   * Swaps two rows, given their indices.
   */
  interchange (row1, row2) {
    ;[this.rows[row1], this.rows[row2]] = [this.rows[row2], this.rows[row1]]
  }

  /**
   * > *I divide the second row by nine.*
   * >
   * > — Professor Zelmanov
   *
   * Multiplies all the numbers in a row by the given scalar.
   */
  multiply (row, scalar) {
    this.rows[row] = this.rows[row].map(number => number * scalar)
  }

  /**
   * > *I want to kill this five and this two. So I subtract from the second row
   * > the first row multiplied by five.*
   * >
   * > — Professor Zelmanov
   *
   * Adds one row, multiplied by some scalar, to another.
   */
  addRow (source, target, scalar = 1) {
    this.rows[target] = this.rows[target].map(
      (number, col) => number + this.rows[source][col] * scalar
    )
  }
}
