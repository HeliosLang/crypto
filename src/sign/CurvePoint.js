/**
 * @template {CurvePoint<T>} T
 * @typedef {{
 *   add(other: T): T
 *   mul(scalar: bigint): T
 *   equals(other: T): boolean
 *   encode(): number[]
 * }} CurvePoint
 */

/**
 * @template {CurvePoint<T>} T
 * @typedef {{
 *    BASE: CurvePoint<T>
 *    decode(bytes: number[]): CurvePoint<T>
 * }} CurvePointClass
 */

import { decodeIntLE, encodeIntLE32 } from "@helios-lang/codec-utils"

export const ED25519_Q =
    57896044618658097711785492504343953926634992332820282019728792003956564819949n // ipowi(255n) - 19n
const ED25519_Q38 =
    7237005577332262213973186563042994240829374041602535252466099000494570602494n // (Q + 3n)/8n
export const ED25519_CURVE_ORDER =
    7237005577332262213973186563042994240857116359379907606001950938285454250989n // ipow2(252n) + 27742317777372353535851937790883648493n;
export const ED25519_D =
    -4513249062541557337682894930092624173785641285191125241628941591882900924598840740n // -121665n * invert(121666n);
const ED25519_I =
    19681161376707505956807079304988542015446066515923890162744021073123829784752n // expMod(2n, (Q - 1n)/4n, Q);

/**
 * Positive modulo operator
 * @param {bigint} x
 * @param {bigint} n
 * @returns {bigint}
 */
export function posMod(x, n) {
    const res = x % n

    if (res < 0n) {
        return res + n
    } else {
        return res
    }
}

/**
 * @param {bigint} b
 * @param {bigint} e
 * @param {bigint} m
 * @returns {bigint}
 */
export function sqrt(b, e, m) {
    if (e == 0n) {
        return 1n
    } else {
        let t = sqrt(b, e / 2n, m)
        t = (t * t) % m

        if (e % 2n != 0n) {
            t = posMod(t * b, m)
        }

        return t
    }
}

/**
 * @param {bigint} x
 * @returns {bigint}
 */
export function curveMod(x) {
    return posMod(x, ED25519_Q)
}

/**
 * @param {bigint} n
 * @returns {bigint}
 */
export function curveInvert(n) {
    let a = curveMod(n)
    let b = ED25519_Q

    let x = 0n
    let y = 1n
    let u = 1n
    let v = 0n

    while (a !== 0n) {
        const q = b / a
        const r = b % a
        const m = x - u * q
        const n = y - v * q
        b = a
        a = r
        x = u
        y = v
        u = m
        v = n
    }

    return curveMod(x)
}

/**
 * @param {bigint} y
 * @returns {bigint}
 */
export function recoverX(y) {
    const yy = y * y
    const xx = (yy - 1n) * curveInvert(ED25519_D * yy + 1n)
    let x = sqrt(xx, ED25519_Q38, ED25519_Q)

    if ((x * x - xx) % ED25519_Q != 0n) {
        x = (x * ED25519_I) % ED25519_Q
    }

    if (x % 2n != 0n) {
        x = ED25519_Q - x
    }

    return x
}

/**
 * Curve point 'multiplication'
 * @param {bigint} y
 * @returns {number[]}
 */
export function encodeCurveInt(y) {
    return encodeIntLE32(y)
}

/**
 * @param {number[]} bytes
 * @param {boolean} clamp - force `s` to 32 bytes long, applying special padding to first and 32nd byte
 * @returns {bigint}
 */
export function decodeCurveInt(bytes, clamp = false) {
    if (clamp) {
        bytes = bytes.slice(0, 32)

        bytes[0] &= 0b11111000
        bytes[31] &= 0b00111111
        bytes[31] |= 0b01000000
    }

    return decodeIntLE(bytes)
}
