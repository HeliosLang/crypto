// Random Number Generation Using Deterministic Random Bit Generators
import { hmacSha2_256 as hmac } from "../digest/hmac.js"

const MAX_ITERS = 1000

/**
 * Using hmac
 * See https://datatracker.ietf.org/doc/html/rfc6979#section-3.2
 * @template T
 * @param {number[]} seed privateKey concatenated with hash of message according to rfc6979
 * @param {(bytes: number[]) => (T | undefined)} pred keep generating new bytes until pred returns something non-undefined (signifying a certian condition has been satisfied)
 * @returns {T}
 */
export function hmacDrbg(seed, pred) {
    let k = new Array(32).fill(0)
    let v = new Array(32).fill(1)

    k = hmac(k, v.concat([0x00]).concat(seed))
    v = hmac(k, v)
    k = hmac(k, v.concat([0x01]).concat(seed))
    v = hmac(k, v)

    // test predicate until it returns ok
    for (let i = 0; i <= MAX_ITERS; i++) {
        v = hmac(k, v)

        const res = pred(v)

        if (res !== undefined) {
            return res
        }

        k = hmac(k, v.concat([0x00]))
        v = hmac(k, v)
    }

    throw new Error("too many iterations")
}
