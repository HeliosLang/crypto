import { strictEqual } from "node:assert"
import { describe, it } from "node:test"
import { bytesToHex, encodeUtf8 } from "@helios-lang/codec-utils"
import { hmacSha2_256, hmacSha2_512 } from "./hmac.js"

describe(hmacSha2_256.name, () => {
    it('returns #f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8 for "The quick brown fox jumps over the lazy dog" with key="key"', () => {
        strictEqual(
            bytesToHex(
                hmacSha2_256(
                    encodeUtf8("key"),
                    encodeUtf8("The quick brown fox jumps over the lazy dog")
                )
            ),
            "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"
        )
    })
})

describe(hmacSha2_512.name, () => {
    it('returns #b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a for "The quick brown fox jumps over the lazy dog" with key="key"', () => {
        strictEqual(
            bytesToHex(
                hmacSha2_512(
                    encodeUtf8("key"),
                    encodeUtf8("The quick brown fox jumps over the lazy dog")
                )
            ),
            "b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a"
        )
    })
})
