/**
 * Collection of types and functions needed when working with Elliptic curves (signing and zero-knowledge)
 */

export { mod } from "./mod.js"

export { CubicFieldExt } from "./CubicFieldExt.js"
export { CurveWithOpsImpl } from "./CurveWithOps.js"
export { FieldWithOpsImpl } from "./FieldWithOps.js"
export { QuadraticFieldExt } from "./QuadraticFieldExt.js"
export { ScalarField } from "./ScalarField.js"
export { ShortAffineImpl } from "./ShortAffine.js"
export { ShortProjectedImpl } from "./ShortProjected.js"

/**
 * @template T
 * @typedef {import("./Curve.js").Curve<T>} Curve
 */

/**
 * @template T
 * @typedef {import("./CurveWithOps.js").CurveWithOps<T>} CurveWithOps
 */

/**
 * @template Tc
 * @template T
 * @typedef {import("./CurveWithFromToAffine.js").CurveWithFromToAffine<Tc, T>} CurveWithFromToAffine
 */

/**
 * @template T
 * @typedef {import("./Field.js").Field<T>} Field
 */

/**
 * @template T
 * @typedef {import("./FieldWithOps.js").FieldWithOps<T>} FieldWithOps
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
 * @typedef {import("./ShortAffine.js").ShortAffine<T>} ShortAffine
 */

/**
 * @template {bigint | [bigint, bigint]} T
 * @typedef {import("./ShortProjected.js").ShortProjected<T>} ShortProjected
 */
