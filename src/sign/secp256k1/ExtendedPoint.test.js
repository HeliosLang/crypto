import { describe, it } from "node:test"
import { AffinePoint } from "./AffinePoint.js"
import { ExtendedPoint } from "./ExtendedPoint.js"
import { deepEqual, strictEqual } from "node:assert"

describe(`${ExtendedPoint.name}.fromAffine(112..121n, 225..410n)`, () => {
    const Qx =
        112711660439710606056748659173929673102114977341539408544630613555209775888121n
    const Qy =
        25583027980570883691656905877401976406448868254816295069919888960541586679410n
    const Q = ExtendedPoint.fromAffine(new AffinePoint(Qx, Qy))

    const tQx =
        115780575977492633039504758427830329241728645270042306223540962614150928364886n
    const tQy =
        78735063515800386211891312544505775871260717697865196436804966483607426560663n

    it(`doubles as [115..886n, 787..663n]`, () => {
        const { x, y } = Q.add(Q).toAffine()

        deepEqual([x, y], [tQx, tQy])
    })

    it(`doubling is still on curve`, () => {
        strictEqual(Q.add(Q).isOnCurve(), true)
    })

    it(`mul(2n) gives same result as double()`, () => {
        const { x, y } = Q.mul(2n).toAffine()
        deepEqual([x, y], [tQx, tQy])
    })

    const QGx =
        103388573995635080359749164254216598308788835304023601477803095234286494993683n
    const QGy =
        37057141145242123013015316630864329550140216928701153669873286428255828810018n

    it(`adding G once to gives [103..683n, 370..018n]`, () => {
        const { x, y } = Q.add(ExtendedPoint.BASE).toAffine()

        deepEqual([x, y], [QGx, QGy])
    })

    it(`adding G is still on curve`, () => {
        strictEqual(Q.add(ExtendedPoint.BASE).isOnCurve(), true)
    })
})
