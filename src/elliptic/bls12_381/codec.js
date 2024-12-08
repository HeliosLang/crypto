import { decodeIntBE, encodeIntBE } from "@helios-lang/codec-utils"
import { affineCurve1 as G1, affineCurve2 as G2 } from "./curves/index.js"
import { F1, F2 } from "./fields/index.js"
import { CURVE1 } from "./constants.js"

/**
 * @import { Point2 } from "../../index.js"
 */

/**
 * Big endian format, 384 bits
 * Throws an error if encoding is wrong or point doesn't lie on curve
 * TODO: should also throw an error if point isn't in appropriate subgroup
 * @param {number[]} bytes
 * @returns {Point2<bigint>}
 */
export function decodeG1Point(bytes) {
    if (bytes.length != 48) {
        throw new Error(
            `expected 48 bytes for encoded G1 point, got ${bytes.length}`
        )
    }

    const tmp = bytes.slice()
    const head = tmp[0]

    if (!(head & 0b10000000)) {
        throw new Error("unexpected encoding for G1 point")
    }

    if (head & 0b01000000) {
        if (head != 0b11000000) {
            throw new Error(
                "invalid zero representation, 3rd header bit not 0)"
            )
        } else if (bytes.slice(1).some((b) => b != 0)) {
            throw new Error(
                "invalid zero representation, some non-header bits not 0"
            )
        }

        return G1.ZERO
    }

    const isYMax = (head & 0b00100000) != 0

    tmp[0] = tmp[0] & 0b00011111

    const x = decodeIntBE(tmp)

    if (x <= 0n || x >= CURVE1.P) {
        throw new Error(`x coordinate out of range`)
    }

    const x3 = F1.cube(x)
    const y2 = F1.add(x3, G1.b)

    let y = F1.sqrt(y2, isYMax)

    const point = { x, y }

    if (!G1.isValidPoint(point)) {
        throw new Error("decoded invalid G1 point")
    }

    return point
}

/**
 * Throws an error if encoding is wrong or point doesn't lie on curve
 * @param {number[]} bytes
 * @returns {Point2<[bigint, bigint]>}
 */
export function decodeG2Point(bytes) {
    if (bytes.length != 96) {
        throw new Error(
            `expected 96 bytes for encoded G2 point, got ${bytes.length}`
        )
    }

    const tmp = bytes.slice()
    const head = tmp[0]

    if ((head & 0b10000000) == 0) {
        throw new Error("unexpected encoding for G1 point")
    }

    if ((head & 0b01000000) != 0) {
        if (head != 0b11000000) {
            throw new Error(
                "invalid zero representation, 3rd header bit not 0)"
            )
        } else if (bytes.slice(1).some((b) => b != 0)) {
            throw new Error(
                "invalid zero representation, some non-header bits not 0"
            )
        }

        return G2.ZERO
    }

    const isYMax = (head & 0b00100000) != 0

    tmp[0] = tmp[0] & 0b00011111

    /**
     * @type {[bigint, bigint]}
     */
    const x = [decodeIntBE(tmp.slice(0, 48)), decodeIntBE(tmp.slice(48, 96))]

    const x3 = F2.cube(x)
    const y2 = F2.add(x3, G2.b)

    let y = F2.sqrt(y2, isYMax)

    const point = { x, y }

    if (!G2.isValidPoint(point)) {
        throw new Error("decoded invalid G2 point")
    }

    return point
}

/**
 * @param {bigint} x
 * @returns {number[]}
 */
function encodeIntBE48(x) {
    const bytes = encodeIntBE(x)

    while (bytes.length < 48) {
        bytes.unshift(0)
    }

    if (bytes[0] & 0b11100000) {
        throw new Error("x doesn't fit in 381 bits")
    }

    return bytes
}

/**
 * @param {Point2<bigint>} point
 * @returns {number[]}
 */
export function encodeG1Point(point) {
    if (G1.isZero(point)) {
        return [0b11000000].concat(new Array(47).fill(0))
    } else {
        const { x, y } = point
        const head = y > CURVE1.P / 2n ? 0b10100000 : 0b10000000

        const bytes = encodeIntBE48(x)

        bytes[0] = head | bytes[0]

        return bytes
    }
}

/**
 * @param {Point2<[bigint, bigint]>} point
 * @returns {number[]}
 */
export function encodeG2Point(point) {
    if (G2.isZero(point)) {
        return [0b11000000].concat(new Array(95).fill(0))
    } else {
        const { x, y } = point

        const head = y[0] > CURVE1.P / 2n ? 0b10100000 : 0b10000000

        const bytes = encodeIntBE48(x[0]).concat(encodeIntBE48(x[1]))

        bytes[0] = head | bytes[0]

        return bytes
    }
}
