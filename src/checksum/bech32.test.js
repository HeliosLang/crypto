import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { decodeBase32, encodeUtf8, hexToBytes } from "@helios-lang/codec-utils"
import { decodeBech32, encodeBech32, isValidBech32 } from "./bech32.js"

describe(encodeBech32.name, () => {
    it("fails with empty human readable part", () => {
        throws(() => encodeBech32("", []))
    })

    it('returns "foo1vehk7cnpwgry9h96" for "foobar" with "foo" human-readable-part', () => {
        strictEqual(
            encodeBech32("foo", encodeUtf8("foobar")),
            "foo1vehk7cnpwgry9h96"
        )
    })

    it('returns "addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld" for #70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539 with "addr_test" human-readable-part', () => {
        strictEqual(
            encodeBech32(
                "addr_test",
                hexToBytes(
                    "70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539"
                )
            ),
            "addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld"
        )
    })
})

describe(decodeBase32.name, () => {
    it("fails for empty string", () => {
        throws(() => decodeBech32(""))
    })

    it("fails for random string", () => {
        throws(() => decodeBech32("balbalbal"))
    })

    it('returns #70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539 for "addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld"', () => {
        deepEqual(
            decodeBech32(
                "addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld"
            ),
            [
                "addr_test",
                hexToBytes(
                    "70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539"
                )
            ]
        )
    })
})

/**
 * @type {[string, boolean][]}
 */
const testVector = [
    ["", false],
    ["blablabla", false],
    ["addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld", true],
    ["foo1vehk7cnpwgry9h96", true],
    ["foo1vehk7cnpwgry9h97", false],
    ["a12uel5l", true],
    ["mm1crxm3i", false],
    ["A1G7SGD8", false],
    ["abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw", true],
    ["?1ezyfcl", true],
    ["addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld", true]
]

describe(isValidBech32.name, () => {
    testVector.forEach(([encoded, expected]) => {
        it(`returns ${expected} for "${encoded}"`, () => {
            strictEqual(isValidBech32(encoded), expected)
        })
    })
})

describe(`roundtrip ${decodeBech32.name}/${encodeBech32.name}`, () => {
    /**
     * @param {string} encoded
     * @returns {string}
     */
    function roundtrip(encoded) {
        const [hrp, payload] = decodeBech32(encoded)

        return encodeBech32(hrp, payload)
    }

    testVector.forEach(([encoded, expected]) => {
        if (expected) {
            it(`ok for "${encoded}"`, () => {
                strictEqual(roundtrip(encoded), encoded)
            })
        } else {
            it(`fails for "${encoded}"`, () => {
                throws(() => roundtrip(encoded))
            })
        }
    })
})
