import { ShortProjected } from "../../common/index.js"
import { CURVE1 } from "../constants.js"
import { F1 } from "../fields/index.js"

/**
 * @template T
 * @typedef {import("../../common/index.js").Point3<T>} Point3
 */

/**
 * @extends {ShortProjected<bigint>}
 */
class ProjectedCurve1 extends ShortProjected {
    constructor() {
        super(F1, 4n)
    }

    /**
     *
     * @param {Point3<bigint>} point
     * @returns {Point3<bigint>}
     */
    clearCofactor(point) {
        const t = this.scale(point, CURVE1.X)

        return this.add(t, point)
    }
}

export const projectedCurve1 = new ProjectedCurve1()
