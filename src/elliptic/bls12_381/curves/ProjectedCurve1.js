import { ShortProjectedImpl } from "../../common/index.js"
import { CURVE1 } from "../constants.js"
import { F1 } from "../fields/index.js"

/**
 * @import { Point3, ProjectedCurve1 } from "../../../index.js"
 */

/**
 * @implements {ProjectedCurve1}
 * @extends {ShortProjectedImpl<bigint>}
 */
class ProjectedCurve1Impl extends ShortProjectedImpl {
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

/**
 * @type {ProjectedCurve1}
 */
export const projectedCurve1 = new ProjectedCurve1Impl()
