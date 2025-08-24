/**
 * An unshrinkable deque based on a ring array that only lets you push to the
 * right, but you can peek/pop from either side. All operations are generally
 * O(1), except sometimes in `pushRight` after some `popLeft`s when the array
 * needs to be rearranged.
 *
 * Items pushed to the `Deque` may not be garbage collected even when popped out
 * later until the `Deque` itself is garbage collected.
 */
export class Deque<T> {
  #arr: T[] = []
  /** Index of `peekLeft`, or `arr.length` if empty. */
  #left = 0
  /** Index of `peekRight`, with no meaningful value if empty. */
  #right = 0

  #isEmpty (): boolean {
    return this.#left === this.#arr.length
  }

  length () {
    return this.#isEmpty()
      ? 0
      : this.#left <= this.#right
        ? this.#right - this.#left + 1
        : this.#arr.length - this.#left + this.#right
  }

  pushRight (item: T): void {
    if (this.#isEmpty()) {
      // Array is empty
      if (this.#arr.length > 0) {
        this.#arr[0] = item
      } else {
        this.#arr.push(item)
      }
      this.#left = 0
      this.#right = 0
      return
    }
    const nextRight = (this.#right + 1) % this.#arr.length
    if (nextRight === this.#left) {
      // Ring buffer is full
      if (this.#left > 0) {
        // Rearrange array
        this.#arr =
          this.#left <= this.#right
            ? this.#arr.slice(this.#left, this.#right + 1)
            : [
              ...this.#arr.slice(this.#left),
              ...this.#arr.slice(0, this.#right + 1)
            ]
        this.#left = 0
      }
      this.#right = this.#arr.length
      this.#arr.push(item)
    } else {
      this.#arr[nextRight] = item
      this.#right = nextRight
    }
  }

  peekLeft (): T | null {
    return this.#isEmpty() ? null : this.#arr[this.#left]
  }

  popLeft (): T | null {
    if (this.#isEmpty()) {
      return null
    }
    const item = this.#arr[this.#left]
    if (this.#left === this.#right) {
      // We're removing the last item; mark as empty
      this.#left = this.#arr.length
    } else {
      this.#left++
      this.#left %= this.#arr.length
    }
    return item
  }

  peekRight (): T | null {
    return this.#isEmpty() ? null : this.#arr[this.#right]
  }

  popRight (): T | null {
    if (this.#isEmpty()) {
      return null
    }
    const item = this.#arr[this.#right]
    if (this.#left === this.#right) {
      // We're removing the last item; mark as empty
      this.#left = this.#arr.length
    } else {
      this.#right += this.#arr.length - 1
      this.#right %= this.#arr.length
    }
    return item
  }
}
