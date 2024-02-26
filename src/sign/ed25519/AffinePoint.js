import { getBit } from "@helios-lang/codec-utils"
import { equalsAffine, exp, invert, mod, mul } from "../common/index.js"
import { P, D, Gx, Gy, P38, SQRT2P14 } from "./constants.js"
import { decodeScalar, encodeScalar } from "./codec.js"

/**
 * @template {CurvePoint<T>} T
 * @typedef {import("../CurvePoint.js").CurvePoint<T>} CurvePoint<T>
 */

/**
 * @implements {CurvePoint<AffinePoint>}
 */
export class AffinePoint {
    /**
     * @readonly
     * @type {bigint}
     */
    x

    /**
     * @readonly
     * @type {bigint}
     */
    y

    /**
     * @param {bigint} x
     * @param {bigint} y
     */
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    /**
     * @type {AffinePoint}
     */
    static get ZERO() {
        return new AffinePoint(0n, 1n)
    }

    /**
     * @type {AffinePoint}
     */
    static get BASE() {
        return new AffinePoint(Gx, Gy)
    }

    /**
     * The formula for the twisted Edwards curve is:
     *    -x^2 + y^2 = 1 - d*x^2*y^2
     * Calculating x from this we get (only y is stored in the encoded point):
     *    y^2 - 1 = x^2*(1 - d*y^2)
     *    x = sqrt((y^2 - 1)/(1 - d*y^2))
     * @param {number[]} bytes
     * @returns {AffinePoint}
     */
    static decode(bytes) {
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
        const x2 = (y2 - 1n) * invert(1n + D * y2, P)

        // sqrt
        let x = exp(x2, P38, P)
        if (mod(x * x - x2, P) != 0n) {
            x = (x * SQRT2P14) % P
        }

        // if odd state not equal, make odd state same
        if (Number(x & 1n) != finalBit) {
            x = P - x
        }

        const point = new AffinePoint(x, y)

        if (!point.isOnCurve()) {
            throw new Error("point isn't on curve")
        }

        return point
    }

    /**
     * Curve point 'addition'
     * Note: the invert call in this calculation is very slow (prefer ExtendedPoint for speed)
     * @param {AffinePoint} other
     * @returns {AffinePoint}
     */
    add(other) {
        const x1 = this.x
        const y1 = this.y
        const x2 = other.x
        const y2 = other.y

        const dxxyy = D * x1 * x2 * y1 * y2

        const x3 = (x1 * y2 + x2 * y1) * invert(1n + dxxyy, P)
        const y3 = (y1 * y2 + x1 * x2) * invert(1n - dxxyy, P)

        return new AffinePoint(mod(x3, P), mod(y3, P))
    }

    /**
     * @param {AffinePoint} other
     * @returns {boolean}
     */
    equals(other) {
        return equalsAffine(this, other)
    }

    /**
     * @returns {boolean}
     */
    isOnCurve() {
        const x = this.x
        const y = this.y

        const xx = x * x
        const yy = y * y

        return mod(-xx + yy - 1n - D * xx * yy, P) == 0n // TODO: is mod missing from the inner ops?
    }

    /**
     * @param {bigint} n
     * @returns {AffinePoint}
     */
    mul(n) {
        return mul(this, n, AffinePoint.ZERO)
    }

    /**
     * @returns {number[]}
     */
    encode() {
        const evenOdd = Number(this.x & 1n) // 0: even, 1: odd

        const bytes = encodeScalar(this.y)

        // last bit is determined by x
        bytes[31] = (bytes[31] & 0b011111111) | (evenOdd * 0b10000000)

        return bytes
    }

    /**
     * @returns {AffinePoint}
     */
    toAffine() {
        return this
    }
}
