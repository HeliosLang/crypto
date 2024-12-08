import { sha2_512 } from "../../digest/index.js"
import { ExtendedCurveImpl } from "./ExtendedCurve.js"
import {
    decodeScalar,
    decodePrivateKey,
    encodeScalar,
    encodePoint,
    decodePoint
} from "./codec.js"
import { G } from "./constants.js"
import { Z } from "./field.js"

/**
 * @import { EdDSA } from "../../index.js"
 * @import { Ed25519Curve } from "../../internal.js"
 */

const hash = sha2_512

/**
 * @template T
 * @param {{curve: Ed25519Curve<T>}} args
 * @returns {EdDSA}
 */
export function makeEdDSA(args) {
    return new EdDSAImpl(args.curve)
}

/**
 * @template T
 * @implements {EdDSA}
 */
class EdDSAImpl {
    /**
     * @private
     * @type {Ed25519Curve<T>}
     */
    curve

    /**
     *
     * @param {Ed25519Curve<T>} curve
     */
    constructor(curve) {
        this.curve = curve
    }

    /**
     * Combination hash and decodeCurveInt
     * @private
     * @param {number[]} bytes
     * @returns {bigint}
     */
    oneWay(bytes) {
        return decodeScalar(hash(bytes))
    }

    /**
     * @param {number[]} privateKeyBytes
     * @param {boolean} hashPrivateKey - defaults to true, set to false when used in Bip32 algorithm
     * @returns {number[]} 32 byte public key.
     */
    derivePublicKey(privateKeyBytes, hashPrivateKey = true) {
        if (hashPrivateKey) {
            privateKeyBytes = hash(privateKeyBytes)
        } else {
            if (privateKeyBytes.length != 64) {
                throw new Error(
                    `expected extended privateKey with a length of 64 bytes, this privateKey is ${privateKeyBytes.length} bytes long (hint: pass hashPrivateKey = true)`
                )
            }
        }

        const privateKey = decodePrivateKey(privateKeyBytes)
        const publicKey = this.curve.scale(this.curve.fromAffine(G), privateKey)
        const publicKeyBytes = encodePoint(this.curve.toAffine(publicKey))

        return publicKeyBytes
    }

    /**
     * Sign the message.
     * Even though this implementation isn't constant time, it isn't vulnerable to a timing attack (see detailed notes in the code)
     * @param {number[]} message
     * @param {number[]} privateKeyBytes
     * @param {boolean} hashPrivateKey - defaults to true, Bip32 passes this as false
     * @returns {number[]} 64 byte signature.
     */
    sign(message, privateKeyBytes, hashPrivateKey = true) {
        if (hashPrivateKey) {
            privateKeyBytes = hash(privateKeyBytes)
        } else {
            if (privateKeyBytes.length != 64) {
                throw new Error(
                    `expected extended privateKey with a length of 64 bytes, this privateKey is ${privateKeyBytes.length} bytes long (hint: pass hashPrivateKey = true)`
                )
            }
        }

        // Extract privateKey as integer
        //   (Not vulnerable to timing attack because there is no mixing with the message,
        //      so always takes the same amount of time for the same privateKey)
        const privateKey = decodePrivateKey(privateKeyBytes)

        // For convenience calculate publicKey here
        //   (Not vulnerable to timing attack because there is no mixing with the message,
        //      so always takes the same amount of time for the same privateKey)
        const publicKey = this.curve.scale(this.curve.fromAffine(G), privateKey)
        const publicKeyBytes = encodePoint(this.curve.toAffine(publicKey))

        // Generate a practically random number
        //   (Not vulnerable to timing attack because sha2_512 runtime only depends on message length,
        //     so timing doesn't expose any bytes of the privateKey)
        const k = this.oneWay(privateKeyBytes.slice(32, 64).concat(message))

        // First part of the signature
        //   (Not vulnerable to timing attack because variations in the message create huge random variations in k)
        const a = this.curve.scale(this.curve.fromAffine(G), k)
        const aEncoded = encodePoint(this.curve.toAffine(a))

        // Second part of the signature
        //   (Not vulnerable to timing attack.
        //      Even tough f is known publicly and changes with each message,
        //      and the f * x operation isn't constant time (bigint ops in JS aren't constant time),
        //      k also changes with each message, and the [k]BASE operation above
        //      is much more expensive than multiplying two big ints)
        const f = this.oneWay(aEncoded.concat(publicKeyBytes).concat(message))
        const b = Z.add(k, f * privateKey)
        const bEncoded = encodeScalar(b)

        return aEncoded.concat(bEncoded)
    }

    /**
     * Returns `true` if the signature is correct.
     * Returns `false`:
     *   * if the signature is incorrect
     *   * if the signature doesn't lie on the curve,
     *   * if the publicKey doesn't lie on the curve
     * Throw an error:
     *   * signature isn't 64 bytes long
     *   * publickey isn't 32 bytes long (asserted inside `decodePoint()`)
     * @param {number[]} signature
     * @param {number[]} message
     * @param {number[]} publicKey
     * @returns {boolean}
     */
    verify(signature, message, publicKey) {
        if (signature.length != 64) {
            throw new Error(`unexpected signature length ${signature.length}`)
        }

        const a = this.curve.fromAffine(decodePoint(signature.slice(0, 32)))

        if (!this.curve.isValidPoint(a)) {
            return false
        }

        const b = decodeScalar(signature.slice(32, 64))

        const h = this.curve.fromAffine(decodePoint(publicKey))

        if (!this.curve.isValidPoint(h)) {
            return false
        }

        const f = this.oneWay(
            signature.slice(0, 32).concat(publicKey).concat(message)
        )

        const left = this.curve.scale(this.curve.fromAffine(G), b)
        const right = this.curve.add(a, this.curve.scale(h, f))

        return this.curve.equals(left, right)
    }
}

/**
 * @type {EdDSA}
 */
export const Ed25519 = makeEdDSA({ curve: new ExtendedCurveImpl() })
