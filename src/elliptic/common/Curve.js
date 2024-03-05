/**
 * @template T
 * @typedef {import("./Field.js").Field<T>} Field
 */

/**
 * Abstraction of an additive group
 *   * ZERO: additive identity
 *   * add two points to form a new point
 *   * scale: add a point to itself
 *   * equals: compares two points
 *   * isValidPoint: returns true if point lies on curve
 *
 * For scale we'll always be using the double-and-add algorithm
 *
 * @template T
 * @typedef {{
 *   ZERO: T
 *   add: (a: T, b: T) => T
 *   negate: (a: T) => T
 *   equals: (a: T, b: T) => boolean
 *   isValidPoint: (p: T) => boolean
 * }} Curve
 */

/**
 * Double-and-add algorithm
 * Seems to have acceptable performance.
 * Not constant-time, but for the signing algorithms this scalar is always a random private number
 * @template T
 * @param {Curve<T>} curve
 * @param {T} point
 * @param {bigint} scalar
 * @returns {T}
 */
export function scaleCurvePoint(curve, point, scalar) {
    if (scalar == 0n) {
        return curve.ZERO
    } else if (scalar == 1n) {
        return point
    } else if (scalar < 0n) {
        return scaleCurvePoint(curve, curve.negate(point), -scalar)
    } else {
        let sum = scaleCurvePoint(curve, point, scalar / 2n)

        sum = curve.add(sum, sum)

        if (scalar % 2n != 0n) {
            sum = curve.add(sum, point)
        }

        return sum
    }
}
