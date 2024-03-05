import { ShortAffine } from "../../common/index.js"
import { F1 } from "../fields/index.js"

/**
 * @extends {ShortAffine<bigint>}
 */
class AffineCurve1 extends ShortAffine {
    constructor() {
        super(F1, 4n)
    }
}

export const affineCurve1 = new AffineCurve1()
