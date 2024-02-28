import { decodeIntLE, encodeIntLE32 } from "@helios-lang/codec-utils"

/**
 * @param {number[]} bytes
 * @param {boolean} truncate - force `bytes` to 32 bytes long, applying special padding to first and 32nd byte
 * @returns {bigint}
 */
export function decodeScalar(bytes, truncate = false) {
    if (truncate) {
        bytes = bytes.slice(0, 32)

        bytes[0] &= 0b11111000
        bytes[31] &= 0b00111111
        bytes[31] |= 0b01000000
    }

    return decodeIntLE(bytes)
}

/**
 * @param {number[]} bytes
 * @returns {bigint}
 */
export function decodePrivateKey(bytes) {
    return decodeScalar(bytes, true)
}

/**
 * @param {bigint} x
 * @returns {number[]}
 */
export function encodeScalar(x) {
    return encodeIntLE32(x)
}
