/**
 * Collection of types and functions needed when working with Elliptic curves (signing and zero-knowledge)
 */

export { exp, invert, mod } from "./arithmetic.js"
export { equalsExtended, scalePoint } from "./Point.js"
export { CurveHelper } from "./CurveHelper.js"
export { FieldHelper } from "./FieldHelper.js"
export { ScalarField } from "./ScalarField.js"
export { ShortAffine } from "./ShortAffine.js"
export { ShortProjected } from "./ShortProjected.js"

/**
 * @template {Point<T>} T
 * @typedef {import("./Point.js").Point<T>} Point
 */

/**
 * @template {Point<T>} T
 * @typedef {import("./Point.js").PointClass<T>} PointClass
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
 * @template T
 * @typedef {import("./Point4.js").Point4<T>} Point4
 */

/**
 * @template T
 * @typedef {import("./Curve.js").Curve<T>} Curve
 */
