import { mod } from "./arithmetic.js"

/**
 * @template {Point<T>} T
 * @typedef {{
 *   add(other: T): T
 *   mul(scalar: bigint): T
 *   neg(): T
 *   isZero(): boolean
 *   equals(other: T): boolean
 *   encode(): number[]
 *   toAffine(): {x: bigint, y: bigint}
 * }} Point
 */

/**
 * @template {Point<T>} T
 * @typedef {{
 *    name: string
 *    BASE: T
 *    decode(bytes: number[]): T
 * }} PointClass
 */

/**
 * @param {bigint} ax
 * @param {bigint} ay
 * @param {bigint} az
 * @param {bigint} bx
 * @param {bigint} by
 * @param {bigint} bz
 * @param {bigint} modulo - specific for the curve
 * @returns {boolean}
 */
export function equalsExtended(ax, ay, az, bx, by, bz, modulo) {
    return (
        mod(ax * bz, modulo) == mod(bx * az, modulo) &&
        mod(ay * bz, modulo) == mod(by * az, modulo)
    )
}

/**
 * Double-and-add algorithm
 * Seems to have acceptable performance.
 * Not constant-time, but for the signing algorithms the scalar is always a random private number
 * @template {Point<T>} T
 * @param {T} point
 * @param {bigint} scalar
 * @param {T} zero
 * @returns {T}
 */
export function scalePoint(point, scalar, zero) {
    if (scalar == 0n) {
        return zero
    } else if (scalar == 1n) {
        return point
    } else {
        let sum = point.mul(scalar / 2n)

        sum = sum.add(sum)

        if (scalar % 2n != 0n) {
            sum = sum.add(point)
        }

        return sum
    }
}
