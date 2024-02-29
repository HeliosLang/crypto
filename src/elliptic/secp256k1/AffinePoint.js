import { scalePoint } from "../common/index.js"
import { decodeScalar, encodeScalar } from "./codec.js"
import { Gx, Gy, P } from "./constants.js"
import { F } from "./field.js"

/**
 * @template {Point<T>} T
 * @typedef {import("../common/index.js").Point<T>} Point
 */

/**
 * @implements {Point<AffinePoint>}
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
     * @param {number[]} bytes
     * @returns {AffinePoint}
     */
    static decode(bytes) {
        if (bytes.length != 33) {
            throw new Error(
                `expected 33 bytes for encoded point, got ${bytes.length}`
            )
        }

        const head = bytes[0]

        const x = decodeScalar(bytes.slice(1))

        if (x <= 0n || x >= P) {
            throw new Error(`x coordinate out of range`)
        }

        const x3 = F.multiply(F.multiply(x, x), x)
        const y2 = F.add(x3, 7n)

        // sqrt
        let y = F.sqrt(y2)

        if (head == 0x03) {
            if (y % 2n == 0n) {
                y = F.scale(y, -1n)
            }
        } else if (head == 0x02) {
            if (y % 2n != 0n) {
                y = F.scale(y, -1n)
            }
        } else {
            throw new Error(`unexpected header byte ${head}`)
        }

        const point = new AffinePoint(x, y)

        if (!point.isOnCurve()) {
            throw new Error("point not on curve")
        }

        return point
    }

    /**
     * @returns {boolean}
     */
    isZero() {
        return this.x == AffinePoint.ZERO.x && this.y == AffinePoint.ZERO.y
    }

    /**
     * Check that the elliptic equation for Secp256k1 holds:
     *   `y*y === x*x*x + 7`
     * @returns {boolean}
     */
    isOnCurve() {
        if (this.isZero()) {
            return true
        }

        const x = this.x
        const y = this.y

        const x2 = F.multiply(x, x)
        const x3 = F.multiply(x2, x)
        const y2 = F.multiply(y, y)

        return F.add(y2 - x3, -7n) == 0n
    }

    /**
     * @param {bigint} scalar
     * @returns {AffinePoint}
     */
    mul(scalar) {
        return scalePoint(this, scalar, AffinePoint.ZERO)
    }

    /**
     *
     * @returns {AffinePoint}
     */
    neg() {
        if (this.isZero()) {
            return this
        } else {
            return new AffinePoint(this.x, F.scale(this.y, -1n))
        }
    }

    /**
     * Taken from https://bitcoin.stackexchange.com/questions/119860/how-to-convert-the-results-of-point-doubling-rx1-and-ry1-to-point-addition-rx
     * Edge cases taken from Elliptic.js library
     * @param {AffinePoint} other
     * @returns {AffinePoint}
     */
    add(other) {
        // P + P = 2P
        if (this.equals(other)) {
            return this.double()
        }

        // P + (-P) = O
        if (this.neg().equals(other)) {
            return AffinePoint.ZERO
        }

        // P + Q = O
        if (F.add(this.x, other.x) == 0n) {
            return AffinePoint.ZERO
        }

        const dx = F.add(this.x, -other.x)
        const dy = F.add(this.y, -other.y)
        const s = F.multiply(dy, F.invert(dx))
        const s2 = F.multiply(s, s)

        const nx = F.add(s2 - this.x, -other.x)
        const ny = F.add(F.multiply(s, F.add(this.x, -nx)), -this.y)

        return new AffinePoint(nx, ny)
    }

    /**
     * Taken from https://bitcoin.stackexchange.com/questions/119860/how-to-convert-the-results-of-point-doubling-rx1-and-ry1-to-point-addition-rx
     * @returns {AffinePoint}
     */
    double() {
        const tx = F.scale(this.x, 2n)
        const ty = F.scale(this.y, 2n)

        const x2 = F.multiply(this.x, this.x)
        const tyi = F.invert(ty)

        const s = F.multiply(F.scale(x2, 3n), tyi)
        const s2 = F.multiply(s, s)

        const nx = F.add(s2, -tx)
        const ny = F.add(F.multiply(s, F.add(this.x, -nx)), -this.y)

        return new AffinePoint(nx, ny)
    }

    /**
     * @param {AffinePoint} other
     * @returns {boolean}
     */
    equals(other) {
        return F.equals(this.x, other.x) && F.equals(this.y, other.y)
    }

    /**
     * @returns {number[]}
     */
    encode() {
        const head = this.y % 2n == 0n ? 0x02 : 0x03

        return [head].concat(encodeScalar(this.x))
    }

    /**
     * @returns {AffinePoint}
     */
    toAffine() {
        return this
    }
}
