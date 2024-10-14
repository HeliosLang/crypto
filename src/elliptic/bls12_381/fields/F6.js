import { CubicFieldExt, FieldWithOpsImpl } from "../../common/index.js"
import { F2 } from "./F2.js"

/**
 * @typedef {[[bigint, bigint], [bigint, bigint], [bigint, bigint]]} FieldElement6
 */

/**
 * @type {[bigint, bigint][]}
 */
const VPOWP = [
    [1n, 0n],
    [
        0n,
        4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n
    ],
    [
        793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n,
        0n
    ],
    [0n, 1n],
    [
        4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n,
        0n
    ],
    [
        0n,
        793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n
    ]
]

/**
 * @type {[bigint, bigint][]}
 */
const V2POWP = [
    [1n, 0n],
    [
        4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939437n,
        0n
    ],
    [
        4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n,
        0n
    ],
    [
        4002409555221667393417789825735904156556882819939007885332058136124031650490837864442687629129015664037894272559786n,
        0n
    ],
    [
        793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n,
        0n
    ],
    [
        793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620351n,
        0n
    ]
]

/**
 * @extends {FieldWithOpsImpl<FieldElement6>}
 */
class FieldWithPowp extends FieldWithOpsImpl {
    constructor() {
        super(new CubicFieldExt(F2, [1n, 1n]))
    }

    /**
     * Calculates (a + b*v + c*v^2)^(p^n)
     * Using a combination of Fermat's little theorem and substitutions of v^3
     * This is often referred to as the Frobenius endomorphism, and is used during the pairing calculation
     * @param {FieldElement6} a
     * @param {number} n
     * @returns {FieldElement6}
     */
    powp([ax, ay, az], n) {
        return [
            F2.powp(ax, n),
            F2.multiply(F2.powp(ay, n), VPOWP[n % 6]),
            F2.multiply(F2.powp(az, n), V2POWP[n % 6])
        ]
    }

    /**
     * @param {FieldElement6} a
     * @param {[bigint, bigint]} b
     * @returns {FieldElement6}
     */
    multiplyF2([ax, ay, az], b) {
        return [F2.multiply(ax, b), F2.multiply(ay, b), F2.multiply(az, b)]
    }
}

/**
 * Each element consists of three coordinates, written as a + b*v + c*v^2
 * Standard multiplication and addition rules apply.
 * Remember, each coefficient in turn consist of two coordinates:
 *    (ax + ay*u) + (bx + by*u)*v + (cx + cy*u)*v^2
 * The following rule is used to simplify overflowing degrees:
 *    v^3 = u + 1
 */
export const F6 = new FieldWithPowp()
