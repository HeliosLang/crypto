import {
    FieldWithOpsImpl,
    makeFieldWithOps,
    makeScalarField
} from "../common/index.js"
import { N, P } from "./constants.js"

/**
 * @import { FieldWithOps, FieldWithSqrt } from "../../internal.js"
 */

// (P + 3n)/8n
const P38 =
    7237005577332262213973186563042994240829374041602535252466099000494570602494n

// pow(2n, (P + 1n)/4n, P);
const SQRT2P14 =
    19681161376707505956807079304988542015446066515923890162744021073123829784752n

/**
 * Field for coordinate operations
 * @implements {FieldWithSqrt}
 * @extends {FieldWithOpsImpl<bigint>}
 */
class WithSqrtImpl extends FieldWithOpsImpl {
    constructor() {
        super(makeScalarField(P))
    }

    /**
     * @param {bigint} a
     * @returns {bigint}
     */
    sqrt(a) {
        let r = this.pow(a, P38)

        const r2 = this.multiply(r, r)

        if (!this.equals(r2, a)) {
            r = this.multiply(r, SQRT2P14)
        }

        return r
    }
}

/**
 * @type {FieldWithSqrt}
 */
export const F = new WithSqrtImpl()

/**
 * @type {FieldWithOps<bigint>}
 */
export const Z = makeFieldWithOps(makeScalarField(N))
