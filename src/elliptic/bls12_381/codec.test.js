import { throws } from "node:assert"
import { describe, it } from "node:test"
import { hexToBytes } from "@helios-lang/codec-utils"
import { decodeG1Point } from "./codec.js"

describe(decodeG1Point.name, () => {
    it("fails for invalid zero 1 (first bit isn't 1)", () => {
        throws(() => {
            decodeG1Point(
                hexToBytes(
                    "400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
                )
            )
        })
    })

    it("fails for invalid zero 2 (3rd header bit non-zero)", () => {
        throws(() => {
            decodeG1Point(
                hexToBytes(
                    "e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
                )
            )
        })
    })

    it("fails for invalid zero 3 (random body bit non-zero)", () => {
        throws(() => {
            decodeG1Point(
                hexToBytes(
                    "c00000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000"
                )
            )
        })
    })

    it("fails for off-curve point", () => {
        throws(() => {
            decodeG1Point(
                hexToBytes(
                    "a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003"
                )
            )
        })
    })

    it("ok for valid point with 3rd bit unset", () => {
        const bytes = hexToBytes(
            "81e9a0c68985059bd25a5ef05b351ca22f7d7c19e37928583ae12a1f4939440ff754cfd85b23df4a54f66c7089db6deb"
        )
        decodeG1Point(bytes)
    })

    it("fails for uncompressed representation", () => {
        const bytes = hexToBytes(
            "01e9a0c68985059bd25a5ef05b351ca22f7d7c19e37928583ae12a1f4939440ff754cfd85b23df4a54f66c7089db6deb12ae8470d881eb628dfcf4bb083fb8a6968d907a0c265f6d06e04b05a19418d395d3e0c115430f88e7156822904ef5bf"
        )
        throws(() => {
            decodeG1Point(bytes)
        })
    })

    /*it("fails for valid point which isn't in subgroup", () => {
        const bytes = hexToBytes("a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005")

        throws(() => {
            decodeG1Point(bytes)
        })
    })*/
})
