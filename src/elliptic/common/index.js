/**
 * Collection of types and functions needed when working with Elliptic curves (signing and zero-knowledge)
 */

export { exp, invert, mod } from "./arithmetic.js"
export { equalsExtended, scalePoint } from "./Point.js"

/**
 * @template {Point<T>} T
 * @typedef {import("./Point.js").Point<T>} Point
 */

/**
 * @template {Point<T>} T
 * @typedef {import("./Point.js").PointClass<T>} PointClass
 */
