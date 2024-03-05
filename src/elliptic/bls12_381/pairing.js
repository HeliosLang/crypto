import { CurveWithOps } from "../common/index.js"
import { CURVE1 } from "./constants.js"
import { affineCurve1 as G1, affineCurve2 as G2 } from "./curves/index.js"
import { F2, F12, F1 } from "./fields/index.js"

/**
 * @typedef {import("./fields/index.js").FieldElement6} FieldElement6
 */

/**
 * @typedef {import("./fields/index.js").FieldElement12} FieldElement12
 */

/**
 * @template T
 * @typedef {import("../common/index.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {import("../common/index.js").Point3<T>} Point3
 */

/**
 * @param {Point2<bigint>} a
 * @param {Point2<[bigint, bigint]>} b
 * @returns {FieldElement12}
 */
// Calculates bilinear pairing
export function millerLoop(a, b) {
    if (G1.isZero(a) || !G1.isValidPoint(a)) {
        throw new Error("invalid first point for pairing")
    }

    if (G2.isZero(b) || !G2.isValidPoint(b)) {
        throw new Error("invalid second point for pairing")
    }

    /**
     * @type {FieldElement6[]}
     */
    const bs = precompute(b.x, b.y)

    return millerLoopInternal([a.x, a.y], bs)
}

/**
 * @param {[bigint, bigint]} bx
 * @param {[bigint, bigint]} by
 * @returns {FieldElement6[]}
 */
function precompute(bx, by) {
    const Qx = bx
    const Qy = by
    const Qz = F2.ONE

    let Rx = Qx
    let Ry = Qy
    let Rz = Qz

    /**
     * @type {FieldElement6[]}
     */
    let res = []

    for (let i = 62; i >= 0; i--) {
        // Double
        let t0 = F2.square(Ry) // Ry²
        let t1 = F2.square(Rz) // Rz²
        let t2 = F2.multiply(F2.scale(t1, 3n), G2.b) // 3 * T1 * B
        let t3 = F2.scale(t2, 3n) // 3 * T2
        let t4 = F2.subtract(F2.square(F2.add(Ry, Rz)), F2.add(t1, t0)) // (Ry + Rz)² - T1 - T0

        res.push([
            F2.subtract(t2, t0), // T2 - T0
            F2.scale(F2.square(Rx), 3n), // 3 * Rx²
            F2.negate(t4) // -T4
        ])

        Rx = F2.halve(F2.multiply(F2.subtract(t0, t3), F2.multiply(Rx, Ry))) // ((T0 - T3) * Rx * Ry) / 2
        Ry = F2.subtract(
            F2.square(F2.halve(F2.add(t0, t3))),
            F2.scale(F2.square(t2), 3n)
        ) // ((T0 + T3) / 2)² - 3 * T2²
        Rz = F2.multiply(t0, t4) // T0 * T4

        if (getXBit(i)) {
            // Addition
            let t0 = F2.subtract(Ry, F2.multiply(Qy, Rz)) // Ry - Qy * Rz
            let t1 = F2.subtract(Rx, F2.multiply(Qx, Rz)) // Rx - Qx * Rz

            res.push([
                F2.subtract(F2.multiply(t0, Qx), F2.multiply(t1, Qy)), // T0 * Qx - T1 * Qy
                F2.negate(t0), // -T0
                t1 // T1
            ])

            let t2 = F2.square(t1) // T1²
            let t3 = F2.multiply(t2, t1) // T2 * T1
            let t4 = F2.multiply(t2, Rx) // T2 * Rx
            let t5 = F2.add(
                F2.subtract(t3, F2.scale(t4, 2n)),
                F2.multiply(F2.square(t0), Rz)
            ) // T3 - 2 * T4 + T0² * Rz
            Rx = F2.multiply(t1, t5) // T1 * T5
            Ry = F2.subtract(
                F2.multiply(F2.subtract(t4, t5), t0),
                F2.multiply(t3, Ry)
            ) // (T4 - T5) * T0 - T3 * Ry
            Rz = F2.multiply(Rz, t3) // Rz * T3
        }
    }

    return res
}

const CURVEx = CURVE1.X

/**
 * @param {bigint} x
 * @param {number} i
 * @returns {number}
 */
