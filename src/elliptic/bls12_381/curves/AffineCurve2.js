import { ShortAffineImpl } from "../../common/index.js"
import { F2 } from "../fields/index.js"

/**
 * @template T
 * @typedef {import("../../common/index.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {import("../../common/index.js").ShortAffine<T>} ShortAffine
 */

/**
 * @typedef {ShortAffine<[bigint, bigint]>} AffineCurve2
 */

/**
 * @implements {AffineCurve2}
 * @extends {ShortAffineImpl<[bigint, bigint]>}
 */
class AffineCurve2Impl extends ShortAffineImpl {
    constructor() {
        super(F2, [4n, 4n])
    }
}

/**
 * @type {AffineCurve2}
 */
export const affineCurve2 = new AffineCurve2Impl()
