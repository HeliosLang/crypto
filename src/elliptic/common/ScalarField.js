import { mod } from "./mod.js"

/**
 * @import { ScalarField } from "../../internal.js"
 */

/**
 * @param {bigint} modulo
 * @returns {ScalarField}
 */
export function makeScalarField(modulo) {
    return new ScalarFieldImpl(modulo)
}

/**
 * @implements {ScalarField}
 */
class ScalarFieldImpl {
    /**
     * Every operation is modulo this number
     * @readonly
     * @type {bigint}
     */
    modulo

    /**
     * @param {bigint} modulo
     */
    constructor(modulo) {
        this.modulo = modulo
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
     * @param {bigint} a
     * @param {bigint[]} b
     * @returns {bigint}
     */
    add(a, ...b) {
        return mod(
            b.reduce((sum, b) => sum + b, a),
            this.modulo
        )
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
     * @param {bigint} b
     * @returns {boolean}
     */
    equals(a, b) {
        return mod(a, this.modulo) === mod(b, this.modulo)
    }

    /**
     *  Invert a number on a field (i.e. calculate n^-1 so that n*n^-1 = 1)
     * This is an expensive iterative procedure that is only guaranteed to converge if the modulo is a prime number
     * @param {bigint} n
     * @returns {bigint}
     */
    invert(n) {
        let a = mod(n, this.modulo)
        let b = this.modulo

        let x = 0n
        let y = 1n
        let u = 1n
        let v = 0n

        while (a !== 0n) {
            const q = b / a
            const r = b % a
            const m = x - u * q
            const n = y - v * q
            b = a
            a = r
            x = u
            y = v
            u = m
            v = n
        }

        return mod(x, this.modulo)
    }
}
