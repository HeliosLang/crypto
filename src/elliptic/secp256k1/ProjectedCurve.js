import { ShortProjectedImpl } from "../common/index.js"
import { F } from "./field.js"

/**
 * @import { ShortProjected } from "../../internal.js"
 */

/**
 * @type {ShortProjected<bigint>}
 */
export const projectedCurve = new ShortProjectedImpl(F, 7n)
