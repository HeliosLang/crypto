import { ShortAffine } from "../common/index.js"
import { Gx, Gy } from "./constants.js"
import { F } from "../ed25519/field.js"

/**
 * @template T
 * @typedef {import("../common/index.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {import("../common/index.js").Curve<T>} Curve
 */

/**
 * @implements {Curve<Point2<bigint>>}
 */
export class AffineCurve extends ShortAffine {
    constructor() {
        super({ x: 0n, y: 1n }, F, 7n)
    }

    /**
     * This method makes it easier to swap out the affine curve for the projected curve
     * @param {Point2<bigint>} point
     * @returns {Point2<bigint>}
     */
    toAffine(point) {
        return point
    }

    /**
     * This method makes it easier to swap out the affine curve for the projected curve
     * @param {Point2<bigint>} point
     * @returns {Point2<bigint>}
     */
    fromAffine(point) {
        return point
    }
}
