import { ShortProjectedImpl } from "../common/index.js"
import { F } from "./field.js"

/**
 * @template {bigint | [bigint, bigint]} T
 * @typedef {import("../common/index.js").ShortProjected<T>} ShortProjected
 */

/**
 * @type {ShortProjected<bigint>}
 */
export const projectedCurve = new ShortProjectedImpl(F, 7n)
