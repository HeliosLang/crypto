import { ShortAffineImpl } from "../common/index.js"
import { F } from "./field.js"

/**
 * @import { ShortAffine } from "../../internal.js"
 */

/**
 * @type {ShortAffine<bigint>}
 */
export const affineCurve = (() => /* @__PURE__ */ new ShortAffineImpl(F, 7n))()
