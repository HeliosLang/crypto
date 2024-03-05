import { describe, it } from "node:test"
import { deepEqual, strictEqual, throws } from "node:assert"
import { encodeUtf8, hexToBytes } from "@helios-lang/codec-utils"
import { sha3_256 } from "../../digest/sha3_256.js"
import { ECDSA, ECDSASecp256k1 as ecdsaExtended } from "./ECDSA.js"
import { affineCurve } from "./AffineCurve.js"

const ecdsaAffine = new ECDSA(affineCurve)

describe(`ECDSASecpp256k1 for message 'Message for ECDSA signing'`, () => {
    const message = "Message for ECDSA signing"
    const messageHash = sha3_256(encodeUtf8(message))
    const privateKey = hexToBytes(
        "79afbf7147841fca72b45a1978dd7669470ba67abbe5c220062924380c9c364b"
    )
    const expectedPublicKey = hexToBytes(
        "02003804a19f2437f7bba4fcfbc194379e43e514aa98073db3528ccdbdb642e240"
    )
    const expectedSignature = hexToBytes(
        "b83380f6e1d09411ebf49afd1a95c738686bfb2b0fe2391134f4ae3d6d77b78a6c305afcac930a3ea1721c04d8a1a979016baae011319746323a756fbaee1811"
    )

    it("generates publicKey #02..40 for privateKey #79..4b", () => {
        const publicKey = ecdsaExtended.derivePublicKey(privateKey)

        deepEqual(publicKey, expectedPublicKey)
    })

    it("generates publicKey #02..40 for privateKey #79..4b (affine)", () => {
        const publicKey = ecdsaAffine.derivePublicKey(privateKey)

        deepEqual(publicKey, expectedPublicKey)
    })

    it("fails for invalid length privateKey", () => {
        throws(() => ecdsaExtended.derivePublicKey(new Array(31).fill(0)))
    })

    it("fails for invalid privateKey", () => {
        throws(() => ecdsaExtended.derivePublicKey(new Array(32).fill(255)))
    })

    it("signs as #b8..11 using private key #79..4b", () => {
        const signature = ecdsaExtended.sign(messageHash, privateKey)

        deepEqual(signature, expectedSignature)
    })

    it("signs as #b8..11 using private key #79..4b (affine)", () => {
        const signature = ecdsaAffine.sign(messageHash, privateKey)

        deepEqual(signature, expectedSignature)
    })

    it("returns true when verifying #b8..11 is correct signature", () => {
        strictEqual(
            ecdsaExtended.verify(
                expectedSignature,
                messageHash,
                expectedPublicKey
            ),
            true
        )
    })

    it("returns true when verifying #b8..11 is correct signature (affine)", () => {
        strictEqual(
            ecdsaAffine.verify(
                expectedSignature,
                messageHash,
                expectedPublicKey
            ),
            true
        )
    })

    it("returns false when verifying #b8..11 is correct signature for wrong messageHash", () => {
        strictEqual(
            ecdsaExtended.verify(
                [0].concat(expectedSignature.slice(1)),
                messageHash.slice().reverse(),
                expectedPublicKey
            ),
            false
        )
    })

    it("returns false when verifying #b8..11 is correct signature for wrong messageHash (affine)", () => {
        strictEqual(
            ecdsaAffine.verify(
                [0].concat(expectedSignature.slice(1)),
                messageHash.slice().reverse(),
                expectedPublicKey
            ),
            false
        )
    })

    it("throws an error for incorrect signature", () => {
        throws(() => {
            ecdsaExtended.verify(
                new Array(64).fill(0),
                messageHash,
                expectedPublicKey
            )
        })
    })
})
