import { ShortProjected } from "../common/index.js"
import { F } from "./field.js"

/**
 * @template T
 * @typedef {import("../common/index.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {import("../common/index.js").Point3<T>} Point3
 */

/**
 * @template T
 * @typedef {import("../common/index.js").Curve<T>} Curve
 */

/**
 * @implements {Curve<Point3<bigint>>}
 */
export class ProjectedCurve extends ShortProjected {
    constructor() {
        super(
            {
                x: 0n,
                y: 1n,
                z: 0n
            },
            F,
            7n
        )
    }

    /**
     * @param {Point2<bigint>} point
     * @returns {Point3<bigint>}
     */
    fromAffine(point) {
        if (point.x == 0n && point.y == 1n) {
            return { x: 0n, y: 1n, z: 0n }
        } else {
            return { ...point, z: 1n }
        }
    }

    /**
     *
     * @param {Point3<bigint>} point
     * @returns
     */
    toAffine(point) {
        if (this.equals(point, this.ZERO)) {
            return { x: 0n, y: 1n }
        } else {
            const F = this.F

            const zInverse = F.invert(point.z)

            return {
                x: F.multiply(point.x, zInverse),
                y: F.multiply(point.y, zInverse)
            }
        }
    }
}
