export {}

/**
 * @template T
 * @typedef {import("../common/index.js").CurveWithOps<T>} CurveWithOps
 */

/**
 * @template T
 * @typedef {import("../common/index.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {CurveWithOps<T> & {
 *   toAffine: (point: T) => Point2<bigint>
 *   fromAffine: (point: Point2<bigint>) => T
 * }} Ed25519Curve
 */
