/**
 * @template {CurvePoint<T>} T
 * @typedef {{
 *   add(other: T): T
 *   mul(scalar: bigint): T
 *   equals(other: T): boolean
 *   encode(): number[]
 *   toAffine(): {x: bigint, y: bigint}
 * }} CurvePoint
 */

/**
 * @template {CurvePoint<T>} T
 * @typedef {{
 *    name: string
 *    BASE: T
 *    decode(bytes: number[]): T
 * }} CurvePointClass
 */
