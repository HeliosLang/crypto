/**
 * Function that generates a random number between 0 and 1
 * @typedef {() => number} NumberGenerator
 */

/**
 * A simple pseudo-random number generator for use in tests that requires some randomness but need to be deterministic
 * (i.e. each test run gives the same result).
 * @param {number} seed
 * @returns {NumberGenerator} The returned function returns a new random number between 0 and 1 upon each call.
 */
export function mulberry32(seed) {
    /**
     * @type {NumberGenerator}
     */
    return function () {
        let t = (seed += 0x6d2b79f5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/**
 * Alias for `mulberry32`.
 * @param {number} seed
 * @returns {NumberGenerator} The returned function returns a new random number between 0 and 1 upon each call.
 */
export function rand(seed) {
    return mulberry32(seed)
}
