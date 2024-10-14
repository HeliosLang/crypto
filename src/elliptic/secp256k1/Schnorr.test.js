import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { hexToBytes } from "@helios-lang/codec-utils"
import { affineCurve } from "./AffineCurve.js"
import { SchnorrSecp256k1 as schnorrExtended, makeSchnorr } from "./Schnorr.js"

const schnorrAffine = makeSchnorr({ curve: affineCurve })

describe(`SchnorrSecpp256k1 for message 'Message for ECDSA signing'`, () => {
    const message = hexToBytes(
        "0000000000000000000000000000000000000000000000000000000000000000"
    )
    const privateKey = hexToBytes(
        "0000000000000000000000000000000000000000000000000000000000000003"
    )
    const nonce = hexToBytes(
        "0000000000000000000000000000000000000000000000000000000000000000"
    )
    const expectedPublicKey = hexToBytes(
        "f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9"
    )
    const expectedSignature = hexToBytes(
        "e907831f80848d1069a5371b402410364bdf1c5f8307b0084c55f1ce2dca821525f66a4a85ea8B71e482a74f382d2ce5eBeee8fdb2172f477df4900d310536c0"
    )

    it("generates publicKey #f9..f9 for privateKey #00..03", () => {
        const publicKey = schnorrExtended.derivePublicKey(privateKey)

        deepEqual(publicKey, expectedPublicKey)
    })

    it("generates publicKey #f9..f9 for privateKey #00..03 (affine)", () => {
        const publicKey = schnorrAffine.derivePublicKey(privateKey)

        deepEqual(publicKey, expectedPublicKey)
    })

    it("signs as #e9..c0 using private key #00..03", () => {
        const signature = schnorrExtended.sign(message, privateKey, nonce)

        deepEqual(signature, expectedSignature)
    })

    it("signs as #e9..c0 using private key #00..03 (affine)", () => {
        const signature = schnorrAffine.sign(message, privateKey, nonce)

        deepEqual(signature, expectedSignature)
    })

    it("fails for invalid length privateKey", () => {
        throws(() => schnorrExtended.derivePublicKey(new Array(31).fill(0)))
    })

    it("fails for invalid privateKey", () => {
        throws(() => schnorrExtended.derivePublicKey(new Array(32).fill(255)))
    })

    it("returns true when verifying #e9..c0 is correct signature", () => {
        strictEqual(
            schnorrExtended.verify(
                expectedSignature,
                message,
                expectedPublicKey
            ),
            true
        )
    })

    it("returns true when verifying #e9..c0 is correct signature (affine)", () => {
        strictEqual(
            schnorrAffine.verify(expectedSignature, message, expectedPublicKey),
            true
        )
    })

    it("returns false when verifying #e9..c9 is correct signature for wrong message", () => {
        strictEqual(
            schnorrExtended.verify(
                [0].concat(expectedSignature.slice(1)),
                message.slice().reverse(),
                expectedPublicKey
            ),
            false
        )
    })

    it("returns false when verifying #e9..c0 is correct signature for wrong messageHash (affine)", () => {
        strictEqual(
            schnorrAffine.verify(
                [0].concat(expectedSignature.slice(1)),
                message.slice().reverse(),
                expectedPublicKey
            ),
            false
        )
    })

    it("throws an error for incorrect signature", () => {
        throws(() => {
            schnorrExtended.verify(
                new Array(64).fill(0),
                message,
                expectedPublicKey
            )
        })
    })
})
