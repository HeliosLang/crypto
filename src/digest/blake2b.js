import { UInt64 } from "@helios-lang/codec-utils"

/**
 * 128 bytes (16*8 byte words)
 * @type {number}
 */
const WIDTH = 128

/**
 * Initialization vector
 */
const IV = [
    new UInt64(0x6a09e667, 0xf3bcc908),
    new UInt64(0xbb67ae85, 0x84caa73b),
    new UInt64(0x3c6ef372, 0xfe94f82b),
    new UInt64(0xa54ff53a, 0x5f1d36f1),
    new UInt64(0x510e527f, 0xade682d1),
    new UInt64(0x9b05688c, 0x2b3e6c1f),
    new UInt64(0x1f83d9ab, 0xfb41bd6b),
    new UInt64(0x5be0cd19, 0x137e2179)
]

const SIGMA = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
    [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
    [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
    [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
    [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
    [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
    [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
    [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
    [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0]
]

/**
 * @param {number[]} src - list of uint8 bytes
 * @returns {number[]} - list of uint8 bytes
 */
function pad(src) {
    const dst = src.slice()

    const nZeroes =
        dst.length == 0 ? WIDTH : (WIDTH - (dst.length % WIDTH)) % WIDTH

    // just padding with zeroes, the actual message length is used during compression stage of final block in order to uniquely hash messages of different lengths
    for (let i = 0; i < nZeroes; i++) {
        dst.push(0)
    }

    return dst
}

/**
 * @param {UInt64[]} v
 * @param {UInt64[]} chunk
 * @param {number} a - index
 * @param {number} b - index
 * @param {number} c - index
 * @param {number} d - index
 * @param {number} i - index in chunk for low word 1
 * @param {number} j - index in chunk for low word 2
 */
function mix(v, chunk, a, b, c, d, i, j) {
    const x = chunk[i]
    const y = chunk[j]

    v[a] = v[a].add(v[b]).add(x)
    v[d] = v[d].xor(v[a]).rotr(32)
    v[c] = v[c].add(v[d])
    v[b] = v[b].xor(v[c]).rotr(24)
    v[a] = v[a].add(v[b]).add(y)
    v[d] = v[d].xor(v[a]).rotr(16)
    v[c] = v[c].add(v[d])
    v[b] = v[b].xor(v[c]).rotr(63)
}

/**
 * @param {UInt64[]} h - state vector
 * @param {UInt64[]} chunk
 * @param {number} t - chunkEnd (expected to fit in uint32)
 * @param {boolean} last
 */
function compress(h, chunk, t, last) {
    // work vectors
    const v = h.slice().concat(IV.slice())

    v[12] = v[12].xor(new UInt64(0, t >>> 0)) // v[12].high unmodified
    // v[13] unmodified

    if (last) {
        v[14] = v[14].xor(new UInt64(0xffffffff, 0xffffffff))
    }

    for (let round = 0; round < 12; round++) {
        const s = SIGMA[round % 10]

        for (let i = 0; i < 4; i++) {
            mix(v, chunk, i, i + 4, i + 8, i + 12, s[i * 2], s[i * 2 + 1])
        }

        for (let i = 0; i < 4; i++) {
            mix(
                v,
                chunk,
                i,
                ((i + 1) % 4) + 4,
                ((i + 2) % 4) + 8,
                ((i + 3) % 4) + 12,
                s[8 + i * 2],
                s[8 + i * 2 + 1]
            )
        }
    }

    for (let i = 0; i < 8; i++) {
        h[i] = h[i].xor(v[i].xor(v[i + 8]))
    }
}

/**
 * Calculates blake2b hash of a list of uint8 numbers (variable digest size).
 * Result is also a list of uint8 numbers.
 * @example
 * bytesToHex(Crypto.blake2b([0, 1])) == "01cf79da4945c370c68b265ef70641aaa65eaa8f5953e3900d97724c2c5aa095"
 * @example
 * bytesToHex(Crypto.blake2b(textToBytes("abc"), 64)) == "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923"
 * @param {number[]} bytes
 * @param {number} digestSize Defaults to 32. Can't be greater than 64.
 * @returns {number[]} List of uint8 numbers.
 */
export function blake2b(bytes, digestSize = 32) {
    /**
     * Blake2b is a 64bit algorithm, so we need to be careful when replicating 64-bit operations with 2 32-bit numbers
     * (low-word overflow must spill into high-word, and shifts must go over low/high boundary).
     */

    const nBytes = bytes.length

    bytes = pad(bytes)

    // init hash vector
    const h = IV.slice()

    // setup the param block
    const paramBlock = new Uint8Array(64)
    paramBlock[0] = digestSize // n output  bytes
    paramBlock[1] = 0 // key-length (always zero in our case)
    paramBlock[2] = 1 // fanout
    paramBlock[3] = 1 // depth

    //mix in the parameter block
    const paramBlockView = new DataView(paramBlock.buffer)
    for (let i = 0; i < 8; i++) {
        h[i] = h[i].xor(
            new UInt64(
                paramBlockView.getUint32(i * 8 + 4, true),
                paramBlockView.getUint32(i * 8, true)
            )
        )
    }

    // loop all chunks
    for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += WIDTH) {
        const chunkEnd = chunkStart + WIDTH // exclusive
        const chunk = bytes.slice(chunkStart, chunkStart + WIDTH)

        const chunk64 = new Array(WIDTH / 8)

        for (let i = 0; i < WIDTH; i += 8) {
            chunk64[i / 8] = UInt64.fromBytes(chunk.slice(i, i + 8))
        }

        if (chunkStart == bytes.length - WIDTH) {
            // last block
            compress(h, chunk64, nBytes, true)
        } else {
            compress(h, chunk64, chunkEnd, false)
        }
    }

    // extract lowest BLAKE2B_DIGEST_SIZE bytes from h

    /**
     * @type {number[]}
     */
    let hash = []

    for (let i = 0; i < digestSize / 8; i++) {
        hash = hash.concat(h[i].toBytes())
    }

    return hash.slice(0, digestSize)
}
