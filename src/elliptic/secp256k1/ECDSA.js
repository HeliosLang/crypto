import { invert, mod } from "../common/index.js"
import { hmacDrbg } from "../../rand/index.js"
import {
    decodeScalar,
    decodePrivateKey,
    decodeMessageHash,
    decodeECDSASignature,
    encodeSignature
} from "./codec.js"
import { N } from "./constants.js"
import { ExtendedPoint } from "./ExtendedPoint.js"

/**
 * @template {Point<T>} T
 * @typedef {import("../common/Point.js").Point<T>} Point
 */

/**
 * @template {Point<T>} T
 * @typedef {import("../common/Point.js").PointClass<T>} PointClass
 */

/**
 * The ECDSA algorithm is explained very well here: https://cryptobook.nakov.com/digital-signatures/ecdsa-sign-verify-messages
 * @template {Point<T>} T
 */
export class ECDSA {
    /**
     *@type {PointClass<T>}
     */
    #PointImpl

    /**
     *
     * @param {PointClass<T>} CurvePointImpl
     */
    constructor(CurvePointImpl) {
        this.#PointImpl = CurvePointImpl
    }

    /**
     * Derives a 33 byte public key from a 32 byte privateKey
     * @param {number[]} privateKey
     * @returns {number[]} 33 byte public key (first byte is evenOdd bit)
     */
    derivePublicKey(privateKey) {
        const x = decodePrivateKey(privateKey)
        const h = this.#PointImpl.BASE.mul(x)

        return h.encode()
    }

    /**
     * Sign the 32 messageHash.
     * Even though this implementation isn't constant time, it isn't vulnerable to a timing attack (see detailed notes in the code).
     * @param {number[]} messageHash 32 bytes
     * @param {number[]} privateKey 32 bytes
     * @returns {number[]} 64 byte signature.
     */
    sign(messageHash, privateKey) {
        // Extract privateKey as integer
        //   (Not vulnerable to timing attack, because messageHash doesn't impact this,
        //     and same privateKey will probably always be used for repeated calls)
        const x = decodePrivateKey(privateKey)

        // Hash message
        const h1 = decodeMessageHash(messageHash)

        // Generate a practically random number using hmacDrbg
        //   (Not vulnerable to timing attack, because seed is always
        //     the same length and sha2_256 timing only depends on length)
        return hmacDrbg(privateKey.concat(messageHash), (kBytes) => {
            const k = decodeScalar(kBytes)

            // if k is invalid => generate other kBytes
            if (k >= N || k <= 0n) {
                return
            }

            // First part of signature
            //   (Not vulnerable to timing attack because k is random, and the privateKey isn't involved)
            const q = this.#PointImpl.BASE.mul(k).toAffine()
            const r = mod(q.x, N)

            // if r is invalid => generate other kBytes
            if (r === 0n) {
                return
            }

            // Second part of signature
            //   (Not vulnerable to timing attack because even though x*r is non-constant time,
            //      and r is public, k is random and private and most the calculation time depends on k (for [k]BASE and k^-1))
            const ik = invert(k, N) // this inversion is expensive, but only happens once if the ExtendedPoint implementation is used for [k]BASE)
            let s = mod(ik * mod(h1 + mod(x * r, N), N), N)

            // If s is invalid => generate other kBytes
            if (s === 0n) {
                return
            }

            // The plutus-core spec dictates the use of lowS
            if (s > N >> 1n) {
                s = mod(-s, N)
            }

            return encodeSignature(r, s)
        })
    }

    /**
     * Returns `true` if the signature is correct.
     * TODO: for invalid format inputs this method fails. Should it instead return `false` for some of these bad cases? (the plutus-core spec isn't clear at all)
     * @param {number[]} signature
     * @param {number[]} messageHash
     * @param {number[]} publicKey
     * @returns {boolean}
     */
    verify(signature, messageHash, publicKey) {
        if (publicKey.length != 33) {
            throw new Error(`unexpected publickey length ${publicKey.length}`)
        }

        const h1 = decodeMessageHash(messageHash)
        const [r, s] = decodeECDSASignature(signature)

        // lowS check
        if (s > N >> 1n) {
            return false
        }

        const si = invert(s, N)
        const u1 = mod(h1 * si, N)
        const u2 = mod(r * si, N)

        const h = this.#PointImpl.decode(publicKey)
        const R = this.#PointImpl.BASE.mul(u1).add(h.mul(u2)).toAffine()

        return mod(R.x, N) === r
    }
}

export const ECDSASecp256k1 = new ECDSA(ExtendedPoint)
