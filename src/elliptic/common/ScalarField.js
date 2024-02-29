import { exp, invert, mod } from "./arithmetic.js"

/**
 * @template T
 * @typedef {import("./Field.js").Field<T>} Field
 */

/**
 * @implements {Field<bigint>}
 */
export class ScalarField {
    /**
     * Every operation is modulo this number
     * @readonly
     * @type {bigint}
     */
    modulo

    /**
     * Constants used during sqrt
     * @private
     * @type {{
     *   modulo14?: bigint
     *   modulo38?: bigint
     *   sqrt2modulo14?: bigint
     * }}
     */
    cache

    /**
     * @param {bigint} modulo
     */
    constructor(modulo) {
        this.modulo = modulo

        this.cache = {}
    }

    /**
     * @type {bigint}
     */
    get ZERO() {
        return 0n
    }

    /**
     * @type {bigint}
     */
    get ONE() {
        return 1n
    }

    /**
     * @private
     * @type {bigint}
     */
    get modulo14() {
        let res = this.cache.modulo14

        if (!res) {
            this.cache.modulo14 = res = (this.modulo + 1n) / 4n
        }

        return res
    }

    /**
     * @private
     * @type {bigint}
     */
    get modulo38() {
        let res = this.cache.modulo38

        if (!res) {
            this.cache.modulo38 = res = (this.modulo + 3n) / 8n
        }

        return res
    }

    /**
     * @private
     * @type {bigint}
     */
    get sqrt2modulo14() {
        let res = this.cache.sqrt2modulo14

        if (!res) {
            this.cache.sqrt2modulo14 = res = exp(2n, this.modulo14, this.modulo)
        }

        return res
    }

    /**
     * @param {bigint} a
     * @param {bigint} b
     * @returns {bigint}
     */
    add(a, b) {
        return mod(a + b, this.modulo)
    }

    /**
     * @param {bigint} a
     * @param {bigint} n
     * @returns {bigint}
     */
    scale(a, n) {
        return mod(a * n, this.modulo)
    }

    /**
     * Implemented separately from `scale` because it has a different meaning
     * @param {bigint} a
     * @param {bigint} b
     * @returns {bigint}
     */
    multiply(a, b) {
        return mod(a * b, this.modulo)
    }

    /**
     * @param {bigint} a
     * @param {bigint} p
     * @returns {bigint}
     */
    pow(a, p) {
        return exp(a, p, this.modulo)
    }

    /**
     * @param {bigint} a
     * @param {bigint} b
     * @returns {boolean}
     */
    equals(a, b) {
        return mod(a, this.modulo) === mod(b, this.modulo)
    }

    /**
     * @param {bigint} a
     * @returns {bigint}
     */
    invert(a) {
        return invert(a, this.modulo)
    }

    /**
     * @param {bigint} a
     * @returns {bigint}
     */
    sqrt(a) {
        /**
         * @type {bigint}
         */
        let res

        if (this.modulo % 4n == 3n) {
            res = exp(a, this.modulo14, this.modulo)

            if (mod(res * res, this.modulo) != a) {
                throw new Error("sqrt failed")
            }
        } else if (this.modulo % 8n == 5n) {
            res = exp(a, this.modulo38, this.modulo)

            if (mod(res * res - a, this.modulo) != 0n) {
                res = (res * this.sqrt2modulo14) % this.modulo
            }
        } else {
            throw new Error("don't know how to sqrt with this modulo")
        }

        return res
    }
}
