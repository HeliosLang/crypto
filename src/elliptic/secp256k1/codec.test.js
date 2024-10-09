import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { bytesToHex, hexToBytes } from "@helios-lang/codec-utils"
import {
    decodeMessageHash,
    decodePrivateKey,
    decodeECDSASignature,
    encodeSignature
} from "./codec.js"

describe(decodeMessageHash.name, () => {
    it(`decodes #6b..f9 as 484..409n`, () => {
        strictEqual(
            decodeMessageHash(
                hexToBytes(
                    "6b3778a64f2675f3f76bf9f35af1fc673759ed17aed86dd56ca36c2bfd7eb0f9"
                )
            ),
            48495484080220569186997698254736529536979019705881637030162493907631316316409n
        )
    })
})

describe(decodePrivateKey.name, () => {
    it(`decodes #79..4b as 550..987n`, () => {
        strictEqual(
            decodePrivateKey(
                hexToBytes(
                    "79afbf7147841fca72b45a1978dd7669470ba67abbe5c220062924380c9c364b"
                )
            ),
            55040374202469186081280626064735809712680479393847012308565755026037886694987n
        )
    })

    it(`fails for invalid length privateKey`, () => {
        throws(() => decodePrivateKey([]))
    })

    it(`fails for overflowing privateKey`, () => {
        throws(() => decodePrivateKey(new Array(32).fill(255)))
    })
})

describe(decodeECDSASignature.name, () => {
    it(`decodes #b8..11 as [833..138n, 489..753n]`, () => {
        deepEqual(
            decodeECDSASignature(
                hexToBytes(
                    "b83380f6e1d09411ebf49afd1a95c738686bfb2b0fe2391134f4ae3d6d77b78a6c305afcac930a3ea1721c04d8a1a979016baae011319746323a756fbaee1811"
                )
            ),
            [
                83316563419085052174455536116532558518216928220275910182867961796639877216138n,
                48935224275354106586833883609785026016195733427976804152665962453349421684753n
            ]
        )
    })

    it(`fails for invalid length signature`, () => {
        throws(() => decodeECDSASignature([]))
    })

    it(`fails for invalid length signature`, () => {
        throws(() => decodeECDSASignature(new Array(31).fill(0)))
    })

    it(`fails for invalid signature (all 0 bytes)`, () => {
        throws(() => decodeECDSASignature(new Array(64).fill(0)))
    })
})

describe(encodeSignature.name, () => {
    it(`encodes r=833..138n, s=489..753n as #b8..11`, () => {
        strictEqual(
            bytesToHex(
                encodeSignature(
                    83316563419085052174455536116532558518216928220275910182867961796639877216138n,
                    48935224275354106586833883609785026016195733427976804152665962453349421684753n
                )
            ),
            "b83380f6e1d09411ebf49afd1a95c738686bfb2b0fe2391134f4ae3d6d77b78a6c305afcac930a3ea1721c04d8a1a979016baae011319746323a756fbaee1811"
        )
    })
})
