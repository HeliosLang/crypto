export {}

/**
 * @template T
 * @typedef {import("./CurveWithOps.js").CurveWithOpsI<T>} CurveWithOpsI
 */

/**
 * @template T
 * @typedef {import("./Point2.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {import("./Point3.js").Point3<T>} Point3
 */

/**
 * @template Tc
 * @template T
 * @typedef {CurveWithOpsI<T> & {
 *   toAffine: (point: T) => Point2<Tc>
 *   fromAffine: (point: Point2<Tc>) => T
 * }} CurveWithFromToAffine
 */
