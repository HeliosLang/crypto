import { deepEqual, strictEqual } from "node:assert"
import { describe, it } from "node:test"
import { bytesToHex, encodeUtf8 } from "@helios-lang/codec-utils"
import { sha2_256 } from "./sha2_256.js"

/**
 * Each entry: text input hex bytes output
 * Taken from: https://www.di-mgt.com.au/sha_testvectors.html
 * @type {[string, string][]}
 */
const testVector = [
    ["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
    ["abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
    [
        "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
        "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"
    ],
    [
        "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu",
        "cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1"
    ]
]

describe(sha2_256.name, () => {
    it('returns [223, 253, 96, ...] for "Hello, World!"', () => {
        deepEqual(
            sha2_256(encodeUtf8("Hello, World!")),
            [
                223, 253, 96, 33, 187, 43, 213, 176, 175, 103, 98, 144, 128,
                158, 195, 165, 49, 145, 221, 129, 199, 247, 10, 75, 40, 104,
                138, 54, 33, 130, 152, 111
            ]
        )
    })

    testVector.forEach(([msg, hash]) => {
        it(`returns #${hash} for "${msg}"`, () => {
            strictEqual(bytesToHex(sha2_256(encodeUtf8(msg))), hash)
        })
    })
})
