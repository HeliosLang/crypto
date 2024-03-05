import { decodeIntBE, encodeIntBE, encodeUtf8 } from "@helios-lang/codec-utils"
import { sha2_256 } from "../../../digest/index.js"
import { CURVE1 } from "../constants.js"

const hash = sha2_256
const nb = 32 // output size of hash
const ns = 64 // block size of hash

/**
 * @param {number} x
 * @param {number} n
 * @returns {number[]}
 */
function i2osp(x, n) {
    if (x >= Math.pow(256, n)) {
        throw new Error(`x doesn't fit in ${n} bytes`)
    }

    return encodeIntBE(x).slice(0, n)
}

/**
 * a and b must be of equal length
 * @param {number[]} a
 * @param {number[]} b
 * @return {number[]}
 */
function strxor(a, b) {
    if (a.length != b.length) {
        throw new Error("a and b don't have the same length")
    }

    return a.map((x, i) => x ^ b[i])
}

/**
 * Uses Sha2-256 to produced an arbitrary number of quasi-random bytes
 * @param {number[]} msg
 * @param {number[]} dst
 * @param {number} n
 * @returns {number[]}
 */
function expandMessageXmd(msg, dst, n) {
    if (dst.length > 255) {
        throw new Error("domain specific tag too long")
    }

    const ell = Math.ceil(n / nb)

    if (ell > 255 || n > 65535) {
        throw new Error("too many requested bytes")
    }

    const dstPrime = dst.concat(i2osp(dst.length, 1))
    const zPad = i2osp(0, ns)

    const libStr = i2osp(n, 2)

    const msgPrime = zPad
        .concat(msg)
        .concat(libStr)
        .concat(i2osp(0, 1))
        .concat(dstPrime)

    /**
     * @type {number[][]}
     */
    const bytes = new Array(ell)
    bytes[0] = hash(msgPrime)
    bytes[1] = hash(bytes[0].concat(i2osp(1, 1)).concat(dstPrime))

    for (let i = 2; i <= ell; i++) {
        bytes[i] = hash(
            strxor(bytes[0], bytes[i - 1])
                .concat(i2osp(i, 1))
                .concat(dstPrime)
        )
    }

    const uniformBytes = bytes
        .slice(1)
        .reduce((prev, bs) => prev.concat(bs), [])

    return uniformBytes.slice(0, n)
}

/**
 * @param {number[]} msg
 * @param {number[]} dst
 * @param {number} n
 * @returns {number[]}
 */
function expandMessage(msg, dst, n) {
    return expandMessageXmd(msg, dst, n)
}

const L = Math.ceil((381 + 128) / 8)
const DST = encodeUtf8("asd")

/**
 * @param {number[]} msg
 * @param {number[]} dst domain specific tag
 * @param {number} count number of field elements to output
 * @param {number} m - components per field element
 * @returns {bigint[][]}
 */
export function hashToField(msg, dst, count, m) {
    const n = count * m * L
    const uniformBytes = expandMessage(msg, dst, n)

    /**
     * @type {bigint[][]}
     */
    const res = new Array(count).fill([])

    for (let i = 0; i < count; i++) {
        for (let j = 0; j < m - 1; j++) {
            const offset = L * (j + i * m)
            const tv = uniformBytes.slice(offset, L)
            res[i].push(decodeIntBE(tv) % CURVE1.P)
        }
    }

    return res
}
