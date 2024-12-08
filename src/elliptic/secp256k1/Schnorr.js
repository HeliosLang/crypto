import { encodeUtf8 } from "@helios-lang/codec-utils"
import { sha2_256 } from "../../digest/index.js"
import { mod } from "../common/index.js"
import { projectedCurve } from "./ProjectedCurve.js"
import {
    decodePrivateKey,
    decodeScalar,
    decodeSchnorrPoint,
    decodeSchnorrSignature,
    encodeScalar,
    encodeSchnorrPoint
} from "./codec.js"
import { G, N } from "./constants.js"
import { Z } from "./field.js"

/**
 * @import { Schnorr } from "../../index.js"
 * @import { CurveWithFromToAffine } from "../../internal.js"
 */

/**
 * `[0]` is an easier way to tell the type-system that the values should be number[]
 */
const tagHashes = {
    "BIP0340/aux": [0],
    "BIP0340/challenge": [0],
    "BIP0340/nonce": [0]
}

/**
 * @typedef {keyof tagHashes} SchnorrHashTag
 */

/**
 * @param {SchnorrHashTag} tag
 * @param {number[]} bytes
 * @returns {number[]}
 */
function hash(tag, bytes) {
    let tagHash = tagHashes[tag]

    if (tagHash.length != 32) {
        tagHash = sha2_256(encodeUtf8(tag))
        tagHashes[tag] = tagHash
    }

    return sha2_256(tagHash.concat(tagHash).concat(bytes))
}

/**
 * @template T
 * @param {{
 *   curve: CurveWithFromToAffine<bigint, T>
 * }} args
 * @returns {Schnorr}
 */
export function makeSchnorr(args) {
    return new SchnorrImpl(args.curve)
}

/**
 * See: https://bips.xyz/340
 * @template T
 * @implements {Schnorr}
 */
class SchnorrImpl {
    /**
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
     * @param {number[]} privateKeyBytes
     * @returns {number[]} 32 byte public key.
     */
    derivePublicKey(privateKeyBytes) {
        const privateKey = decodePrivateKey(privateKeyBytes)
        const publicKey = this.curve.scale(this.curve.fromAffine(G), privateKey)
        const publicKeyBytes = encodeSchnorrPoint(
            this.curve.toAffine(publicKey)
        )

        return publicKeyBytes
    }

    /**
     * @param {number[]} message any length
     * @param {number[]} privateKeyBytes 32 bytes
     * @param {number[]} nonce 32 bytes
     * @returns {number[]} 64 bytes
     */
    sign(message, privateKeyBytes, nonce) {
        if (nonce.length != 32) {
            throw new Error(
                `expected 32 bytes for nonce, got ${nonce.length} bytes`
            )
        }

        // Extract private key
        //  (Not vulnerable to timing attack because no public data is used, and repeated calls will likely use the same privateKey)
        let privateKey = decodePrivateKey(privateKeyBytes)

        // Public Key as a point
        //   (Not vulnerable to timing attack because not public data is used)
        const publicKey = this.curve.scale(this.curve.fromAffine(G), privateKey)

        if (this.curve.isZero(publicKey)) {
            throw new Error(
                `unexpected publicKey point ${JSON.stringify(publicKey)}`
            )
        }

        // Correct privateKey for uneven y
        if (this.curve.toAffine(publicKey).y % 2n != 0n) {
            privateKey = Z.negate(privateKey)
            privateKeyBytes = encodeScalar(privateKey)
        }

        const nonceHash = hash("BIP0340/aux", nonce)

        // Not vulnerable to timing attack because this should be constant-time
        const t = nonceHash.map((b, i) => privateKeyBytes[i] ^ b)

        const publicKeyBytes = encodeSchnorrPoint(
            this.curve.toAffine(publicKey)
        )
        const rand = hash(
            "BIP0340/nonce",
            t.concat(publicKeyBytes.concat(message))
        )

        let k = mod(decodeScalar(rand), N)

        if (k === 0n) {
            throw new Error("invalid nonce")
        }

        // k is random and private, and this calculation dominates the calculation time of this method
        const R = this.curve.scale(this.curve.fromAffine(G), k)

        if (this.curve.isZero(R)) {
            throw new Error("failed to sign")
        }

        if (this.curve.toAffine(R).y % 2n != 0n) {
            k = N - k
        }

        const Rbytes = encodeSchnorrPoint(this.curve.toAffine(R))
        const eBytes = hash(
            "BIP0340/challenge",
            Rbytes.concat(publicKeyBytes).concat(message)
        )

        const e = mod(decodeScalar(eBytes), N)

        const signature = Rbytes.concat(
            encodeScalar(mod(k + mod(e * privateKey, N), N))
        )

        return signature
    }

    /**
     * Returns `true` if the signature is correct.
     * TODO: for invalid format inputs this method fails. Should it instead return `false` for some of these bad cases? (the plutus-core spec isn't clear at all)
     * @param {number[]} signature
     * @param {number[]} message
     * @param {number[]} publicKeyBytes
     * @returns {boolean}
     */
    verify(signature, message, publicKeyBytes) {
        const publicKey = this.curve.fromAffine(
            decodeSchnorrPoint(publicKeyBytes)
        )

        if (!this.curve.isValidPoint(publicKey)) {
            throw new Error("publicKey not on curve")
        }

        const [r, s] = decodeSchnorrSignature(signature)

        const eBytes = hash(
            "BIP0340/challenge",
            encodeScalar(r).concat(publicKeyBytes).concat(message)
        )
        const e = mod(decodeScalar(eBytes), N)

        const a = this.curve.scale(this.curve.fromAffine(G), s)
        const b = this.curve.scale(publicKey, Z.negate(e))
        const R = this.curve.add(a, b)

        if (this.curve.isZero(R)) {
            throw new Error("failed to verify (bad R)")
        }

        if (this.curve.toAffine(R).y % 2n != 0n) {
            throw new Error("failed to verify (uneven R.y)")
        }

        return this.curve.toAffine(R).x == r
    }
}

/**
 * @type {Schnorr}
 */
export const SchnorrSecp256k1 = makeSchnorr({ curve: projectedCurve })
