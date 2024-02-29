/**
 * @template T
 * @typedef {import("./Curve.js").Curve<T>} Curve
 */

import { FieldHelper } from "./FieldHelper.js"

/**
 * @template T
 * @typedef {import("./Field.js").Field<T>} Field
 */
/**
 * @template T
 * @typedef {import("./Point3.js").Point3<T>} Point3
 */

/**
 * Short weierstrass in extended form.
 * If we denote the affine coordinates using apostrophes we get
 *    x' = x/z and y' = y/z
 *    z*y^2 = x^3 + b*z^3 (ignoring `a` which will be zero in all relevant cases for Cardano)
 * @template T bigint or [bigint, bigint]
 * @implements {Curve<Point3<T>>}
 */
export class ShortProjected {
    /**
     * @readonly
     * @type {Point3<T>}
     */
    ZERO

    /**
     * @readonly
     * @type {FieldHelper<T>}
     */
    F

    /**
     * Coefficient of curve formula
     * @private
     * @readonly
     * @type {T}
     */
    b

    /**
     * @param {Point3<T>} ZERO
     * @param {Field<T>} F
     * @param {T} b
     */
    constructor(ZERO, F, b) {
        this.ZERO = ZERO
        this.F = new FieldHelper(F)
        this.b = b
    }

    /**
     * @param {Point3<T>} a
     * @param {Point3<T>} b
     * @returns {boolean}
     */
    equals(a, b) {
        const F = this.F

        return (
            F.multiply(a.x, b.z) == F.multiply(b.x, a.z) &&
            F.multiply(a.y, b.z) == F.multiply(b.y, a.z)
        )
    }

    /**
     * @param {Point3<T>} point
     * @returns {boolean}
     */
    isValidPoint(point) {
        if (this.equals(point, this.ZERO)) {
            return true
        } else {
            const F = this.F
            const { x, y, z } = point

            const y2 = F.square(y)
            const lhs = F.multiply(z, y2)

            const x3 = F.cube(x)
            const z3 = F.cube(z)
            const bz3 = F.multiply(this.b, z3)
            const rhs = F.add(x3, bz3)

            return F.equals(lhs, rhs)
        }
    }

    /**
     *
     * @param {Point3<T>} point
     * @returns {Point3<T>}
     */
    negate(point) {
        return {
            x: point.x,
            y: this.F.negate(point.y),
            z: point.z
        }
    }

    /**
     * Taken from https://github.com/paulmillr/noble-secp256k1
     * Which in turns takes this formula from https://www.hyperelliptic.org/EFD/g1p/auto-shortw-projective.html (add-2015-rcb)
     * @param {Point3<T>} point1
     * @param {Point3<T>} point2
     * @returns {Point3<T>}
     */
    add(point1, point2) {
        const F = this.F

        const { x: x1, y: y1, z: z1 } = point1
        const { x: x2, y: y2, z: z2 } = point2

        /**
         * @type {T}
         */
        let x3

        /**
         * @type {T}
         */
        let y3

        /**
         * @type {T}
         */
        let z3

        const b3 = F.scale(this.b, 3n)

        // reuse the following temporary variables in order to have more concise lines of code
        let t0 = F.multiply(x1, x2)
        let t1 = F.multiply(y1, y2)
        let t2 = F.multiply(z1, z2)
        let t3 = F.add(x1, y1)
        let t4 = F.add(x2, y2)
        let t5 = F.add(x2, z2)

        t3 = F.multiply(t3, t4)
        t4 = F.add(t0, t1)
        t3 = F.subtract(t3, t4)
        t4 = F.add(x1, z1)
        t5 = F.add(t0, t2)
        t4 = F.multiply(t4, t5)

        t4 = F.subtract(t4, t5)
        t5 = F.add(y1, z1)
        x3 = F.add(y2, z2)
        t5 = F.multiply(t5, x3)
        x3 = F.add(t1, t2)
        t5 = F.subtract(t5, x3)
        x3 = F.multiply(b3, t2)
        z3 = x3
        x3 = F.subtract(t1, z3)
        z3 = F.add(t1, z3)
        y3 = F.multiply(x3, z3)
        t1 = F.add(t0, t0)
        t1 = F.add(t1, t0)
        t4 = F.multiply(b3, t4)
        t0 = F.multiply(t1, t4)
        y3 = F.add(y3, t0)
        t0 = F.multiply(t5, t4)
        x3 = F.multiply(t3, x3)
        x3 = F.subtract(x3, t0)
        t0 = F.multiply(t3, t1)
        z3 = F.multiply(t5, z3)
        z3 = F.add(z3, t0)

        return {
            x: x3,
            y: y3,
            z: z3
        }
    }
}
