import { sha2_512 } from "../../digest/index.js"
import { mod } from "../common/index.js"
import { ExtendedPoint } from "./ExtendedPoint.js"
import { decodeScalar, decodePrivateKey, encodeScalar } from "./codec.js"
import { N } from "./constants.js"

/**
 * @template {CurvePoint<T>} T
 * @typedef {import("../CurvePoint.js").CurvePoint<T>} CurvePoint
 */

/**
 * @template {CurvePoint<T>} T
 * @typedef {import("../CurvePoint.js").CurvePointClass<T>} CurvePointClass
 */

const hash = sha2_512

/**
 * Edwards Digital Signing Algorithm
 *
 * Symbols based on the book "Elliptic Curves in Cryptography" by I.F. Blake, G. Seroussi and N.P. Smart
 * See page 4 for an overview of the DSA algorithm.
 * This book along with the first few sections of "Cryptography: An Introduction" by N.P. Smart are
 *   recommended reads in order to understand better the concepts of "scalars" and "CurvePoint" and
 *   their arithmatic over finite fields.
 *
 * Notation:
 *   privateKey: 64 bytes, first 32 bytes form the scalar integer `x`, the latter bytes are used for private nonce generation
 *   publicKey: 32 bytes
 *   x: bigint scalar representation of privateKey
 *   g: generator BASE point
 *   h: CurvePoint representation of publicKey
 *   m: (hashed) message, kept as bytes
 *   k: a practically random number, created by applying a one-way function to the message and part of the private key
 *   a: first part of signature
 *   b: second part of signature
 *   `*`: group multiplication of a CurvePoint by a scalar integer, or multiplication of 2 scalars (depending on context)
 *   `+`: CurvePoint addition or scalar addition depending on context
 *   `.`: byte concatenation
 *   `[n:N]`: slice bytes
 *   `f(a,h,m)`: a one-way function for publicy known information
 *   `mod()`: take modulo of a scalar wrt. the order of the Curve
 *   `hash()`: Sha512 hash function
 *   `encodeScalar`: turn a scalar integer into bytes
 *   `decodeScalar`: turn bytes into a scalar integer
 *   `encodePoint`: turn a CurvePoint into bytes
 *   `decodePoint`: turn bytes into a CurvePoint
 *
 * The algorithm below is approached from an additive perspective.
 *
 * 1. Generate 64 random private key bytes
 *      privateKey = random(64)
 * 2. Generate the associated scalar `x`:
 *      x = decodeScalar(privateKey[0:32])
 * 3. Generate public key CurvePoint:
 *      h = g*x
 * 4. Encode public key:
 *      publicKey = encodePoint(h)
 * 5. Create first part of a signature:
 *      k = decodeScalar(hash(privateKey[32:64] . m))
 *      a = g*k
 *      signature[0:32] = encodePoint(a)
 * 6. Create second part of a signature:
 *      f(a,h,m) = decodeScalar(hash(signature[0:32] . publicKey . m))
 *      b = mod(k + f(a,h,m)*x)
 *      signature[32:64] = encodeScalar(b)
 * 7. Verify a signature:
 *      a = decodePoint(signature[0:32])
 *      b = decodeScalar(signature[32:64])
 *      h = decodePoint(publicKey)
 *      f(a,h,m) = decodeScalar(hash(signature[0:32] . publicKey . m))
 *      g*b === a + h*f(a,h,m)
 *
 * We can show that this works by substituting the private calculations done upon signing (the arithmatic takes care of the mod() operator):
 *      g*(k + f(a,h,m)*x) === g*k + h*f(a,h,m)
 *      g*k + g*x*f(a,h,m) === g*k + h*f(a,h,m)
 *
 * We know that `g*x == h`, QED.
 *
 * The arithmatic details are handled by the CurvePoint class
 *
 * @template {CurvePoint<T>} T
 */
export class EdDSA {
    /**
     * @type {CurvePointClass<T>}
     */
    #CurvePointImpl

    /**
     *
     * @param {CurvePointClass<T>} impl
     */
    constructor(impl) {
        this.#CurvePointImpl = impl
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
     * @param {number[]} privateKey
     * @param {boolean} hashPrivateKey - defaults to true, set to false when used in Bip32 algorithm
     * @returns {number[]} 32 byte public key.
     */
    derivePublicKey(privateKey, hashPrivateKey = true) {
        if (hashPrivateKey) {
            privateKey = hash(privateKey)
        } else {
            if (privateKey.length != 64) {
                throw new Error(
                    `expected extended privateKey with a length of 64 bytes, this privateKey is ${privateKey.length} bytes long (hint: pass hashPrivateKey = true)`
                )
            }
        }

        const x = decodePrivateKey(privateKey)
        const h = this.#CurvePointImpl.BASE.mul(x)

        return h.encode()
    }

    /**
     * @param {number[]} message
     * @param {number[]} privateKey
     * @param {boolean} hashPrivateKey - defaults to true, Bip32 passes this as false
     * @returns {number[]} 64 byte signature.
     */
    sign(message, privateKey, hashPrivateKey = true) {
        if (hashPrivateKey) {
            privateKey = hash(privateKey)
        } else {
            if (privateKey.length != 64) {
                throw new Error(
                    `expected extended privateKey with a length of 64 bytes, this privateKey is ${privateKey.length} bytes long (hint: pass hashPrivateKey = true)`
                )
            }
        }

        // extract privateKey as integer
        const x = decodePrivateKey(privateKey)

        // for convenience calculate publicKey here:
        const publicKey = this.#CurvePointImpl.BASE.mul(x).encode()

        // generate a practically random number
        const k = this.oneWay(privateKey.slice(32, 64).concat(message))

        // first part of the signature
        const a = this.#CurvePointImpl.BASE.mul(k)
        const aEncoded = a.encode()

        // second part of the signature
        const f = this.oneWay(aEncoded.concat(publicKey).concat(message))
        const b = mod(k + f * x, N)
        const bEncoded = encodeScalar(b)

        return aEncoded.concat(bEncoded)
    }

    /**
     * Returns `true` if the signature is correct.
     * @param {number[]} signature
     * @param {number[]} message
     * @param {number[]} publicKey
     * @returns {boolean}
     */
    verify(signature, message, publicKey) {
        if (signature.length != 64) {
            throw new Error(`unexpected signature length ${signature.length}`)
        }

        const a = this.#CurvePointImpl.decode(signature.slice(0, 32))
        const b = decodeScalar(signature.slice(32, 64))

        const h = this.#CurvePointImpl.decode(publicKey)
        const f = this.oneWay(
            signature.slice(0, 32).concat(publicKey).concat(message)
        )

        const left = this.#CurvePointImpl.BASE.mul(b)
        const right = a.add(h.mul(f))

        return left.equals(right)
    }
}

export const Ed25519 = new EdDSA(ExtendedPoint)
