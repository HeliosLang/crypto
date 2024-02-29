import { equalsExtended, scalePoint } from "../common/index.js"
import { AffinePoint } from "./AffinePoint.js"
import { D, P } from "./constants.js"
import { F } from "./field.js"

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
            F.multiply(AffinePoint.BASE.x, AffinePoint.BASE.y)
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
            F.multiply(affine.x, affine.y)
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

        const a = F.multiply(x1, x2)
        const b = F.multiply(y1, y2)
        const c = F.multiply(D * t1, t2)
        const d = F.multiply(z1, z2)
        const e = F.add((x1 + y1) * (x2 + y2), -a - b)
        const f = F.add(d, -c)
        const g = F.add(d, c)
        const h = F.add(a, b)
        const x3 = F.multiply(e, f)
        const y3 = F.multiply(g, h)
        const z3 = F.multiply(f, g)
        const t3 = F.multiply(e, h)

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
            F.scale(this.x, -1n),
            this.y,
            this.z,
            F.scale(this.t, -1n)
        )
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
