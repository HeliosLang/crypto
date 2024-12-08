import { CurveWithOpsImpl } from "../common/index.js"
import { D } from "./constants.js"
import { F } from "./field.js"

/**
 * @import { Point2 } from "../../index.js"
 * @import { Curve, Ed25519Curve } from "../../internal.js"
 */

/**
 * Curve formula:
 *   -x^2 + y^2 = 1 - d*x^2*y^2
 * @implements {Curve<Point2<bigint>>}
 */
class AffineCurveInternal {
    constructor() {}

    /**
     * @type {Point2<bigint>}
     */
    get ZERO() {
        return {
            x: 0n,
            y: 1n
        }
    }

    /**
     * @param {Point2<bigint>} a
     * @param {Point2<bigint>} b
     * @returns {boolean}
     */
    equals(a, b) {
        return F.equals(a.x, b.x) && F.equals(a.y, b.y)
    }

    /**
     * @param {Point2<bigint>} point
     * @returns {Point2<bigint>}
     */
    negate(point) {
        return {
            x: F.negate(point.x),
            y: point.y
        }
    }

    /**
     * @param {Point2<bigint>} point
     * @returns {boolean}
     */
    isValidPoint(point) {
        const { x, y } = point

        // TODO: can we use F.square() ?
        const xx = x * x
        const yy = y * y

        return F.equals(-xx + yy - 1n, D * xx * yy)
    }

    /**
     * @param {Point2<bigint>} a
     * @param {Point2<bigint>} b
     */
    add(a, b) {
        const { x: x1, y: y1 } = a
        const { x: x2, y: y2 } = b

        const dxxyy = D * x1 * x2 * y1 * y2

        const x3 = F.multiply(x1 * y2 + x2 * y1, F.invert(1n + dxxyy))
        const y3 = F.multiply(y1 * y2 + x1 * x2, F.invert(1n - dxxyy))

        return { x: x3, y: y3 }
    }
}

/**
 * @extends {CurveWithOpsImpl<Point2<bigint>>}
 * @implements {Ed25519Curve<Point2<bigint>>}
 */
export class AffineCurve extends CurveWithOpsImpl {
    constructor() {
        super(new AffineCurveInternal())
    }

    /**
     * @param {Point2<bigint>} point
     * @returns {Point2<bigint>}
     */
    fromAffine(point) {
        return point
    }

    /**
     * @param {Point2<bigint>} point
     * @returns {Point2<bigint>}
     */
    toAffine(point) {
        return point
    }
}
