import { ShortAffine } from "../common/index.js"
import { F } from "./field.js"

/**
 * @template T
 * @typedef {import("../common/index.js").Point2<T>} Point2
 */

export const affineCurve = new ShortAffine(F, 7n)
