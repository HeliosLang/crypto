import { FieldWithOps, ScalarField } from "../common/index.js"
import { N, P } from "./constants.js"

// (P + 1n)/4n
const P14 =
    28948022309329048855892746252171976963317496166410141009864396001977208667916n

/**
 * @extends {FieldWithOps<bigint>}
 */
class WithSqrt extends FieldWithOps {
    constructor() {
        super(new ScalarField(P))
    }

    /**
     * @param {bigint} a
     * @returns {bigint}
     */
    sqrt(a) {
        const r = this.pow(a, P14)

        const r2 = this.multiply(r, r)

        if (!this.equals(r2, a)) {
            throw new Error("sqrt failed")
        }

        return r
    }
}

export const F = new WithSqrt()

export const Z = new FieldWithOps(new ScalarField(N))
