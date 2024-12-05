import { makeBase32 } from "@helios-lang/codec-utils"

/**
 * Bech32 base32 alphabet
 * @type {string}
 */
const BECH32_BASE32_ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

const BECH32_PAYLOAD_CODEC = makeBase32({
    alphabet: BECH32_BASE32_ALPHABET
})

/**
 * Expand human readable prefix of the bech32 encoding so it can be used in the checkSum.
 * @param {string} hrp
 * @returns {number[]}
 */
function expandHrp(hrp) {
    const bytes = []
    for (let c of hrp) {
        bytes.push(c.charCodeAt(0) >> 5)
    }

    bytes.push(0)

    for (let c of hrp) {
        bytes.push(c.charCodeAt(0) & 31)
    }

    return bytes
}

/**
 * Split bech32 encoded string into human-readable-part and payload part.
 * @param {string} encoded
 * @returns {[string, string]} first item is human-readable-part, second part is payload part
 */
function splitBech32(encoded) {
    const i = encoded.indexOf("1")

    if (i == -1 || i == 0) {
        return ["", encoded]
    } else {
        return [encoded.slice(0, i), encoded.slice(i + 1)]
    }
}

/**
 * Used as part of the bech32 checksum.
 * @param {number[]} bytes
 * @returns {number}
 */
function polymod(bytes) {
    const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]

    let chk = 1
    for (let b of bytes) {
        const c = chk >> 25
        chk = ((chk & 0x1fffffff) << 5) ^ b

        for (let i = 0; i < 5; i++) {
            if (((c >> i) & 1) != 0) {
                chk ^= GEN[i]
            }
        }
    }

    return chk
}

/**
 * Generate the bech32 checksum.
 * @param {string} hrp
 * @param {number[]} data - numbers between 0 and 32
 * @returns {number[]} - 6 numbers between 0 and 32
 */
function calcChecksum(hrp, data) {
    const bytes = expandHrp(hrp).concat(data)

    const chk = polymod(bytes.concat([0, 0, 0, 0, 0, 0])) ^ 1

    const chkSum = []
    for (let i = 0; i < 6; i++) {
        chkSum.push((chk >> (5 * (5 - i))) & 31)
    }

    return chkSum
}

/**
 * @param {string} hrp
 * @param {string} payload
 * @returns {boolean}
 */
function verifySplitBech32(hrp, payload) {
    if (hrp.length == 0) {
        return false
    }

    const data = []

    for (let c of payload) {
        const j = BECH32_BASE32_ALPHABET.indexOf(c)
        if (j == -1) {
            return false
        }

        data.push(j)
    }

    const chkSumA = data.slice(data.length - 6)

    const chkSumB = calcChecksum(hrp, data.slice(0, data.length - 6))

    for (let j = 0; j < 6; j++) {
        if (chkSumA[j] != chkSumB[j]) {
            return false
        }
    }

    return true
}

/**
 * Creates a Bech32 checksummed string (eg. used to represent Cardano addresses).
 * @param {string} hrp  human-readable part (eg. "addr")
 * @param {number[]} payload a list of uint8 bytes
 * @returns {string}
 */
export function encodeBech32(hrp, payload) {
    if (hrp.length == 0) {
        throw new Error("human-readable-part must have non-zero length")
    }

    payload = BECH32_PAYLOAD_CODEC.encodeRaw(payload)

    const chkSum = calcChecksum(hrp, payload)

    return (
        hrp +
        "1" +
        payload
            .concat(chkSum)
            .map((i) => BECH32_BASE32_ALPHABET[i])
            .join("")
    )
}

/**
 * Decomposes a Bech32 checksummed string (eg. a Cardano address), and returns the human readable part and the original bytes
 * Throws an error if checksum is invalid.
 * @param {string} addr
 * @returns {[string, number[]]} First part is the human-readable part, second part is a list containing the underlying bytes.
 */
export function decodeBech32(addr) {
    const [hrp, payload] = splitBech32(addr)

    if (!verifySplitBech32(hrp, payload)) {
        throw new Error(`invalid bech32 addr ${addr}`)
    }

    const data = BECH32_PAYLOAD_CODEC.decode(
        payload.slice(0, payload.length - 6)
    )

    return [hrp, data]
}

/**
 * Verifies a Bech32 checksum.
 * @param {string} encoded
 * @returns {boolean}
 */
export function isValidBech32(encoded) {
    const [hrp, payload] = splitBech32(encoded)

    return verifySplitBech32(hrp, payload)
}
