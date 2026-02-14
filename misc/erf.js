// https://github.com/josdejong/mathjs/blob/develop/src/function/special/erf.js

/**
 * @license
 * Copyright (C) 2013-2026 Jos de Jong <wjosdejong@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function erf (x) {
  const y = Math.abs(x)

  if (y >= MAX_NUM) {
    return Math.sign(x)
  }
  if (y <= THRESH) {
    return Math.sign(x) * erf1(y)
  }
  if (y <= 4.0) {
    return Math.sign(x) * (1 - erfc2(y))
  }
  return Math.sign(x) * (1 - erfc3(y))
}

/**
 * Approximates the error function erf() for x <= 0.46875 using this function:
 *               n
 * erf(x) = x * sum (p_j * x^(2j)) / (q_j * x^(2j))
 *              j=0
 */
function erf1 (y) {
  const ysq = y * y
  let xnum = P[0][4] * ysq
  let xden = ysq
  let i

  for (i = 0; i < 3; i += 1) {
    xnum = (xnum + P[0][i]) * ysq
    xden = (xden + Q[0][i]) * ysq
  }
  return (y * (xnum + P[0][3])) / (xden + Q[0][3])
}

/**
 * Approximates the complement of the error function erfc() for
 * 0.46875 <= x <= 4.0 using this function:
 *                       n
 * erfc(x) = e^(-x^2) * sum (p_j * x^j) / (q_j * x^j)
 *                      j=0
 */
function erfc2 (y) {
  let xnum = P[1][8] * y
  let xden = y
  let i

  for (i = 0; i < 7; i += 1) {
    xnum = (xnum + P[1][i]) * y
    xden = (xden + Q[1][i]) * y
  }
  const result = (xnum + P[1][7]) / (xden + Q[1][7])
  const ysq = parseInt(y * 16) / 16
  const del = (y - ysq) * (y + ysq)
  return Math.exp(-ysq * ysq) * Math.exp(-del) * result
}

/**
 * Approximates the complement of the error function erfc() for x > 4.0 using
 * this function:
 *
 * erfc(x) = (e^(-x^2) / x) * [ 1/sqrt(pi) +
 *               n
 *    1/(x^2) * sum (p_j * x^(-2j)) / (q_j * x^(-2j)) ]
 *              j=0
 */
function erfc3 (y) {
  let ysq = 1 / (y * y)
  let xnum = P[2][5] * ysq
  let xden = ysq
  let i

  for (i = 0; i < 4; i += 1) {
    xnum = (xnum + P[2][i]) * ysq
    xden = (xden + Q[2][i]) * ysq
  }
  let result = (ysq * (xnum + P[2][4])) / (xden + Q[2][4])
  result = (SQRPI - result) / y
  ysq = parseInt(y * 16) / 16
  const del = (y - ysq) * (y + ysq)
  return Math.exp(-ysq * ysq) * Math.exp(-del) * result
}

/**
 * Upper bound for the first approximation interval, 0 <= x <= THRESH
 * @constant
 */
const THRESH = 0.46875

/**
 * Constant used by W. J. Cody's Fortran77 implementation to denote sqrt(pi)
 * @constant
 */
const SQRPI = 5.6418958354775628695e-1

/**
 * Coefficients for each term of the numerator sum (p_j) for each approximation
 * interval (see W. J. Cody's paper for more details)
 * @constant
 */
const P = [
  [
    3.1611237438705656, 1.13864154151050156e2, 3.77485237685302021e2,
    3.20937758913846947e3, 1.85777706184603153e-1
  ],
  [
    5.64188496988670089e-1, 8.88314979438837594, 6.61191906371416295e1,
    2.98635138197400131e2, 8.8195222124176909e2, 1.71204761263407058e3,
    2.05107837782607147e3, 1.23033935479799725e3, 2.15311535474403846e-8
  ],
  [
    3.05326634961232344e-1, 3.60344899949804439e-1, 1.25781726111229246e-1,
    1.60837851487422766e-2, 6.58749161529837803e-4, 1.63153871373020978e-2
  ]
]

/**
 * Coefficients for each term of the denominator sum (q_j) for each approximation
 * interval (see W. J. Cody's paper for more details)
 * @constant
 */
const Q = [
  [
    2.36012909523441209e1, 2.44024637934444173e2, 1.28261652607737228e3,
    2.84423683343917062e3
  ],
  [
    1.57449261107098347e1, 1.17693950891312499e2, 5.37181101862009858e2,
    1.62138957456669019e3, 3.29079923573345963e3, 4.36261909014324716e3,
    3.43936767414372164e3, 1.23033935480374942e3
  ],
  [
    2.56852019228982242, 1.87295284992346047, 5.27905102951428412e-1,
    6.05183413124413191e-2, 2.33520497626869185e-3
  ]
]

/**
 * Maximum/minimum safe numbers to input to erf() (in ES6+, this number is
 * Number.[MAX|MIN]_SAFE_INTEGER). erf() for all numbers beyond this limit will
 * return 1
 */
const MAX_NUM = Math.pow(2, 53)
