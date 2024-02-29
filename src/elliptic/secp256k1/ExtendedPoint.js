import { equalsExtended, scalePoint } from "../common/index.js"
import { Gx, Gy, P } from "./constants.js"
import { AffinePoint } from "./AffinePoint.js"
import { F } from "./field.js"

/**
 * @template {Point<T>} T
 * @typedef {import("../common/index.js").Point<T>} Point
 */

/**
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
        let a = F.multiply(x1, x2)
        let b = F.multiply(y1, y2)
        const c = F.multiply(z1, z2)
        let d = F.add(x1, y1)
        let e = F.add(x2, y2)
        let f = F.add(x2, z2)

        d = F.multiply(d, e)
        e = F.add(a, b)
        d = F.add(d, -e)
        e = F.add(x1, z1)
        e = F.multiply(e, f)
        f = F.add(a, c)
        e = F.add(e, -f)
        f = F.add(y1, z1)
        x3 = F.add(y2, z2)
        f = F.multiply(f, x3)
        x3 = F.add(b, c)
        f = F.add(f, -x3)
        x3 = F.multiply(21n, c)
        z3 = F.add(x3, z3)
        x3 = F.add(b, -z3)
        z3 = F.add(b, z3)
        y3 = F.multiply(x3, z3)
        b = F.add(a, a)
        b = F.add(b, a)
        e = F.multiply(21n, e)
        a = F.multiply(b, e)
        y3 = F.add(y3, a)
        a = F.multiply(f, e)
        x3 = F.multiply(d, x3)
        x3 = F.add(x3, -a)
        a = F.multiply(d, b)
        z3 = F.multiply(f, z3)
        z3 = F.add(z3, a)

        return new ExtendedPoint(x3, y3, z3)
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
        return new ExtendedPoint(this.x, F.scale(this.y, -1n), this.z)
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
            const zInverse = F.invert(this.z)

            return new AffinePoint(
                F.multiply(this.x, zInverse),
                F.multiply(this.y, zInverse)
            )
        }
    }
}
