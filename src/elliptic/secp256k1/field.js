import { FieldWithOpsImpl, ScalarField } from "../common/index.js"
import { N, P } from "./constants.js"

/**
 * @template T
 * @typedef {import("../common/index.js").FieldWithOps<T>} FieldWithOps
 */

// (P + 1n)/4n
const P14 =
    28948022309329048855892746252171976963317496166410141009864396001977208667916n

/**
 * @extends {FieldWithOpsImpl<bigint>}
 */
class WithSqrt extends FieldWithOpsImpl {
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

/**
 * @type {FieldWithOps<bigint>}
 */
export const Z = new FieldWithOpsImpl(new ScalarField(N))
