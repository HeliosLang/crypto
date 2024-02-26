import { decodeIntLE, encodeIntLE32, getBit } from "@helios-lang/codec-utils"

/**
 * @template {CurvePoint<T>} T
 * @typedef {import("./CurvePoint.js").CurvePoint<T>} CurvePoint
 */

/**
 * @param {bigint} x
 * @param {bigint} N
 * @returns {bigint}
 */
export function mod(x, N) {
    const res = x % N

    if (res < 0n) {
        return res + N
    } else {
        return res
    }
}

/**
 * Invert a number on a field (i.e. calculate n^-1 so that n*n^-1 = 1)
 * This is an expensive iterative procedure that is only guaranteed to converge if the modulo is a prime number
 * @param {bigint} n
 * @param {bigint} m modulo
 * @returns {bigint}
 */
export function invert(n, m) {
    let a = mod(n, m)
    let b = m

    let x = 0n
    let y = 1n
    let u = 1n
    let v = 0n

    while (a !== 0n) {
        const q = b / a
        const r = b % a
        const m = x - u * q
        const n = y - v * q
        b = a
        a = r
        x = u
        y = v
        u = m
        v = n
    }

    return mod(x, m)
}

/**
 * @param {number[]} bytes
 * @param {boolean} clamp - force `s` to 32 bytes long, applying special padding to first and 32nd byte
 * @returns {bigint}
 */
function decodeScalar(bytes, clamp = false) {
    if (clamp) {
        bytes = bytes.slice(0, 32)

        bytes[0] &= 0b11111000
        bytes[31] &= 0b00111111
        bytes[31] |= 0b01000000
    }

    return decodeIntLE(bytes)
}

/**
 * @param {bigint} x
 * @returns {number[]}
 */
function encodeScalar(x) {
    return encodeIntLE32(x)
}

/**
 * Double-and-add algorithm
 * Seems to have acceptable performance
 * @template {CurvePoint<T>} T
 * @param {T} point
 * @param {bigint} scalar
 * @param {T} zero
 * @returns {T}
 */
export function mul(point, scalar, zero) {
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

/**
 * Modular exponent
 * @param {bigint} b base
 * @param {bigint} e exponent
 * @param {bigint} m modulo
 * @returns {bigint}
 */
export function exp(b, e, m) {
    if (e == 0n) {
        return 1n
    } else {
        let t = exp(b, e / 2n, m)
        t = (t * t) % m

        if (e % 2n != 0n) {
            t = mod(t * b, m)
        }

        return t
    }
}

/**
 * @typedef {{
 *   x: bigint
 *   y: bigint
 * }} Point2
 */

/**
 * @param {Point2} a
 * @param {Point2} b
 * @returns {boolean}
 */
export function equalsAffine(a, b) {
    return a.x == b.x && a.y == b.y
}

/**
 * @typedef {{
 *   x: bigint
 *   y: bigint
 *   z: bigint
 * }} Point3
 */

/**
 * @param {Point3} a
 * @param {Point3} b
 * @param {bigint} modulo - specific for the curve
 * @returns {boolean}
 */
export function equalsExtended(a, b, modulo) {
    return (
        mod(a.x * b.z, modulo) == mod(b.x * a.z, modulo) &&
        mod(a.y * b.z, modulo) == mod(b.y * a.z, modulo)
    )
}

/**
 * @param {bigint} xx
 * @param {bigint} modulo
 * @returns {bigint}
 */
export function sqrtSlow(xx, modulo) {
    const modulo14 = (modulo - 1n) / 4n

    return exp(xx, modulo14, modulo)
}

/**
 * @param {bigint} xx
 * @param {bigint} modulo
 * @returns {bigint}
 */
export function sqrtFast(xx, modulo) {
    const modulo14 = (modulo - 1n) / 4n

    let t = 1n

    for (let e = modulo14; e > 0n; e >>= 1n) {
        if (e & 1n) {
            t = mod(t * xx, modulo)
        }

        xx = mod(xx * xx, modulo)
    }

    return t
}
