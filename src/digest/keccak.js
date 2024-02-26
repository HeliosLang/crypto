/**
 * Keccak is a family of hashing functions, of which Sha3 is the most well-known
 *
 * Keccak_256 refers to the older implementation, using 0x01 as a padByte (Sha3 uses 0x06 as a padyte)
 */

import { UInt64 } from "@helios-lang/codec-utils"

/**
 * State width (1600 bits, )
 * @type {number}
 */
const WIDTH = 200

/**
 * Rate (1088 bits, 136 bytes)
 * @type {number}
 */
const RATE = 136

/**
 * Capacity
 * @type {number}
 */
const CAP = WIDTH - RATE

/**
 * 24 numbers used in the sha3 permute function
 * @type {number[]}
 */
const OFFSETS = [
    6, 12, 18, 24, 3, 9, 10, 16, 22, 1, 7, 13, 19, 20, 4, 5, 11, 17, 23, 2, 8,
    14, 15, 21
]

/**
 * 24 numbers used in the sha3 permute function
 * @type {number[]}
 */
const SHIFTS = [
    -12, -11, 21, 14, 28, 20, 3, -13, -29, 1, 6, 25, 8, 18, 27, -4, 10, 15, -24,
    -30, -23, -7, -9, 2
]

/**
 * Round constants used in the sha3 permute function
 * @type {UInt64[]}
 */
const RC = [
    new UInt64(0x00000000, 0x00000001),
    new UInt64(0x00000000, 0x00008082),
    new UInt64(0x80000000, 0x0000808a),
    new UInt64(0x80000000, 0x80008000),
    new UInt64(0x00000000, 0x0000808b),
    new UInt64(0x00000000, 0x80000001),
    new UInt64(0x80000000, 0x80008081),
    new UInt64(0x80000000, 0x00008009),
    new UInt64(0x00000000, 0x0000008a),
    new UInt64(0x00000000, 0x00000088),
    new UInt64(0x00000000, 0x80008009),
    new UInt64(0x00000000, 0x8000000a),
    new UInt64(0x00000000, 0x8000808b),
    new UInt64(0x80000000, 0x0000008b),
    new UInt64(0x80000000, 0x00008089),
    new UInt64(0x80000000, 0x00008003),
    new UInt64(0x80000000, 0x00008002),
    new UInt64(0x80000000, 0x00000080),
    new UInt64(0x00000000, 0x0000800a),
    new UInt64(0x80000000, 0x8000000a),
    new UInt64(0x80000000, 0x80008081),
    new UInt64(0x80000000, 0x00008080),
    new UInt64(0x00000000, 0x80000001),
    new UInt64(0x80000000, 0x80008008)
]

/**
 * Apply 1000...1 padding until size is multiple of r.
 * If already multiple of r then add a whole block of padding.
 * @param {number[]} src - list of uint8 numbers
 * @param {number} padByte 0x06 for sha3, 0x01 for keccak
 * @returns {number[]} - list of uint8 numbers
 */
function pad(src, padByte) {
    const dst = src.slice()

    /**
     * @type {number}
     */
    let nZeroes = RATE - 2 - (dst.length % RATE)
    if (nZeroes < -1) {
        nZeroes += RATE - 2
    }

    if (nZeroes == -1) {
        dst.push(0x80 + padByte)
    } else {
        dst.push(padByte)

        for (let i = 0; i < nZeroes; i++) {
            dst.push(0)
        }

        dst.push(0x80)
    }

    if (dst.length % RATE != 0) {
        throw new Error("bad padding")
    }

    return dst
}

/**
 * Change `s` in-place
 * @param {UInt64[]} s
 */
function permute(s) {
    /**
     * @type {UInt64[]}
     */
    const c = new Array(5)

    /**
     * @type {UInt64[]}
     */
    const b = new Array(25)

    for (let round = 0; round < 24; round++) {
        for (let i = 0; i < 5; i++) {
            c[i] = s[i]
                .xor(s[i + 5])
                .xor(s[i + 10])
                .xor(s[i + 15])
                .xor(s[i + 20])
        }

        for (let i = 0; i < 5; i++) {
            const i1 = (i + 1) % 5
            const i2 = (i + 4) % 5

            const tmp = c[i2].xor(c[i1].rotr(63))

            for (let j = 0; j < 5; j++) {
                s[i + 5 * j] = s[i + 5 * j].xor(tmp)
            }
        }

        b[0] = s[0]

        for (let i = 1; i < 25; i++) {
            const offset = OFFSETS[i - 1]

            const left = Math.abs(SHIFTS[i - 1])
            const right = 32 - left

            if (SHIFTS[i - 1] < 0) {
                b[i] = s[offset].rotr(right)
            } else {
                b[i] = s[offset].rotr(right + 32)
            }
        }

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                s[i * 5 + j] = b[i * 5 + j].xor(
                    b[i * 5 + ((j + 1) % 5)].not().and(b[i * 5 + ((j + 2) % 5)])
                )
            }
        }

        s[0] = s[0].xor(RC[round])
    }
}

/**
 * @param {number[]} bytes List of uint8 numbers
 * @param {number} padByte 0x06 for sha3 or 0x01 for keccak
 * @returns {number[]} List of uint8 numbers.
 */
export function keccakInternal(bytes, padByte) {
    /**
     * Sha3 uses only bit-wise operations, so 64-bit operations can easily be replicated using 2 32-bit operations instead.
     */

    bytes = pad(bytes, padByte)

    /**
     * Initialize the state
     * @type {UInt64[]}
     */
    const state = new Array(WIDTH / 8).fill(UInt64.zero())

    for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += RATE) {
        // extend the chunk to become length WIDTH
        const chunk = bytes
            .slice(chunkStart, chunkStart + RATE)
            .concat(new Array(CAP).fill(0))

        // element-wise xor with 'state'
        for (let i = 0; i < WIDTH; i += 8) {
            state[i / 8] = state[i / 8].xor(
                UInt64.fromBytes(chunk.slice(i, i + 8))
            )

            // beware: a uint32 is stored as little endian, but a pair of uint32s that form a uin64 are stored in big endian format!
        }

        // apply block permutations
        permute(state)
    }

    /**
     * @type {number[]}
     */
    let hash = []

    for (let i = 0; i < 4; i++) {
        hash = hash.concat(state[i].toBytes())
    }

    return hash
}
