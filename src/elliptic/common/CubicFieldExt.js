/**
 * @import { AssertExtends } from "@helios-lang/type-utils"
 * @import { CubicFieldExt, FieldWithOps } from "../../internal.js"
 */

/**
 * @template T
 * @param {FieldWithOps<T>} F
 * @param {T} V3
 * @returns {CubicFieldExt<T>}
 */
export function makeCubicFieldExt(F, V3) {
    return new CubicFieldExtImpl(F, V3)
}

/**
 * Each element consists of three coordinates, written as a + b*v + c*v^2
 * Standard multiplication and addition rules apply.
 * Remember, each coefficient in turn consist of two coordinates:
 *    (ax + ay*u) + (bx + by*u)*v + (cx + cy*u)*v^2
 * @template T
 * @implements {CubicFieldExt<T>}
 */
class CubicFieldExtImpl {
    /**
     * @readonly
     * @type {FieldWithOps<T>}
     */
    F

    /**
     * When multiply these cubic polynomials, we can always replace v^3 by this constant
     * @readonly
     * @type {T}
     */
    V3

    /**
     * @param {FieldWithOps<T>} F
     * @param {T} V3
     */
    constructor(F, V3) {
        this.F = F
        this.V3 = V3
    }

    /**
     * @type {[T, T, T]}
     */
    get ZERO() {
        const F = this.F

        return [F.ZERO, F.ZERO, F.ZERO]
    }

    /**
     * @type {[T, T, T]}
     */
    get ONE() {
        const F = this.F

        return [F.ONE, F.ZERO, F.ZERO]
    }

    /**
     * @param {[T, T, T]} a
     * @param {[T, T, T][]} b
     * @returns {[T, T, T]}
     */
    add([ax, ay, az], ...b) {
        const F = this.F

        return [
            F.add(ax, ...b.map((b) => b[0])),
            F.add(ay, ...b.map((b) => b[1])),
            F.add(az, ...b.map((b) => b[2]))
        ]
    }

    /**
     * @param {[T, T, T]} a
     * @param {bigint} s
     * @returns {[T, T, T]}
     */
    scale([ax, ay, az], s) {
        const F = this.F

        return [F.scale(ax, s), F.scale(ay, s), F.scale(az, s)]
    }

    /**
     * @param {[T, T, T]} a
     * @param {[T, T, T]} b
     * @returns {boolean}
     */
    equals([ax, ay, az], [bx, by, bz]) {
        const F = this.F
        return F.equals(ax, bx) && F.equals(ay, by) && F.equals(az, bz)
    }

    /**
     * (ax + ay*v + az*v^2)*(bx + by*v + bz*v^2)
     *  = ax*bx + ax*by*v + ax*bz*v^2 + ay*bx*v + ay*by*v^2 + ay*bz*v^3 + az*bx*v^2 + az*by*v^3 + az*bz*v^4
     *  = ax*bx + (ay*bz + az*by)*(u + 1)
     *  + (ax*by + ay*bx + az*bz*(u + 1))*v
     *  + (ax*bz + ay*by + az*bx)*v^2
     * @param {[T, T, T]} a
     * @param {[T, T, T]} b
     * @returns {[T, T, T]}
     */
    multiply([ax, ay, az], [bx, by, bz]) {
        const F = this.F
        const V3 = this.V3

        return [
            F.add(
                F.multiply(ax, bx),
                F.multiply(F.add(F.multiply(ay, bz), F.multiply(az, by)), V3)
            ),
            F.add(
                F.multiply(ax, by),
                F.multiply(ay, bx),
                F.multiply(F.multiply(az, bz), V3)
            ),
            F.add(F.multiply(ax, bz), F.multiply(ay, by), F.multiply(az, bx))
        ]
    }

    /**
     * Calculates 1/(a + b*v + c*v^2)
     *
     * This can be expressed in terms of an inverse of the embedded field by multiplying numerator and denominator by:
     *   (a^2 - b*c*(u+1)) + (c^2*(u+1) - a*b)*v + (b^2 - a*c)*v^2
     *
     * All the v and v^2 coefficients in the denominator cancel out
     * @param {[T, T, T]} x
     * @returns {[T, T, T]}
     */
    invert([a, b, c]) {
        const F = this.F
        const V3 = this.V3

        const d = F.subtract(F.square(a), F.multiply(F.multiply(b, c), V3))

        const e = F.subtract(F.multiply(F.square(c), V3), F.multiply(a, b))

        const f = F.subtract(F.square(b), F.multiply(a, c))

        const den = F.add(F.multiply(a, d), F.multiply(b, f), F.multiply(c, e))

        const denI = F.invert(den)

        return [F.multiply(d, denI), F.multiply(e, denI), F.multiply(f, denI)]
    }
}
