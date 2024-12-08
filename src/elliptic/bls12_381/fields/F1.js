import { FieldWithOpsImpl, makeScalarField } from "../../common/index.js"
import { CURVE1 } from "../constants.js"

const P14 = (CURVE1.P + 1n) / 4n

/**
 * @extends {FieldWithOpsImpl<bigint>}
 */
class FieldWithSqrt extends FieldWithOpsImpl {
    constructor() {
        super(makeScalarField(CURVE1.P))
    }

    /**
     * @param {bigint} a
     * @param {boolean | undefined} largest
     * @returns {bigint}
     */
    sqrt(a, largest = undefined) {
        let r = this.pow(a, P14)

        if (!this.equals(this.square(r), a)) {
            throw new Error("failed to compute sqrt")
        }

        if (largest !== undefined && largest !== r > CURVE1.P / 2n) {
            r = this.scale(r, -1n)
        }

        return r
    }

    /**
     * Returns 0 for even and 1 for odd
     * @param {bigint} a
     * @returns {number}
     */
    sign(a) {
        return Number(a % 2n)
    }
}

export const F1 = new FieldWithSqrt()
