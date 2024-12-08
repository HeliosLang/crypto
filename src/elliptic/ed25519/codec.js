import { decodeIntLE, encodeIntLE32, getBit } from "@helios-lang/codec-utils"
import { D } from "./constants.js"
import { F } from "./field.js"

/**
 * @import { Point2 } from "../../index.js"
 */

/**
 * @param {number[]} bytes
 * @param {boolean} truncate - force `bytes` to 32 bytes long, applying special padding to first and 32nd byte
 * @returns {bigint}
 */
export function decodeScalar(bytes, truncate = false) {
    if (truncate) {
        bytes = bytes.slice(0, 32)

        bytes[0] &= 0b11111000
        bytes[31] &= 0b00111111
        bytes[31] |= 0b01000000
    }

    return decodeIntLE(bytes)
}

/**
 * @param {number[]} bytes
 * @returns {bigint}
 */
export function decodePrivateKey(bytes) {
    return decodeScalar(bytes, true)
}

/**
 * @param {bigint} x
 * @returns {number[]}
 */
export function encodeScalar(x) {
    return encodeIntLE32(x)
}

/**
 * The formula for the twisted Edwards curve is:
 *    -x^2 + y^2 = 1 - d*x^2*y^2
 * Calculating x from this we get (only y is stored in the encoded point):
 *    y^2 - 1 = x^2*(1 - d*y^2)
 *    x = sqrt((y^2 - 1)/(1 - d*y^2))
 * @param {number[]} bytes
 * @returns {Point2<bigint>}
 */
export function decodePoint(bytes) {
    if (bytes.length != 32) {
        throw new Error(
            `expected 32 bytes for encoded point, got ${bytes.length}`
        )
    }

    const tmp = bytes.slice()
    tmp[31] = tmp[31] & 0b01111111

    const y = decodeScalar(tmp)
    const finalBit = getBit(bytes, 255)

    const y2 = y * y
    const x2 = (y2 - 1n) * F.invert(1n + D * y2)

    // sqrt
    let x = F.sqrt(x2)

    if (!x) {
        throw new Error(
            "sqrt not defined on Ed25519 field, unable to recover X"
        )
    }

    // if odd state not equal, make odd state same
    if (Number(x & 1n) != finalBit) {
        x = F.negate(x)
    }

    return { x, y }
}

/**
 * @param {Point2<bigint>} point
 * @returns {number[]}
 */
export function encodePoint(point) {
    const { x, y } = point
    const evenOdd = Number(x & 1n) // 0: even, 1: odd

    const bytes = encodeScalar(y)

    // last bit is determined by x
    bytes[31] = (bytes[31] & 0b011111111) | (evenOdd * 0b10000000)

    return bytes
}
