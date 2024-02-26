/**
 * @template {CurvePoint<T>} T
 * @typedef {import("../CurvePoint.js").CurvePoint<T>} CurvePoint
 */

import { equalsExtended, mod, mul, invert } from "../common/index.js"
import { Gx, Gy, P } from "./constants.js"
import { AffinePoint } from "./AffinePoint.js"

/**
 *
 *
 * @implements {CurvePoint<ExtendedPoint>}
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
     * @param {bigint} x
     * @param {bigint} y
     * @param {bigint} z
     */
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    /**
     * @type {ExtendedPoint}
     */
    static get BASE() {
        return new ExtendedPoint(Gx, Gy, 1n)
    }

    /**
     * @type {ExtendedPoint}
     */
    static get ZERO() {
        return new ExtendedPoint(0n, 1n, 0n)
    }

    /**
     * @param {AffinePoint} p
     * @returns {ExtendedPoint}
     */
    static fromAffine(p) {
        if (p.isZero()) {
            return new ExtendedPoint(0n, 1n, 0n)
        } else {
            return new ExtendedPoint(p.x, p.y, 1n)
        }
    }

    /**
     * @param {number[]} bytes
     * @returns {ExtendedPoint}
     */
    static decode(bytes) {
        return ExtendedPoint.fromAffine(AffinePoint.decode(bytes))
    }

    /**
     * @returns {boolean}
     */
    isZero() {
        return this.equals(ExtendedPoint.ZERO)
    }

    /**
     * @returns {boolean}
     */
    isOnCurve() {
        return this.toAffine().isOnCurve()
    }

    /**
     * @param {ExtendedPoint} other
     * @returns {boolean}
     */
    equals(other) {
        return equalsExtended(this, other, P)
    }

    /**
     * Taken from https://github.com/paulmillr/noble-secp256k1
     * @param {ExtendedPoint} other
     * @returns {ExtendedPoint}
     */
    add(other) {
        const x1 = this.x
        const y1 = this.y
        const z1 = this.z

        const x2 = other.x
        const y2 = other.y
        const z2 = other.z

        let x3 = 0n
        let y3 = 0n
        let z3 = 0n

        // reuse the following temporary variables in order to have more concise lines of code
        let a = mod(x1 * x2, P)
        let b = mod(y1 * y2, P)
        const c = mod(z1 * z2, P)
        let d = mod(x1 + y1, P)
        let e = mod(x2 + y2, P)
        let f = mod(x2 + z2, P)

        d = mod(d * e, P)
        e = mod(a + b, P)
        d = mod(d - e, P)
        e = mod(x1 + z1, P)
        e = mod(e * f, P)
        f = mod(a + c, P)
        e = mod(e - f, P)
        f = mod(y1 + z1, P)
        x3 = mod(y2 + z2, P)
        f = mod(f * x3, P)
        x3 = mod(b + c, P)
        f = mod(f - x3, P)
        x3 = mod(21n * c, P)
        z3 = mod(x3 + z3, P)
        x3 = mod(b - z3, P)
        z3 = mod(b + z3, P)
        y3 = mod(x3 * z3, P)
        b = mod(a + a, P)
        b = mod(b + a, P)
        e = mod(21n * e, P)
        a = mod(b * e, P)
        y3 = mod(y3 + a, P)
        a = mod(f * e, P)
        x3 = mod(d * x3, P)
        x3 = mod(x3 - a, P)
        a = mod(d * b, P)
        z3 = mod(f * z3, P)
        z3 = mod(z3 + a, P)

        return new ExtendedPoint(x3, y3, z3)
    }

    /**
     * @param {bigint} n
     * @returns {ExtendedPoint}
     */
    mul(n) {
        return mul(this, n, ExtendedPoint.ZERO)
    }

    /**
     * @returns {number[]}
     */
    encode() {
        return this.toAffine().encode()
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
