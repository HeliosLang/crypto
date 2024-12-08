import { ShortAffineImpl } from "../../common/index.js"
import { F1 } from "../fields/index.js"

/**
 * @import { AffineCurve1 } from "../../../index.js"
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
