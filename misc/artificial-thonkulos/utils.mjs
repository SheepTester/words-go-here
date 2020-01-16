export const noop = () => {}

/**
 * Fancy logistic growth function that outputs a number in (0, 1)
 */
export function sigmoid (n) {
  return 1 / (1 + Math.exp(-n))
}

export function mod (a, b) {
  return (a % b + b) % b
}
