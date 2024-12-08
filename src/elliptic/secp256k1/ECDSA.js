import { hmacDrbg } from "../../rand/index.js"
import { projectedCurve } from "./ProjectedCurve.js"
import {
    decodeScalar,
    decodePrivateKey,
    decodeMessageHash,
    decodeECDSASignature,
    encodeSignature,
    encodeECDSAPoint,
    decodeECDSAPoint
} from "./codec.js"
import { G, N } from "./constants.js"
import { Z } from "./field.js"

/**
 * @import { ECDSA } from "../../index.js"
 * @import { CurveWithFromToAffine } from "../../internal.js"
 */

/**
 * @template T
 * @param {{
 *   curve: CurveWithFromToAffine<bigint, T>
 * }} args
 * @returns {ECDSA}
 */
export function makeECDSA(args) {
    return new ECDSAImpl(args.curve)
}

/**
 * @template T
 * @implements {ECDSA}
 */
class ECDSAImpl {
    /**
     * @private
     * @readonly
     * @type {CurveWithFromToAffine<bigint, T>}
     */
    curve

    /**
     * @param {CurveWithFromToAffine<bigint, T>} curve
     */
    constructor(curve) {
        this.curve = curve
    }

    /**
     * Derives a 33 byte public key from a 32 byte privateKey
     * @param {number[]} privateKeyBytes
     * @returns {number[]} 33 byte public key (first byte is evenOdd bit)
     */
    derivePublicKey(privateKeyBytes) {
        const privateKey = decodePrivateKey(privateKeyBytes)
        const publicKey = this.curve.scale(this.curve.fromAffine(G), privateKey)

        if (!this.curve.isValidPoint(publicKey)) {
            throw new Error("public key not on curve")
        }

        const publicKeyBytes = encodeECDSAPoint(this.curve.toAffine(publicKey))

        return publicKeyBytes
    }

    /**
     * Sign the 32 messageHash.
     * Even though this implementation isn't constant time, it isn't vulnerable to a timing attack (see detailed notes in the code).
     * @param {number[]} messageHash 32 bytes
     * @param {number[]} privateKeyBytes 32 bytes
     * @returns {number[]} 64 byte signature.
     */
    sign(messageHash, privateKeyBytes) {
        // Extract privateKey as integer
        //   (Not vulnerable to timing attack, because messageHash doesn't impact this,
        //     and same privateKey will probably always be used for repeated calls)
        const privateKey = decodePrivateKey(privateKeyBytes)

        // Hash message
        const h1 = decodeMessageHash(messageHash)

        // Generate a practically random number using hmacDrbg
        //   (Not vulnerable to timing attack, because seed is always
        //     the same length and sha2_256 timing only depends on length)
        return hmacDrbg(privateKeyBytes.concat(messageHash), (kBytes) => {
            const k = decodeScalar(kBytes)

            // if k is invalid => generate other kBytes
            if (k >= N || k <= 0n) {
                return
            }

            // First part of signature
            //   (Not vulnerable to timing attack because k is random, and the privateKey isn't involved)
            const q = this.curve.scale(this.curve.fromAffine(G), k)
            const r = Z.mod(this.curve.toAffine(q).x)

            // if r is invalid => generate other kBytes
            if (r === 0n) {
                return
            }

            // Second part of signature
            //   (Not vulnerable to timing attack because even though x*r is non-constant time,
            //      and r is public, k is random and private and most the calculation time depends on k (for [k]BASE and k^-1))
            const ik = Z.invert(k) // this inversion is expensive, but only happens once if the ExtendedPoint implementation is used for [k]BASE)
            let s = Z.multiply(ik, Z.add(h1, Z.multiply(privateKey, r)))

            // If s is invalid => generate other kBytes
            if (s === 0n) {
                return
            }

            // The plutus-core spec dictates the use of lowS
            if (s > N >> 1n) {
                s = Z.negate(s)
            }

            return encodeSignature(r, s)
        })
    }

    /**
     * Returns `true` if the signature is correct.
     * TODO: for invalid format inputs this method fails. Should it instead return `false` for some of these bad cases? (the plutus-core spec isn't clear at all)
     * @param {number[]} signature
     * @param {number[]} messageHash
     * @param {number[]} publicKeyBytes
     * @returns {boolean}
     */
    verify(signature, messageHash, publicKeyBytes) {
        if (publicKeyBytes.length != 33) {
            throw new Error(
                `unexpected publickey length ${publicKeyBytes.length}`
            )
        }

        const h1 = decodeMessageHash(messageHash)
        const [r, s] = decodeECDSASignature(signature)

        // lowS check
        if (s > N >> 1n) {
            return false
        }

        const si = Z.invert(s)
        const u1 = Z.multiply(h1, si)
        const u2 = Z.multiply(r, si)

        const curve = this.curve
        const publicKey = curve.fromAffine(decodeECDSAPoint(publicKeyBytes))
        if (!curve.isValidPoint(publicKey)) {
            throw new Error("publicKey not on curve")
        }

        const R = curve.add(
            curve.scale(curve.fromAffine(G), u1),
            curve.scale(publicKey, u2)
        )

        return Z.mod(curve.toAffine(R).x) === r
    }
}

/**
 * @type {ECDSA}
 */
export const ECDSASecp256k1 = new ECDSAImpl(projectedCurve)
