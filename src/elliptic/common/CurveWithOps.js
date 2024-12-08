/**
 * @import { Curve, CurveWithOps } from "../../internal.js"
 */

/**
 * @template T
 * @template {Curve<T>} [C=Curve<T>]
 * @param {C} curve
 * @returns {CurveWithOps<T>}
 */
export function makeCurveWithOps(curve) {
    return new CurveWithOpsImpl(curve)
}

/**
 * @template T
 * @template {Curve<T>} [C=Curve<T>]
 * @implements {CurveWithOps<T>}
 */
export class CurveWithOpsImpl {
    /**
     * @readonly
     * @protected
     * @type {C}
     */
    curve

    /**
     * @param {C} curve
     */
    constructor(curve) {
        this.curve = curve
    }

    /**
     * @type {T}
     */
    get ZERO() {
        return this.curve.ZERO
    }

    /**
     * @param {T} point
     * @returns {boolean}
     */
    isZero(point) {
        return this.curve.equals(this.curve.ZERO, point)
    }

    /**
     * @param {T} point
     * @returns {boolean}
     */
    isValidPoint(point) {
        return this.curve.isValidPoint(point)
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {boolean}
     */
    equals(a, b) {
        return this.curve.equals(a, b)
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {T}
     */
    add(a, b) {
        return this.curve.add(a, b)
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {T}
     */
    subtract(a, b) {
        return this.curve.add(a, this.curve.negate(b))
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    negate(a) {
        return this.curve.negate(a)
    }

    /**
     * Double-and-add algorithm
     * Seems to have acceptable performance.
     * Not constant-time, but for the signing algorithms this scalar is always a random private number
     * @param {T} point
     * @param {bigint} s
     * @returns {T}
     */
    scale(point, s) {
        if (s == 0n) {
            console.log("scale returning 0")
            return this.curve.ZERO
        } else if (s == 1n) {
            return point
        } else if (s < 0n) {
            return this.scale(this.curve.negate(point), -s)
        } else {
            let sum = this.scale(point, s / 2n)

            sum = this.curve.add(sum, sum)

            if (s % 2n != 0n) {
                sum = this.curve.add(sum, point)
            }

            return sum
        }
    }
}
