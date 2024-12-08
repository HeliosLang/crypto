/**
 * @import { AssertExtends } from "@helios-lang/type-utils"
 * @import { AffineCurve1, AffineCurve2, FieldElement12, Field12WithExtendedOps, Point2, Point3, ProjectedCurve1, ProjectedCurve2 } from "./index.js"
 */

/**
 * Data container for extended points (much faster to operate on than affine points)
 * @template T
 * @typedef {{
 *   x: T
 *   y: T
 *   z: T
 *   t: T
 * }} Point4
 */

/**
 * @template T
 * @typedef {{
 *   F: FieldWithOps<T>
 *   V3: T
 *   ZERO: [T, T, T]
 *   ONE: [T, T, T]
 *   add(a: [T, T, T], b: [T, T, T]): [T, T, T]
 *   scale(a: [T, T, T], s: bigint): [T, T, T]
 *   equals(a: [T, T, T], b: [T, T, T]): boolean
 *   multiply(a: [T, T, T], b: [T, T, T]): [T, T, T]
 *   invert(x: [T, T, T]): [T, T, T]
 * }} CubicFieldExt
 */

/**
 * @typedef {AssertExtends<Field<[bigint, bigint, bigint]>, CubicFieldExt<bigint>>} _CubicFielExtExtendsField
 */

/**
 * Abstraction of an additive group
 *   * ZERO: additive identity
 *   * add two points to form a new point
 *   * scale: add a point to itself
 *   * equals: compares two points
 *   * isValidPoint: returns true if point lies on curve
 *
 * For scale we'll always be using the double-and-add algorithm
 *
 * @template T
 * @typedef {{
 *   ZERO: T
 *   add: (a: T, b: T) => T
 *   negate: (a: T) => T
 *   equals: (a: T, b: T) => boolean
 *   isValidPoint: (p: T) => boolean
 * }} Curve
 */

/**
 * @template T
 * @typedef {Curve<T> & {
 *   isZero(point: T): boolean
 *   subtract(a: T, b: T): T
 *   scale(point: T, s: bigint): T
 * }} CurveWithOps
 */

/**
 * @template Tc
 * @template T
 * @typedef {CurveWithOps<T> & {
 *   toAffine: (point: T) => Point2<Tc>
 *   fromAffine: (point: Point2<Tc>) => T
 * }} CurveWithFromToAffine
 */

/**
 * @template T
 * @typedef {Curve<Point2<T>> & {
 *   F: FieldWithOps<T>
 *   b: T
 *   double(point: Point2<T>): Point2<T>
 * }} ShortAffineCurve
 */

/**
 * @template T
 * @typedef {CurveWithFromToAffine<T, Point2<T>> & {
 *   b: T
 * }} ShortAffine
 */

/**
 * @template T
 * @typedef {Curve<Point3<T>> & {
 *   F: FieldWithOps<T>
 * }} ShortProjectedCurve
 */

/**
 * @template {bigint | [bigint, bigint]} T
 * @typedef {CurveWithFromToAffine<T, Point3<T>>} ShortProjected
 */

/**
 * @template T
 * @typedef {CurveWithOps<T> & {
 *   toAffine: (point: T) => Point2<bigint>
 *   fromAffine: (point: Point2<bigint>) => T
 * }} Ed25519Curve
 */

/**
 * @typedef {[bigint, bigint]} FieldElement2
 */

/**
 * @typedef {[[bigint, bigint], [bigint, bigint], [bigint, bigint]]} FieldElement6
 */

/**
 * A Field is an abstraction of a collection of numbers.
 * Fields used in Elliptic Curve Cryptography must define the following operations:
 *   * add two Field elements (TODO: accept any number of elements to add)
 *   * scale a Field element (i.e. add to itself), this defines how additive negation works
 *   * multiply two Field elements
 *   * pow (i.e. multiply by itself)
 *   * equals, compare to Field elements
 *   * invert (i.e. solve the equation x*x^-1 = 1 for x^-1)
 *   * sqrt (i.e. solve the equation y*y = x for y)
 *
 * The following Field elements must also be defined:
 *   * ZERO (i.e. additive identity)
 *   * ONE (i.e. multiplicative identity)
 *
 * The following operations can then be derived from the base operations:
 *   * subtract
 *   * negate
 *   * divide
 *   * square
 *
 * A Field should be usable without knowing the number used for modulo operations.
 *
 * @template T bigint, [bigint, bigint], etc.
 * @typedef {{
 *   ZERO: T
 *   ONE: T
 *   add: (a: T, ...b: T[]) => T
 *   scale: (a: T, s: bigint) => T
 *   multiply: (a: T, b: T) => T
 *   equals: (a: T, b: T) => boolean
 *   invert: (a: T) => T
 * }} Field
 */

/**
 * @template T
 * @typedef {Field<T> & {
 *   isZero(a: T): boolean
 *   isOne(a: T): boolean
 *   mod(a: T): T
 *   subtract(a: T, b: T): T
 *   negate(a: T): T
 *   square(a: T): T
 *   cube(a: T): T
 *   divide(a: T, b: T): T
 *   pow(a: T, p: bigint): T
 *   halve(a: T): T
 * }} FieldWithOps
 */

/**
 * @typedef {Field<bigint> & {
 *   modulo: bigint
 * }} ScalarField
 */

/**
 * @template T
 * @typedef {Field<[T, T]> & {
 *   F: FieldWithOps<T>
 *   U2: T
 * }} QuadraticFieldExt
 */

/**
 * @typedef {FieldWithOps<bigint> & {
 *   sqrt(a: bigint): bigint
 * }} FieldWithSqrt
 */

/**
 * @typedef {AssertExtends<FieldWithOps<FieldElement12>, Field12WithExtendedOps>} _Field12WithExtendedOpsExtendsFieldWithOps
 * @typedef {AssertExtends<ShortAffine<bigint>, AffineCurve1>} _AffineCurve1ExtendsShortAffine
 * @typedef {AssertExtends<ShortAffine<[bigint, bigint]>, AffineCurve2>} _AffineCurve2ExtendsShortAffine
 * @typedef {AssertExtends<ShortProjected<bigint>, ProjectedCurve1>} _ProjectedCurve1ExtendsShortProjected
 * @typedef {AssertExtends<ShortProjected<[bigint, bigint]>, ProjectedCurve2>} _ProjectedCurve2ExtendsShortProjected
 */
