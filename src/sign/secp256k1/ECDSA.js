/**
 * @template {CurvePoint<T>} T
 * @typedef {import("../common/CurvePoint.js").CurvePoint<T>} CurvePoint
 */

import { hmacDrbg } from "../../rand/index.js"
import { invert, mod } from "../common/ops.js"
import {
    decodeScalar,
    decodePrivateKey,
    decodeMessageHash,
    decodeSignature,
    encodeSignature
} from "./codec.js"
import { N } from "./constants.js"
import { ExtendedPoint } from "./ExtendedPoint.js"

/**
 * @template {CurvePoint<T>} T
 * @typedef {import("../common/CurvePoint.js").CurvePointClass<T>} CurvePointClass
 */

/**
 * The ECDSA algorithm is explained very well here: https://cryptobook.nakov.com/digital-signatures/ecdsa-sign-verify-messages
 * @template {CurvePoint<T>} T
 */
export class ECDSA {
    /**
     *
     */
    #CurvePointImpl

    /**
     *
     * @param {CurvePointClass<T>} CurvePointImpl
     */
    constructor(CurvePointImpl) {
        this.#CurvePointImpl = CurvePointImpl
    }

    /**
     * @param {number[]} privateKey
     * @returns {number[]} 32 byte public key.
     */
    derivePublicKey(privateKey) {
        const x = decodePrivateKey(privateKey)
        const h = this.#CurvePointImpl.BASE.mul(x)

        return h.encode()
    }

    /**
     * @param {number[]} messageHash
     * @param {number[]} privateKey
     * @returns {number[]} 64 byte signature.
     */
    sign(messageHash, privateKey) {
        // extract privateKey as integer
        const x = decodePrivateKey(privateKey)

        // hash message
        const h1 = decodeMessageHash(messageHash)

        // generate a practically random number using hmacDrbg
        return hmacDrbg(privateKey.concat(messageHash), (kBytes) => {
            const k = decodeScalar(kBytes)

            // if k is invalid => generate other kBytes
            if (k >= N || k <= 0n) {
                return
            }

            const q = this.#CurvePointImpl.BASE.mul(k).toAffine()
            const r = mod(q.x, N)

            // if r is invalid => generate other kBytes
            if (r === 0n) {
                return
            }

            const ik = invert(k, N)
            let s = mod(ik * mod(h1 + mod(x * r, N), N), N)

            // if s is invalid => generate other kBytes
            if (s === 0n) {
                return
            }

            // the plutus-core spec dictates the use of lowS
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
        const [r, s] = decodeSignature(signature)

        // lowS check
        if (s > N >> 1n) {
            return false
        }

        const si = invert(s, N)
        const u1 = mod(h1 * si, N)
        const u2 = mod(r * si, N)

        const h = this.#CurvePointImpl.decode(publicKey)
        const R = this.#CurvePointImpl.BASE.mul(u1).add(h.mul(u2)).toAffine()

        return mod(R.x, N) === r
    }
}

export const ECDSASecp256k1 = new ECDSA(ExtendedPoint)
