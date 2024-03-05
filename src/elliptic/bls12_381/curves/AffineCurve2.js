import { ShortAffine } from "../../common/index.js"
import { F2 } from "../fields/index.js"

/**
 * @template T
 * @typedef {import("../../common/index.js").Point2<T>} Point2
 */

/**
 * @extends {ShortAffine<[bigint, bigint]>}
 */
class AffineCurve2 extends ShortAffine {
    constructor() {
        super(F2, [4n, 4n])
    }
}

/**
 * @type {ShortAffine<[bigint, bigint]>}
 */
export const affineCurve2 = new AffineCurve2()
