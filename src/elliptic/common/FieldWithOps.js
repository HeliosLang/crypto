/**
 * @template T
 * @typedef {import("./Field.js").Field<T>} Field
 */

/**
 * Defines additional operations on a field (which use the basic operations as building blocks)
 *   * isZero(a)
 *   * isOne(a)
 *   * mod(a)
 *   * subtract(a, b)
 *   * negate(a)
 *   * square(a)
 *   * cube(a)
 *   * divide(a, b)
 *   * pow(a, p)
 *   * halve(a)
 *
 * @template T
 * @implements {Field<T>}
 */
export class FieldWithOps {
    /**
     * @readonly
     * @type {Field<T>}
     */
    F

    /**
     * @param {Field<T>} F
     */
    constructor(F) {
        this.F = F
    }

    /**
     * @type {T}
     */
    get ZERO() {
        return this.F.ZERO
    }

    /**
     * @type {T}
     */
    get ONE() {
        return this.F.ONE
    }

    /**
     * @param {T} a
     * @returns {boolean}
     */
    isZero(a) {
        return this.equals(a, this.ZERO)
    }

    /**
     * @param {T} a
     * @returns {boolean}
     */
    isOne(a) {
        return this.equals(a, this.ONE)
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    mod(a) {
        return this.F.scale(a, 1n)
    }

    /**
     * @param {T} a
     * @param {T[]} bs
     * @returns {T}
     */
    add(a, ...bs) {
        return this.F.add(a, ...bs)
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {T}
     */
    subtract(a, b) {
        const F = this.F
        return F.add(a, F.scale(b, -1n))
    }

    /**
     * @param {T} a
     * @param {bigint} s
     * @returns {T}
     */
    scale(a, s) {
        return this.F.scale(a, s)
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    negate(a) {
        return this.F.scale(a, -1n)
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {T}
     */
    multiply(a, b) {
        return this.F.multiply(a, b)
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    square(a) {
        return this.F.multiply(a, a)
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    cube(a) {
        return this.F.multiply(a, this.F.multiply(a, a))
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {T}
     */
    divide(a, b) {
        return this.F.multiply(a, this.F.invert(b))
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    invert(a) {
        return this.F.invert(a)
    }

    /**
     * Modular exponent
     * TODO: would a non-recursive version of this algorithm be faster?
     * @param {T} a
     * @param {bigint} p
     * @returns {T}
     */
    pow(a, p) {
        if (p == 0n) {
            return this.F.ONE
        } else if (p == 1n) {
            return a
        } else {
            let t = this.pow(a, p / 2n)
            t = this.F.multiply(t, t)

            if (p % 2n != 0n) {
                t = this.F.multiply(t, a)
            }

            return t
        }
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {boolean}
     */
    equals(a, b) {
        return this.F.equals(a, b)
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    halve(a) {
        return this.divide(a, this.F.scale(this.F.ONE, 2n))
    }
}
