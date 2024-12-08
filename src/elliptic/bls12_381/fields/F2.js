import { FieldWithOpsImpl, makeQuadraticFieldExt } from "../../common/index.js"
import { CURVE1 } from "../constants.js"
import { F1 } from "./F1.js"

/**
 * @import { FieldElement2 } from "../../../internal.js"
 */

const UPOWP = [
    1n,
    4002409555221667393417789825735904156556882819939007885332058136124031650490837864442687629129015664037894272559786n // P - 1
]

const P_MINUS_9_DIV_16 = (CURVE1.P ** 2n - 9n) / 16n

// For Fp2 roots of unity.
const rv1 =
    0x6af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09n
const ev1 =
    0x699be3b8c6870965e5bf892ad5d2cc7b0e85a117402dfd83b7f4a947e02d978498255a2aaec0ac627b5afbdf1bf1c90n
const ev2 =
    0x8157cd83046453f5dd0972b6e3949e4288020b5b8a9cc99ca07e27089a2ce2436d965026adad3ef7baba37f2183e9b5n
const ev3 =
    0xab1c2ffdd6c253ca155231eb3e71ba044fd562f6f72bc5bad5ec46a0b7a3b0247cf08ce6c6317f40edbc653a72dee17n
const ev4 =
    0xaa404866706722864480885d68ad0ccac1967c7544b447873cc37e0181271e006df72162a3d3e0287bf597fbf7f8fc1n

/**
 * @type {[bigint, bigint][]}
 */
const ROOTS_OF_UNITY = [
    [1n, 0n],
    [rv1, -rv1],
    [0n, 1n],
    [rv1, rv1],
    [-1n, 0n],
    [-rv1, rv1],
    [0n, -1n],
    [-rv1, -rv1]
]

/**
 * @type {[bigint, bigint][]}
 */
const ETAs = [
    [ev1, ev2],
    [-ev2, ev1],
    [ev3, ev4],
    [-ev4, ev3]
]

/**
 * @extends {FieldWithOpsImpl<[bigint, bigint]>}
 */
class FieldWithExtraOps extends FieldWithOpsImpl {
    constructor() {
        super(makeQuadraticFieldExt(F1, -1n))
    }

    /**
     * For now this method is only needed for restoring a point from its encoding, so we are not so concerned with speed.
     * Hence we will use the conceptually easiest formula to calculate the sqrt:
     *    (bx + by*u)^2 = ax + ay*u
     *    bx^2 - by^2 = ax  &  2*bx*by = ay
     * This forms a quadratic equation, which we can solve using F1 because it defines sqrt on the component field.
     *    bx^2 = (ax + sqrt(ax^2 + ay^2))/2
     *    by^2 = bx^2 - ax
     * Cost: 3 sqrts and 1 div on F1
     * @param {FieldElement2} a
     * @param {boolean | undefined} largest
     * @returns {FieldElement2}
     */
    sqrt([ax, ay], largest = undefined) {
        const ax2 = F1.square(ax)
        const ay2 = F1.square(ay)

        const h = F1.sqrt(F1.add(ax2, ay2))

        const axh = F1.add(ax, h)
        const bx2 = F1.divide(axh, 2n)
        const by2 = F1.subtract(bx2, ax)

        const bx = F1.sqrt(bx2)
        const by = F1.sqrt(by2)

        if (!this.equals(this.multiply([bx, by], [bx, by]), [ax, ay])) {
            throw new Error("F2 sqrt failed")
        }

        /**
         * @type {[bigint, bigint]}
         */
        let r = [bx, by]
        if (bx < 0n || (bx === 0n && by < 0n)) {
            r = [-bx, -by]
        }

        if (largest !== undefined && largest !== r[0] > CURVE1.P / 2n) {
            r = [F1.scale(r[0], -1n), F1.scale(r[1], -1n)]
        }

        return r
    }

    /**
     * Calculates (a + b*u)^(p^n)
     * Using a combination of Fermat's little theorem and substitions of u^2
     * This is often referred to as the Frobenius endomorphism, and is used during the pairing calculation
     * @param {[bigint, bigint]} a
     * @param {number} n
     * @returns {[bigint, bigint]}
     */
    powp([ax, ay], n) {
        return [ax, F1.multiply(ay, UPOWP[n % 2])]
    }

    /**
     * @param {[bigint, bigint]} a
     * @returns {[bigint, bigint]}
     */
    multiplyu2(a) {
        return this.scale(a, -1n)
    }

    /**
     * a^2 + b^2*u*2
     * (a^2 + b^2) - a^2 - b^2
     * @param {[bigint, bigint]} a
     * @param {[bigint, bigint]} b
     * @returns {[[bigint, bigint], [bigint, bigint]]}
     */
    square2(a, b) {
        const a2 = this.square(a)
        const b2 = this.square(b)

        return [
            this.add(a2, this.multiplyu2(b2)),
            this.subtract(this.square(this.add(a, b)), this.add(a2, b2))
        ]
    }

    /**
     * @param {[bigint, bigint]} a
     * @returns {number}
     */
    sign([ax, ay]) {
        if (ax === 0n) {
            return Number(ay % 2n)
        } else {
            return Number(ax % 2n)
        }
    }

    /**
     * Returns uv⁷ * (uv¹⁵)^((p² - 9) / 16) * root of unity
     *  if valid square root is found
     * @param {[bigint, bigint]} u
     * @param {[bigint, bigint]} v
     * @returns {[bigint, bigint]}
     */
    gamma(u, v) {
        const v7 = this.pow(v, 7n)
        const uv7 = this.multiply(u, v7)
        const uv15 = this.multiply(uv7, F2.multiply(v7, v))

        // gamma =  uv⁷ * (uv¹⁵)^((p² - 9) / 16)
        return F2.multiply(F2.pow(uv15, P_MINUS_9_DIV_16), uv7)
    }

    /**
     * @private
     * @param {[bigint, bigint]} u
     * @param {[bigint, bigint]} v
     * @param {[bigint, bigint]} candidate
     * @param {[bigint, bigint][]} candidates
     * @returns {[bigint, bigint] | undefined}
     */
    sqrtUOverV(u, v, candidate, candidates) {
        /**
         * @type {[bigint, bigint] | undefined}
         */
        let res = undefined

        candidates.forEach((c) => {
            // Valid solution if (c * candidate)² * v - u == 0
            const sqrtCandidate = this.multiply(c, candidate)
            const tmp = this.subtract(
                this.multiply(this.pow(sqrtCandidate, 2n), v),
                u
            )

            if (res === undefined && this.isZero(tmp)) {
                res = sqrtCandidate
            }
        })

        return res
    }

    /**
     *
     * @param {[bigint, bigint]} u
     * @param {[bigint, bigint]} v
     * @param {[bigint, bigint] | undefined} gamma_
     * @returns {[bigint, bigint] | undefined}
     */
    rootOfUnity(u, v, gamma_ = undefined) {
        let gamma = gamma_ === undefined ? this.gamma(u, v) : gamma_

        // Constant-time routine, so we do not early-return.
        const positiveRootsOfUnity = ROOTS_OF_UNITY.slice(0, 4)
        return this.sqrtUOverV(u, v, gamma, positiveRootsOfUnity)
    }

    /**
     * @param {[bigint, bigint]} u
     * @param {[bigint, bigint]} v
     * @param {[bigint, bigint]} candidate
     * @returns {undefined | [bigint, bigint]}
     */
    eta(u, v, candidate) {
        return this.sqrtUOverV(u, v, candidate, ETAs)
    }
}

export const F2 = new FieldWithExtraOps()
