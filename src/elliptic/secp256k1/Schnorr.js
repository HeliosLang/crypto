import { encodeUtf8 } from "@helios-lang/codec-utils"
import { sha2_256 } from "../../digest/index.js"
import { mod } from "../common/index.js"
import {
    decodePrivateKey,
    decodeScalar,
    decodeSchnorrSignature,
    encodeScalar
} from "./codec.js"
import { N } from "./constants.js"
import { ExtendedPoint } from "./ExtendedPoint.js"

/**
 * @template {Point<T>} T
 * @typedef {import("../common/index.js").Point<T>} Point
 */

/**
 * @template {Point<T>} T
 * @typedef {import("../common/index.js").PointClass<T>} PointClass
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
 * See: https://bips.xyz/340
 * @template {Point<T>} T
 */
export class Schnorr {
    /**
     * @type {PointClass<T>}
     */
    #PointImpl

    /**
     * @param {PointClass<T>} PointImpl
     */
    constructor(PointImpl) {
        this.#PointImpl = PointImpl
    }

    /**
     * @param {number[]} privateKey
     * @returns {number[]} 32 byte public key.
     */
    derivePublicKey(privateKey) {
        const d = decodePrivateKey(privateKey)
        const h = this.#PointImpl.BASE.mul(d)

        return h.encode().slice(1)
    }

    /**
     * @param {number[]} message any length
     * @param {number[]} privateKey 32 bytes
     * @param {number[]} nonce 32 bytes
     * @returns {number[]} 64 bytes
     */
    sign(message, privateKey, nonce) {
        if (nonce.length != 32) {
            throw new Error(
                `expected 32 bytes for nonce, got ${nonce.length} bytes`
            )
        }

        // Extract private key
        //  (Not vulnerable to timing attack because no public data is used, and repeated calls will likely use the same privateKey)
        let d = decodePrivateKey(privateKey)

        // Public Key as a point
        //   (Not vulnerable to timing attack because not public data is used)
        const h = this.#PointImpl.BASE.mul(d)

        if (h.isZero()) {
            throw new Error("unexpected publicKey point")
        }

        // Correct d for uneven y
        if (h.toAffine().y % 2n != 0n) {
            d = N - d
            privateKey = encodeScalar(d)
        }

        const nonceHash = hash("BIP0340/aux", nonce)

        // Not vulnerable to timing attack because this should be constant-time
        const t = nonceHash.map((b, i) => privateKey[i] ^ b)

        const hBytes = h.encode().slice(1)
        const rand = hash("BIP0340/nonce", t.concat(hBytes.concat(message)))

        let k = mod(decodeScalar(rand), N)

        if (k === 0n) {
            throw new Error("invalid nonce")
        }

        // k is random and private, and this calculation dominates the calculation time of this method
        const R = this.#PointImpl.BASE.mul(k)

        if (R.isZero()) {
            throw new Error("failed to sign")
        }

        if (R.toAffine().y % 2n != 0n) {
            k = N - k
        }

        const Rbytes = R.encode().slice(1)
        const eBytes = hash(
            "BIP0340/challenge",
            Rbytes.concat(hBytes).concat(message)
        )

        const e = mod(decodeScalar(eBytes), N)

        const signature = Rbytes.concat(encodeScalar(mod(k + mod(e * d, N), N)))

        return signature
    }

    /**
     * Returns `true` if the signature is correct.
     * TODO: for invalid format inputs this method fails. Should it instead return `false` for some of these bad cases? (the plutus-core spec isn't clear at all)
     * @param {number[]} signature
     * @param {number[]} message
     * @param {number[]} publicKey
     * @returns {boolean}
     */
    verify(signature, message, publicKey) {
        const h = this.#PointImpl.decode([0x02].concat(publicKey))
        const [r, s] = decodeSchnorrSignature(signature)

        const eBytes = hash(
            "BIP0340/challenge",
            encodeScalar(r).concat(publicKey).concat(message)
        )
        const e = mod(decodeScalar(eBytes), N)

        const a = this.#PointImpl.BASE.mul(s)
        const b = h.mul(N - e)
        const R = a.add(b)

        if (R.isZero()) {
            throw new Error("failed to verify (bad R)")
        }

        if (R.toAffine().y % 2n != 0n) {
            throw new Error("failed to verify (uneven R.y)")
        }

        return R.toAffine().x == r
    }
}

export const SchnorrSecp256k1 = new Schnorr(ExtendedPoint)
