import { ShortAffineImpl } from "../../common/index.js"
import { F1 } from "../fields/index.js"

/**
 * @template T
 * @typedef {import("../../common/index.js").ShortAffine<T>} ShortAffine
 */

/**
 * @typedef {ShortAffine<bigint>} AffineCurve1
 */

/**
 * @implements {AffineCurve1}
 * @extends {ShortAffineImpl<bigint>}
 */
class AffineCurve1Impl extends ShortAffineImpl {
    constructor() {
        super(F1, 4n)
    }
}

/**
 * @type {AffineCurve1}
 */
export const affineCurve1 = new AffineCurve1Impl()
