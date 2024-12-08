import { ShortAffineImpl } from "../../common/index.js"
import { F2 } from "../fields/index.js"

/**
 * @import { AffineCurve2 } from  "../../../index.js"
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
