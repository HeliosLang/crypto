import { sha2_256 } from "./sha2_256.js"
import { sha2_512 } from "./sha2_512.js"

/**
 * Don't use this directly, use hmacSha2_256 or hmacSha2_512 instead
 * @param {(x: number[]) => number[]} algorithm
 * @param {number} b - blockSize of algorithm
 * @param {number[]} key
 * @param {number[]} message
 * @returns {number[]}
 */
function hmacInternal(algorithm, b, key, message) {
    if (key.length > b) {
        key = algorithm(key)
    } else {
        key = key.slice()
    }

    while (key.length < b) {
        key.push(0x00)
    }

    const iPadded = key.map((k) => k ^ 0x36)
    const oPadded = key.map((k) => k ^ 0x5c)

    return algorithm(oPadded.concat(algorithm(iPadded.concat(message))))
}

/**
 * Hmac using sha2-256.
 * @example
 * bytesToHex(hmacSha2_256(textToBytes("key"), textToBytes("The quick brown fox jumps over the lazy dog"))) == "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"
 * @param {number[]} key
 * @param {number[]} message
 * @returns {number[]}
 */
export function hmacSha2_256(key, message) {
    return hmacInternal((x) => sha2_256(x), 64, key, message)
}

/**
 * Hmac using sha2-512.
 * @example
 * bytesToHex(hmacSha2_512(textToBytes("key"), textToBytes("The quick brown fox jumps over the lazy dog"))) == "b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a"
 * @param {number[]} key
 * @param {number[]} message
 * @returns {number[]}
 */
export function hmacSha2_512(key, message) {
    return hmacInternal((x) => sha2_512(x), 128, key, message)
}
