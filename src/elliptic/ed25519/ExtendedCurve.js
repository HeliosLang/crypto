import { CurveWithOpsImpl } from "../common/index.js"
import { D } from "./constants.js"
import { F } from "./field.js"

/**
 * @template T
 * @typedef {import("../common/index.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {import("../common/index.js").Point4<T>} Point4
 */

/**
 * @template T
 * @typedef {import("../common/index.js").Curve<T>} Curve
 */

/**
 * @template T
 * @typedef {import("./Ed25519Curve.js").Ed25519Curve<T>} Ed25519Curve
 */

/**
 * @implements {Curve<Point4<bigint>>}
 */
class ExtendedCurveInternal {
    constructor() {}

    /**
     * @type {Point4<bigint>}
     */
    get ZERO() {
        return { x: 0n, y: 1n, z: 1n, t: 0n }
    }

    /**
     * @param {Point4<bigint>} point
     * @returns {boolean}
     */
    isValidPoint(point) {
        if (this.equals(this.ZERO, point)) {
            return true
        } else {
            const zInverse = F.invert(point.z)

            const x = F.multiply(point.x, zInverse)
            const y = F.multiply(point.y, zInverse)

            const xx = x * x
            const yy = y * y

            return F.equals(-xx + yy - 1n, D * xx * yy)
        }
    }

    /**
     * @param {Point4<bigint>} a
     * @param {Point4<bigint>} b
     * @returns {boolean}
     */
    equals(a, b) {
        return (
            F.multiply(a.x, b.z) == F.multiply(b.x, a.z) &&
            F.multiply(a.y, b.z) == F.multiply(b.y, a.z)
        )
    }

    /**
     * @param {Point4<bigint>} point
     * @returns {Point4<bigint>}
     */
    negate(point) {
        return {
            x: F.negate(point.x),
            y: point.y,
            z: point.z,
            t: F.negate(point.t)
        }
    }

    /**
     * @param {Point4<bigint>} point1
     * @param {Point4<bigint>} point2
     * @returns {Point4<bigint>}
     */
    add(point1, point2) {
        const { x: x1, y: y1, z: z1, t: t1 } = point1
        const { x: x2, y: y2, z: z2, t: t2 } = point2

        const a = F.multiply(x1, x2)
        const b = F.multiply(y1, y2)
        const c = F.multiply(D * t1, t2)
        const d = F.multiply(z1, z2)
        const e = F.add((x1 + y1) * (x2 + y2), -a - b)
        const f = F.add(d, -c)
        const g = F.add(d, c)
        const h = F.add(a, b)
        const x3 = F.multiply(e, f)
        const y3 = F.multiply(g, h)
        const z3 = F.multiply(f, g)
        const t3 = F.multiply(e, h)

        return { x: x3, y: y3, z: z3, t: t3 }
    }
}

/**
 * @typedef {Ed25519Curve<Point4<bigint>>} ExtendedCurve
 */

/**
 * @implements {ExtendedCurve}
 */
export class ExtendedCurveImpl extends CurveWithOpsImpl {
    constructor() {
        super(new ExtendedCurveInternal())
    }

    /**
     * @param {Point4<bigint>} point
     * @returns {Point2<bigint>}
     */
    toAffine(point) {
        if (this.isZero(point)) {
            return { x: 0n, y: 1n }
        } else {
            const zInverse = F.invert(point.z)

            return {
                x: F.multiply(point.x, zInverse),
                y: F.multiply(point.y, zInverse)
            }
        }
    }

    /**
     * @param {Point2<bigint>} point
     * @returns {Point4<bigint>}
     */
    fromAffine(point) {
        const { x, y } = point

        return {
            x,
            y,
            z: 1n,
            t: F.multiply(x, y)
        }
    }
}
