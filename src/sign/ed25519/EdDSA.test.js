import { describe, it } from "node:test"
import { AffinePoint } from "./AffinePoint.js"
import { EdDSA, Ed25519 as ed25519Extended } from "./EdDSA.js"
import { encodeUtf8, hexToBytes } from "@helios-lang/codec-utils"
import { deepEqual, strictEqual } from "node:assert"

const ed25519Affine = new EdDSA(AffinePoint)

describe('Ed25519 for ""', () => {
    // not the extended privateKey!
    const privateKey = hexToBytes(
        "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"
    )
    const expectedPublicKey = hexToBytes(
        "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"
    )
    const message = ""
    const messageBytes = encodeUtf8(message)
    const expectedSignature = hexToBytes(
        "e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"
    )

    it(`generates publicKey ##d7..1a for privateKey #9d..60`, () => {
        deepEqual(
            ed25519Extended.derivePublicKey(privateKey),
            expectedPublicKey
        )
    })

    it(`generates publicKey ##d7..1a for privateKey #9d..60 (affine)`, () => {
        deepEqual(ed25519Affine.derivePublicKey(privateKey), expectedPublicKey)
    })

    it(`signs as #7e..04 for privateKey #9d..60`, () => {
        deepEqual(
            ed25519Extended.sign(messageBytes, privateKey, true),
            expectedSignature
        )
    })

    it(`signs as #7e..04 for privateKey #9d..60 (affine)`, () => {
        deepEqual(
            ed25519Affine.sign(messageBytes, privateKey, true),
            expectedSignature
        )
    })

    it(`returns true when verifying signature #7e..04`, () => {
        strictEqual(
            ed25519Extended.verify(
                expectedSignature,
                messageBytes,
                expectedPublicKey
            ),
            true
        )
    })

    it(`returns true when verifying signature #7e..04 (affine)`, () => {
        strictEqual(
            ed25519Affine.verify(
                expectedSignature,
                messageBytes,
                expectedPublicKey
            ),
            true
        )
    })

    it(`returns false when verifying different message`, () => {
        strictEqual(
            ed25519Extended.verify(
                expectedSignature,
                [0, 0],
                expectedPublicKey
            ),
            false
        )
    })
})

describe('Ed25519 for "Hello"', () => {
    // not the extended privateKey!
    const privateKey = hexToBytes(
        "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"
    )
    const expectedPublicKey = hexToBytes(
        "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"
    )
    const message = "Hello"
    const messageBytes = encodeUtf8(message)
    const expectedSignature = hexToBytes(
        "52dc29f7ec08cf13d82af0738b2d12ff7da1b967866e9cf9bcd22d7972f1be2cfad44b3018e30969edd07a0fb902a95685707003011c50de3b1cec146a0d4207"
    )

    it(`signs as #62..0a for privateKey #9d..60`, () => {
        deepEqual(
            ed25519Extended.sign(messageBytes, privateKey, true),
            expectedSignature
        )
    })

    it(`signs as #62..0a for privateKey #9d..60 (affine)`, () => {
        deepEqual(
            ed25519Affine.sign(messageBytes, privateKey, true),
            expectedSignature
        )
    })

    it(`returns true when verifying signature #62..0a`, () => {
        strictEqual(
            ed25519Extended.verify(
                expectedSignature,
                messageBytes,
                expectedPublicKey
            ),
            true
        )
    })

    it(`returns true when verifying signature #62..0a (affine)`, () => {
        strictEqual(
            ed25519Affine.verify(
                expectedSignature,
                messageBytes,
                expectedPublicKey
            ),
            true
        )
    })

    it(`returns false when verifying different message`, () => {
        strictEqual(
            ed25519Extended.verify(
                expectedSignature,
                [0, 0],
                expectedPublicKey
            ),
            false
        )
    })
})
