import { describe, it } from "node:test"
import { decodePrivateKey } from "./codec.js"
import { strictEqual } from "node:assert"
import { hexToBytes } from "@helios-lang/codec-utils"

describe(decodePrivateKey.name, () => {
    const privateKeyHash = hexToBytes(
        "357c83864f2833cb427a2ef1c00a013cfdff2768d980c0a3a520f006904de90f9b4f0afe280b746a778684e75442502057b7473a03f08f96f5a38e9287e01f8f"
    )

    it(`decode hash privateKey #35..8f as 361..720n`, () => {
        strictEqual(
            decodePrivateKey(privateKeyHash),
            36144925721603087658594284515452164870581325872720374094707712194495455132720n
        )
    })
})
