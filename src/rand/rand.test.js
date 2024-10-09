import { strictEqual } from "node:assert"
import { describe, it } from "node:test"
import { rand } from "./rand.js"

describe(rand.name, () => {
    it("99.9% unique numbers (1_000_000 runs)", () => {
        const generator = rand(42)

        /**
         * @type {Set<number>}
         */
        const set = new Set()

        for (let i = 0; i < 1_000_000; i++) {
            set.add(generator())
        }

        strictEqual(set.size / 1_000_000 > 0.999, true)
    })
})
