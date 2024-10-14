import { ShortAffineImpl } from "../common/index.js"
import { F } from "./field.js"

/**
 * @template T
 * @typedef {import("../common/index.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {import("../common/index.js").ShortAffine<T>} ShortAffine
 */

/**
 * @type {ShortAffine<bigint>}
 */
export const affineCurve = new ShortAffineImpl(F, 7n)
