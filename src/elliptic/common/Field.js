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
 *
 * @typedef {{
 *   ZERO: T
 *   ONE: T
 *   add: (a: T, b: T) => T
 *   scale: (a: T, s: bigint) => T
 *   multiply: (a: T, b: T) => T
 *   pow: (a: T, p: bigint) => T
 *   equals: (a: T, b: T) => boolean
 *   invert: (a: T) => T
 *   sqrt: (a: T) => T
 * }} Field
 */
