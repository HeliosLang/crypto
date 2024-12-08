import { encodeIntBE } from "@helios-lang/codec-utils"

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function xor(a, b) {
    const c = new Array(a.length)

    for (let i = 0; i < a.length; i++) {
        c[i] = a[i] ^ b[i]
    }

    return c
}

/**
 * Password-Based Key Derivation Function 2.
 * @example
 * bytesToHex(pbkdf2(hmacSha2_256, textToBytes("password"), textToBytes("salt"), 1, 20)) == "120fb6cffcf8b32c43e7225256c4f837a86548c9"
 * @example
 * bytesToHex(pbkdf2(hmacSha2_512, textToBytes("password"), textToBytes("salt"), 2, 20)) == "e1d9c16aa681708a45f5c7c4e215ceb66e011a2e"
 * @param {(key: number[], msg: number[]) => number[]} prf
 * @param {number[]} password
 * @param {number[]} salt
 * @param {number} nIters
 * @param {number} keyLen
 * @returns {number[]}
 */
export function pbkdf2(prf, password, salt, nIters, keyLen) {
    /**
     * @type {number[]}
     */
    let dk = []

    let i = 1n
    while (dk.length < keyLen) {
        const bi = encodeIntBE(i)
        while (bi.length < 4) {
            bi.unshift(0)
        }

        let U = prf(password, salt.slice().concat(bi))
        let T = U

        for (let j = 1; j < nIters; j++) {
            U = prf(password, U)
            T = xor(T, U)
        }

        dk = dk.concat(T)

        i += 1n
    }

    if (dk.length > keyLen) {
        dk = dk.slice(0, keyLen)
    }

    return dk
}
