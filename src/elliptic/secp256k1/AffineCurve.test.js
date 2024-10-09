import { deepEqual, strictEqual } from "node:assert"
import { describe, it } from "node:test"
import { affineCurve } from "./AffineCurve.js"
import { G } from "./constants.js"

describe(`AffineCurve for point (112..121n, 225..410n)`, () => {
    const curve = affineCurve
    const Q = {
        x: 112711660439710606056748659173929673102114977341539408544630613555209775888121n,
        y: 25583027980570883691656905877401976406448868254816295069919888960541586679410n
    }

    const Q2 = {
        x: 115780575977492633039504758427830329241728645270042306223540962614150928364886n,
        y: 78735063515800386211891312544505775871260717697865196436804966483607426560663n
    }

    it(`doubles as [115..886n, 787..663n]`, () => {
        deepEqual(curve.add(Q, Q), Q2)
    })

    it(`scale(2n) gives same result as double()`, () => {
        deepEqual(curve.scale(Q, 2n), Q2)
    })

    it(`doubling is still on curve`, () => {
        strictEqual(curve.isValidPoint(curve.scale(Q, 2n)), true)
    })

    const QG = {
        x: 103388573995635080359749164254216598308788835304023601477803095234286494993683n,
        y: 37057141145242123013015316630864329550140216928701153669873286428255828810018n
    }

    it(`adding G once to gives [103..683n, 370..018n]`, () => {
        deepEqual(curve.add(Q, G), QG)
    })

    it(`adding G is still on curve`, () => {
        strictEqual(curve.isValidPoint(curve.add(Q, G)), true)
    })
})
