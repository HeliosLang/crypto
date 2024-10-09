import { strictEqual } from "node:assert"
import { describe, it } from "node:test"
import { projectedCurve } from "./ProjectedCurve.js"
import { G as GAffine } from "./constants.js"

describe(`ProjectedCurve.fromAffine(112..121n, 225..410n)`, () => {
    const curve = projectedCurve

    const Q = curve.fromAffine({
        x: 112711660439710606056748659173929673102114977341539408544630613555209775888121n,
        y: 25583027980570883691656905877401976406448868254816295069919888960541586679410n
    })

    const Q2 = curve.fromAffine({
        x: 115780575977492633039504758427830329241728645270042306223540962614150928364886n,
        y: 78735063515800386211891312544505775871260717697865196436804966483607426560663n
    })

    it(`doubles as [115..886n, 787..663n]`, () => {
        strictEqual(curve.equals(curve.add(Q, Q), Q2), true)
    })

    it(`doubling is still on curve`, () => {
        strictEqual(curve.isValidPoint(curve.add(Q, Q)), true)
    })

    it(`scale(2n) gives same result as double()`, () => {
        strictEqual(curve.equals(curve.scale(Q, 2n), Q2), true)
    })

    const QG = curve.fromAffine({
        x: 103388573995635080359749164254216598308788835304023601477803095234286494993683n,
        y: 37057141145242123013015316630864329550140216928701153669873286428255828810018n
    })

    const G = curve.fromAffine(GAffine)

    it(`adding G once to gives [103..683n, 370..018n]`, () => {
        strictEqual(curve.equals(curve.add(Q, G), QG), true)
    })

    it(`adding G is still on curve`, () => {
        strictEqual(curve.isValidPoint(curve.add(Q, G)), true)
    })
})
