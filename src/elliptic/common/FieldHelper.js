/**
 * @template T
 * @typedef {import("./Field.js").Field<T>} Field
 */

/**
 * @template T
 * @implements {Field<T>}
 */
export class FieldHelper {
    /**
     * @type {Field<T>}
     */
    #F

    /**
     * @param {Field<T>} F
     */
    constructor(F) {
        this.#F = F
    }

    /**
     * @type {T}
     */
    get ZERO() {
        return this.#F.ZERO
    }

    /**
     * @type {T}
     */
    get ONE() {
        return this.#F.ONE
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
     * @param {T} b
     * @returns {T}
     */
    add(a, b) {
        return this.#F.add(a, b)
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {T}
     */
    subtract(a, b) {
        const F = this.#F
        return F.add(a, F.scale(b, -1n))
    }

    /**
     * @param {T} a
     * @param {bigint} s
     * @returns {T}
     */
    scale(a, s) {
        return this.#F.scale(a, s)
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    negate(a) {
        return this.#F.scale(a, -1n)
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {T}
     */
    multiply(a, b) {
        return this.#F.multiply(a, b)
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    square(a) {
        return this.#F.multiply(a, a)
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    cube(a) {
        return this.#F.multiply(a, this.#F.multiply(a, a))
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {T}
     */
    divide(a, b) {
        return this.#F.multiply(a, this.#F.invert(b))
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    sqrt(a) {
        return this.#F.sqrt(a)
    }

    /**
     * @param {T} a
     * @returns {T}
     */
    invert(a) {
        return this.#F.invert(a)
    }

    /**
     * @param {T} a
     * @param {bigint} p
     * @returns {T}
     */
    pow(a, p) {
        return this.#F.pow(a, p)
    }

    /**
     * @param {T} a
     * @param {T} b
     * @returns {boolean}
     */
    equals(a, b) {
        return this.#F.equals(a, b)
    }
}