function getBigIntBit(x, i) {
    return Number((x >> BigInt(i)) & 1n)
}

/**
 * @param {number} i
 * @returns {number}
 */
function getXBit(i) {
    return Number((CURVEx >> BigInt(i)) & 1n)
}

/**
 *
 * @param {[bigint, bigint]} a
 * @param {FieldElement6[]} bs
 */
export function millerLoopInternal([ax, ay], bs) {
    const Px = ax
    const Py = ay
    let res = F12.ONE

    for (let j = 0, i = 62; i >= 0; i--, j++) {
        const E = bs[j]

        res = F12.multiply(res, [
            [E[0], F2.scale(E[1], Px), [0n, 0n]],
            [[0n, 0n], F2.scale(E[2], Py), [0n, 0n]]
        ])

        if (getXBit(i)) {
            j += 1
            const F = bs[j]

            res = F12.multiply(res, [
                [F[0], F2.scale(F[1], Px), [0n, 0n]],
                [[0n, 0n], F2.scale(F[2], Py), [0n, 0n]]
            ])
        }

        if (i !== 0) {
            res = F12.square(res)
        }
    }

    return F12.conjugate(res)
}

/**
 * @param {FieldElement12} res
 * @returns {boolean}
 */
export function finalVerify(res) {
    const x = CURVEx

    let t0 = F12.divide(F12.powp(res, 6), res) // res^(p^6) / res
    let t1 = F12.multiply(F12.powp(t0, 2), t0) // t0^(p^2) * t0
    let t2 = cyclotomicPow(t1, x)
    let t3 = F12.multiply(F12.conjugate(cyclotomicSquare(t1)), t2)
    let t4 = cyclotomicPow(t3, x)
    let t5 = cyclotomicPow(t4, x)
    let t6 = F12.multiply(cyclotomicPow(t5, x), cyclotomicSquare(t2))
    let t7 = cyclotomicPow(t6, x)

    t2 = F12.powp(F12.multiply(t2, t5), 2)
    t4 = F12.powp(F12.multiply(t4, t1), 3)
    t6 = F12.powp(F12.multiply(t6, F12.conjugate(t1)), 1)
    t7 = F12.multiply(F12.multiply(t7, F12.conjugate(t3)), t1)

    // (t2 * t5)^(p^2) * (t4 * t1)^(q^2) * (t6 * t1.conj)^p * t7 * t3.conj * t1
    res = F12.multiply(F12.multiply(F12.multiply(t2, t4), t6), t7)

    return F12.equals(res, F12.ONE)
}

/**
 *
 * @param {FieldElement12} a
 * @returns {FieldElement12}
 */
function cyclotomicSquare([ax, ay]) {
    const [c0c0, c0c1, c0c2] = ax
    const [c1c0, c1c1, c1c2] = ay

    const [t3, t4] = F2.square2(c0c0, c1c1)
    const [t5, t6] = F2.square2(c1c0, c0c2)
    const [t7, t8] = F2.square2(c0c1, c1c2)

    let t9 = F2.multiplyu2(t8)

    return [
        [
            F2.add(F2.scale(F2.subtract(t3, c0c0), 2n), t3), // 2 * (T3 - c0c0)  + T3
            F2.add(F2.scale(F2.subtract(t5, c0c1), 2n), t5), // 2 * (T5 - c0c1)  + T5
            F2.add(F2.scale(F2.subtract(t7, c0c2), 2n), t7) // 2 * (T7 - c0c2)  + T7
        ],
        [
            F2.add(F2.scale(F2.add(t9, c1c0), 2n), t9), // 2 * (T9 + c1c0) + T9
            F2.add(F2.scale(F2.add(t4, c1c1), 2n), t4), // 2 * (T4 + c1c1) + T4
            F2.add(F2.scale(F2.add(t6, c1c2), 2n), t6) // 2 * (T6 + c1c2) + T6
        ]
    ]
}

/**
 * @param {FieldElement12} a
 * @param {bigint} n
 * @returns {FieldElement12}
 */
function cyclotomicPow(a, n) {
    let z = F12.ONE

    for (let i = 63; i >= 0; i--) {
        z = cyclotomicSquare(z)

        if (getBigIntBit(n, i)) {
            z = F12.multiply(z, a)
        }
    }

    return F12.conjugate(z)
}
