import { strictEqual } from "node:assert"
import { describe, it } from "node:test"
import { bytesToHex, encodeUtf8 } from "@helios-lang/codec-utils"
import { hmacSha2_256, hmacSha2_512 } from "./hmac.js"
import { pbkdf2 } from "./pbkdf2.js"

describe(pbkdf2.name, () => {
    it('returns #120fb6cffcf8b32c43e7225256c4f837a86548c9 for "password" with prf=hmacSha2_256, salt="salt", nIters=1 and keyLen=20', () => {
        strictEqual(
            bytesToHex(
                pbkdf2(
                    hmacSha2_256,
                    encodeUtf8("password"),
                    encodeUtf8("salt"),
                    1,
                    20
                )
            ),
            "120fb6cffcf8b32c43e7225256c4f837a86548c9"
        )
    })

    it('returns #e1d9c16aa681708a45f5c7c4e215ceb66e011a2e for "password" with prf=hmacSha2_512, salt="salt", nIters=2 and keyLen=20', () => {
        strictEqual(
            bytesToHex(
                pbkdf2(
                    hmacSha2_512,
                    encodeUtf8("password"),
                    encodeUtf8("salt"),
                    2,
                    20
                )
            ),
            "e1d9c16aa681708a45f5c7c4e215ceb66e011a2e"
        )
    })
})
