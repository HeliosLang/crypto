import { CurveWithOps } from "./CurveWithOps.js"

/**
 * @template T
 * @typedef {import("../common/index.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {import("../common/index.js").Point3<T>} Point3
 */

/**
 * @template Tc
 * @template T
 * @typedef {CurveWithOps<T> & {
 *   toAffine: (point: T) => Point2<Tc>
 *   fromAffine: (point: Point2<Tc>) => T
 * }} CurveWithFromToAffine
 */
