import { equalsAffine, mul, exp, invert, mod } from "../common/index.js"
import { decodeScalar, encodeScalar } from "./codec.js"
import { Gx, Gy, P, P14 } from "./constants.js"

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

        const y2 = mod(mod(x * x, P) * x + 7n, P)

        // sqrt
        let y = exp(y2, P14, P)

        if (head == 0x03) {
            if (y % 2n == 0n) {
                y = mod(-y, P)
            }
        } else if (head != 0x02) {
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
        return equalsAffine(this, AffinePoint.ZERO)
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

        const x2 = mod(x * x, P)
        const x3 = mod(x2 * x, P)
        const y2 = mod(y * y, P)

        return mod(y2 - x3 - 7n, P) == 0n
    }

    /**
     * @param {bigint} scalar
     * @returns {AffinePoint}
     */
    mul(scalar) {
        return mul(this, scalar, AffinePoint.ZERO)
    }

    /**
     *
     * @returns {AffinePoint}
     */
    neg() {
        if (this.isZero()) {
            return this
        } else {
            return new AffinePoint(this.x, mod(-this.y, P))
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
        if (mod(this.x + other.x, P) == 0n) {
            return AffinePoint.ZERO
        }

        const dx = mod(this.x - other.x, P)
        const dy = mod(this.y - other.y, P)
        const s = mod(dy * invert(dx, P), P)
        const s2 = mod(s * s, P)

        const nx = mod(s2 - this.x - other.x, P)
        const ny = mod(mod(s * mod(this.x - nx, P), P) - this.y, P)

        return new AffinePoint(nx, ny)
    }

    /**
     * Taken from https://bitcoin.stackexchange.com/questions/119860/how-to-convert-the-results-of-point-doubling-rx1-and-ry1-to-point-addition-rx
     * @returns {AffinePoint}
     */
    double() {
        const tx = mod(2n * this.x, P)
        const ty = mod(2n * this.y, P)

        const x2 = mod(this.x * this.x, P)
        const tyi = invert(ty, P)

        const s = mod(mod(3n * x2, P) * tyi, P)
        const s2 = mod(s * s, P)

        const nx = mod(s2 - tx, P)
        const ny = mod(mod(s * mod(this.x - nx, P), P) - this.y, P)

        return new AffinePoint(nx, ny)
    }

    /**
     * @param {AffinePoint} other
     * @returns {boolean}
     */
    equals(other) {
        return equalsAffine(this, other)
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
