export { decodeBech32, encodeBech32, isValidBech32 } from "./checksum/index.js"
export {
    blake2b,
    hmacSha2_256,
    hmacSha2_512,
    keccak_256,
    pbkdf2,
    sha2_256,
    sha2_512,
    sha3_256
} from "./digest/index.js"
export {
    decodeG1Point,
    decodeG2Point,
    ECDSASecp256k1,
    Ed25519,
    encodeG1Point,
    encodeG2Point,
    F12,
    finalExponentiate,
    finalVerify,
    G1,
    G1Affine,
    G2,
    G2Affine,
    hashToG1,
    hashToG2,
    millerLoop,
    SchnorrSecp256k1
} from "./elliptic/index.js"
export { generateBytes, hmacDrbg, mulberry32, rand } from "./rand/index.js"

/**
 * Data container for affine points
 * @template T bigint, [bigint, bigint] etc.
 * @typedef {{
 *   x: T
 *   y: T
 * }} Point2
 */

/**
 * Data container for projected points (much faster to do curve operations on than affine)
 * @template T
 * @typedef {{
 *   x: T
 *   y: T
 *   z: T
 * }} Point3
 */

/**
 * @typedef {Point2<bigint>} Point2I
 * @typedef {Point2<[bigint, bigint]>} Point2C
 * @typedef {Point3<bigint>} Point3I
 * @typedef {Point3<[bigint, bigint]>} Point3C
 */

/**
 * Function that generates a random number between 0 and 1
 * @typedef {() => number} NumberGenerator
 */

/**
 * @typedef {[
 *   [[bigint,bigint], [bigint,bigint], [bigint, bigint]],
 *   [[bigint,bigint], [bigint,bigint], [bigint, bigint]],
 * ]} FieldElement12
 */

/**
 * @typedef {{
 *   ZERO: FieldElement12
 *   ONE: FieldElement12
 *   add(a: FieldElement12, ...b: FieldElement12[]): FieldElement12
 *   scale(a: FieldElement12, s: bigint): FieldElement12
 *   multiply(a: FieldElement12, b: FieldElement12): FieldElement12
 *   equals(a: FieldElement12, b: FieldElement12): boolean
 *   invert(a: FieldElement12): FieldElement12
 *   isZero(a: FieldElement12): boolean
 *   isOne(a: FieldElement12): boolean
 *   mod(a: FieldElement12): FieldElement12
 *   subtract(a: FieldElement12, b: FieldElement12): FieldElement12
 *   negate(a: FieldElement12): FieldElement12
 *   square(a: FieldElement12): FieldElement12
 *   cube(a: FieldElement12): FieldElement12
 *   divide(a: FieldElement12, b: FieldElement12): FieldElement12
 *   pow(a: FieldElement12, p: bigint): FieldElement12
 *   halve(a: FieldElement12): FieldElement12
 *   conjugate(a: FieldElement12): FieldElement12
 *   powp(a: FieldElement12, n: number): FieldElement12
 *   multiplyF2(a: FieldElement12, b: [bigint, bigint]): FieldElement12
 * }} Field12WithExtendedOps
 */

/**
 * @typedef {{
 *   b: bigint
 *   ZERO: Point2I
 *   add(a: Point2I, b: Point2I): Point2I
 *   negate(a: Point2I): Point2I
 *   equals(a: Point2I, b: Point2I): boolean
 *   isValidPoint(p: Point2I): boolean
 *   isZero(point: Point2I): boolean
 *   subtract(a: Point2I, b: Point2I): Point2I
 *   scale(point: Point2I, s: bigint): Point2I
 *   toAffine(point: Point2I): Point2I
 *   fromAffine(point: Point2I): Point2I
 * }} AffineCurve1
 */

/**
 * @typedef {{
 *   b: [bigint, bigint]
 *   ZERO: Point2C
 *   add(a: Point2C, b: Point2C): Point2C
 *   negate(a: Point2C): Point2C
 *   equals(a: Point2C, b: Point2C): boolean
 *   isValidPoint(p: Point2C): boolean
 *   isZero(point: Point2C): boolean
 *   subtract(a: Point2C, b: Point2C): Point2C
 *   scale(point: Point2C, s: bigint): Point2C
 *   toAffine(point: Point2C): Point2C
 *   fromAffine(point: Point2C): Point2C
 * }} AffineCurve2
 */

/**
 * @typedef {{
 *   ZERO: Point3I
 *   add(a: Point3I, b: Point3I): Point3I
 *   negate(a: Point3I): Point3I
 *   equals(a: Point3I, b: Point3I): boolean
 *   isValidPoint(p: Point3I): boolean
 *   isZero(point: Point3I): boolean
 *   subtract(a: Point3I, b: Point3I): Point3I
 *   scale(point: Point3I, s: bigint): Point3I
 *   toAffine(point: Point3I): Point2I
 *   fromAffine(point: Point2I): Point3I
 *   clearCofactor(point: Point3I): Point3I
 * }} ProjectedCurve1
 */

/**
 * @typedef {{
 *   ZERO: Point3C
 *   add(a: Point3C, b: Point3C): Point3C
 *   negate(a: Point3C): Point3C
 *   equals(a: Point3C, b: Point3C): boolean
 *   isValidPoint(p: Point3C): boolean
 *   isZero(point: Point3C): boolean
 *   subtract(a: Point3C, b: Point3C): Point3C
 *   scale(point: Point3C, s: bigint): Point3C
 *   toAffine(point: Point3C): Point2C
 *   fromAffine(point: Point2C): Point3C
 *   scalex(point: Point3C): Point3C
 *   psi(point: Point3C): Point3C
 *   psi2(point: Point3C): Point3C
 *   clearCofactor(point: Point3C): Point3C
 * }} ProjectedCurve2
 */

/**
 * @typedef {object} EdDSA
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
 * @prop {(privateKeyBytes: number[], hashPrivateKey?: boolean) => number[]} derivePublicKey
 * @prop {(message: number[], privateKeyBytes: number[], hashPrivateKey?: boolean) => number[]} sign
 * @prop {(signature: number[], message: number[], publicKey: number[]) => boolean} verify
 */

/**
 * @typedef {object} ECDSA
 * The ECDSA algorithm is explained very well here: https://cryptobook.nakov.com/digital-signatures/ecdsa-sign-verify-messages
 *
 * @prop {(privateKeyBytes: number[]) => number[]} derivePublicKey
 * @prop {(messageHash: number[], privateKeyBytes: number[]) => number[]} sign
 * @prop {(signature: number[], messageHash: number[], publicKeyByes: number[]) => boolean} verify
 */

/**
 * @typedef {object} Schnorr
 * @prop {(privateKeyBytes: number[]) => number[]} derivePublicKey
 * @prop {(message: number[], privateKeyBytes: number[], nonce: number[]) => number[]} sign
 * @prop {(signature: number[], message: number[], publicKeyBytes: number[]) => boolean} verify
 */
