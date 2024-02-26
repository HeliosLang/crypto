import { keccakInternal } from "./keccak.js"

/**
 * Calculates sha3-256 (32bytes) hash of a list of uint8 numbers.
 * Result is also a list of uint8 number.
 * @param {number[]} bytes List of uint8 numbers
 * @returns {number[]} List of uint8 numbers.
 */
export function sha3_256(bytes) {
    return keccakInternal(bytes, 0x06)
}
