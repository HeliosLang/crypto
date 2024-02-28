import { equalsExtended, invert, mod, scalePoint } from "../common/index.js"
import { AffinePoint } from "./AffinePoint.js"
import { D, P } from "./constants.js"

/**
 * @template {Point<T>} T
 * @typedef {import("../common/index.js").Point<T>} Point<T>
 */

/**
 * ExtendedPoint implementation taken from: [https://github.com/paulmillr/noble-ed25519](https://github.com/paulmillr/noble-ed25519).
 * @implements {Point<ExtendedPoint>}
 */
export class ExtendedPoint {
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
     * @readonly
     * @type {bigint}
     */
    z

    /**
     * @readonly
     * @type {bigint}
     */
    t

    /**
     * @param {bigint} x
     * @param {bigint} y
     * @param {bigint} z
     * @param {bigint} t
     */
    constructor(x, y, z, t) {
        this.x = x
        this.y = y
        this.z = z
        this.t = t
    }

    /**
     * @type {ExtendedPoint}
     */
    static get BASE() {
        return new ExtendedPoint(
            AffinePoint.BASE.x,
            AffinePoint.BASE.y,
            1n,
            mod(AffinePoint.BASE.x * AffinePoint.BASE.y, P)
        )
    }

    /**
     * @type {ExtendedPoint}
     */
    static get ZERO() {
        return new ExtendedPoint(0n, 1n, 1n, 0n)
    }

    /**
     * @param {number[]} bytes
     * @returns {ExtendedPoint}
     */
    static decode(bytes) {
        return ExtendedPoint.fromAffine(AffinePoint.decode(bytes))
    }

    /**
     * @param {AffinePoint} affine
     * @returns {ExtendedPoint}
     */
    static fromAffine(affine) {
        return new ExtendedPoint(
            affine.x,
            affine.y,
            1n,
            mod(affine.x * affine.y, P)
        )
    }

    /**
     * @param {ExtendedPoint} other
     * @returns {ExtendedPoint}
     */
    add(other) {
        const x1 = this.x
        const y1 = this.y
        const z1 = this.z
        const t1 = this.t

        const x2 = other.x
        const y2 = other.y
        const z2 = other.z
        const t2 = other.t

        const a = mod(x1 * x2, P)
        const b = mod(y1 * y2, P)
        const c = mod(D * t1 * t2, P)
        const d = mod(z1 * z2, P)
        const e = mod((x1 + y1) * (x2 + y2) - a - b, P) // TODO: is mod missing from the inner operations?
        const f = mod(d - c, P)
        const g = mod(d + c, P)
        const h = mod(a + b, P)
        const x3 = mod(e * f, P)
        const y3 = mod(g * h, P)
        const z3 = mod(f * g, P)
        const t3 = mod(e * h, P)

        return new ExtendedPoint(x3, y3, z3, t3)
    }

    /**
     * @returns {number[]}
     */
    encode() {
        return this.toAffine().encode()
    }

    /**
     * @param {ExtendedPoint} other
     * @returns {boolean}
     */
    equals(other) {
        return equalsExtended(
            this.x,
            this.y,
            this.z,
            other.x,
            other.y,
            other.z,
            P
        )
    }

    /**
     * @returns {boolean}
     */
    isBase() {
        return this.equals(ExtendedPoint.BASE)
    }

    /**
     * @returns {boolean}
     */
    isZero() {
        return this.equals(ExtendedPoint.ZERO)
    }

    /**
     * @param {bigint} n
     * @returns {ExtendedPoint}
     */
    mul(n) {
        return scalePoint(this, n, ExtendedPoint.ZERO)
    }

    /**
     * @returns {ExtendedPoint}
     */
    neg() {
        return new ExtendedPoint(
            mod(-this.x, P),
            this.y,
            this.z,
            mod(-this.t, P)
        )
    }

    /**
     * @returns {AffinePoint}
     */
    toAffine() {
        if (this.isZero()) {
            return AffinePoint.ZERO
        } else {
            const zInverse = invert(this.z, P)

            return new AffinePoint(
                mod(this.x * zInverse, P),
                mod(this.y * zInverse, P)
            )
        }
    }
}
