import { decodeIntBE, encodeIntBE } from "@helios-lang/codec-utils"
import { mod } from "../common/index.js"
import { N } from "./constants.js"

// sadly each curve has other encoding/decoding requirements for scalars and for curve points, so these functions can't be reused across curves

/**
 * @param {number[]} bytes
 * @param {boolean} truncate
 * @returns {bigint}
 */
export function decodeScalar(bytes, truncate = false) {
    let x = decodeIntBE(bytes)

    if (truncate && bytes.length > 32) {
        x = x >> BigInt((bytes.length - 32) * 8)
    }

    return x
}

/**
 * @param {number[]} bytes
 * @returns {bigint}
 */
export function decodeMessageHash(bytes) {
    if (bytes.length != 32) {
        throw new Error(
            `expected 32 bytes for messageHash, got ${bytes.length}`
        )
    }

    return mod(decodeScalar(bytes, true), N)
}

/**
 * @param {number[]} bytes
 * @returns {bigint}
 */
export function decodePrivateKey(bytes) {
    if (bytes.length != 32) {
        throw new Error(
            `expected privateKey with a length of 32 bytes, this privateKey is ${bytes.length} bytes long`
        )
    }

    const d = decodeScalar(bytes)

    if (d < 0n || d >= N) {
        throw new Error("private key out of range")
    }

    return d
}

/**
 * @param {number[]} bytes
 * @returns {[bigint, bigint]} [r, s]
 */
export function decodeSignature(bytes) {
    if (bytes.length != 64) {
        throw new Error(`expected 64 byte signature, got ${bytes.length} bytes`)
    }

    const r = decodeScalar(bytes.slice(0, 32))
    const s = decodeScalar(bytes.slice(32, 64))

    if (r <= 0n || r >= N) {
        throw new Error("invalid first part of signature")
    }

    // lower half check is done in verify (so false is returned instead of throwing an error)
    if (s <= 0n || s >= N) {
        throw new Error("invalid second part of signature")
    }

    return [r, s]
}

/**
 * Pads the resulting bytes by prepending 0s so it is at least 32 bytes long
 * @param {bigint} x
 * @returns {number[]}
 */
export function encodeScalar(x) {
    const bytes = encodeIntBE(x)

    while (bytes.length < 32) {
        bytes.unshift(0)
    }

    return bytes
}

/**
 * @param {bigint} r
 * @param {bigint} s
 * @returns {number[]} 64 bytes long
 */
export function encodeSignature(r, s) {
    return encodeScalar(r).concat(encodeScalar(s))
}
