/**
 * @import { Field } from "../../internal.js"
 */

/**
 * @template T
 * @param {Field<T>} F
 * @param {T} a
 * @param {T} b
 * @returns {T}
 */
export function subtract(F, a, b) {
    return F.add(a, F.scale(b, -1n))
}
