import { CURVE1 } from "../constants.js"
import {
    projectedCurve1 as G1,
    projectedCurve2 as G2
} from "../curves/index.js"
import { F1, F2 } from "../fields/index.js"
import {
    ISOGENY_COEFFICIENTS_G1,
    ISOGENY_COEFFICIENTS_G2
} from "./constants.js"
import { hashToField } from "./hashToField.js"

/**
 * @template T
 * @typedef {import("../../common/index.js").FieldWithOpsI<T>} FieldWithOpsI
 */
/**
 * @template T
 * @typedef {import("../../common/index.js").Point2<T>} Point2
 */

/**
 * @template T
 * @typedef {import("../../common/index.js").Point3<T>} Point3
 */

/**
 * See: https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-11#appendix-G.2.1
 * @param {bigint} u
 * @returns {[bigint, bigint]}
 */
function map_to_curve_simple_swu_3mod4(u) {
    const A =
        0x144698a3b8e9433d693a02c96d4982b0ea985383ee66a8d8e8981aefd881ac98936f8da0e0f97f5cf428082d584c1dn
    const B =
        0x12e2908d11688030018b12e8753eee3b2016c1f0f24f4070a0b9c14fcef35ef55a23215a316ceaa5d1cc48e98e172be0n
    const Z = 11n
    const c1 = (CURVE1.P - 3n) / 4n

    const c2 = F1.sqrt(F1.pow(F1.negate(Z), 3n))
    const tv1 = F1.square(u)
    const tv3 = F1.multiply(Z, tv1)
    let xDen = F1.add(F1.square(tv3), tv3)
    // X
    const xNum1 = F1.multiply(F1.add(xDen, F1.ONE), B)
    const xNum2 = F1.multiply(tv3, xNum1)
    xDen = F1.multiply(F1.negate(A), xDen)
    if (F1.isZero(xDen)) {
        xDen = F1.multiply(A, Z)
    }

    let tv2 = F1.square(xDen)
    const gxd = F1.multiply(tv2, xDen)
    tv2 = F1.multiply(A, tv2)

    let gx1 = F1.multiply(F1.add(F1.square(xNum1), tv2), xNum1)
    tv2 = F1.multiply(B, gxd)
    gx1 = F1.add(gx1, tv2)
    tv2 = F1.multiply(gx1, gxd)
    const tv4 = F1.multiply(F1.square(gxd), tv2)
    // Y
    const y1 = F1.multiply(F1.pow(tv4, c1), tv2)
    const y2 = F1.multiply(F1.multiply(F1.multiply(y1, c2), tv1), u)
    let xNum, yPos

    // y1^2 * gxd == gx1
    if (F1.equals(F1.multiply(F1.square(y1), gxd), gx1)) {
        xNum = xNum1
        yPos = y1
    } else {
        xNum = xNum2
        yPos = y2
    }
    const yNeg = F1.negate(yPos)
    const y = u % 2n == yPos % 2n ? yPos : yNeg

    const x = F1.divide(xNum, xDen)
    return [x, y]
}

/**
 * See: https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-11#appendix-G.2.3
 * @param {[bigint, bigint]} t
 * @returns {Point2<[bigint, bigint]>}
 */
export function map_to_curve_simple_swu_9mod16(t) {
    /**
     * @type {[bigint, bigint]}
     */
    const iso_3_a = [0n, 240n]

    /**
     * @type {[bigint, bigint]}
     */
    const iso_3_b = [1012n, 1012n]

    /**
     * @type {[bigint, bigint]}
     */
    const iso_3_z = [-2n, -1n]

    const t2 = F2.pow(t, 2n)
    const iso_3_z_t2 = F2.multiply(iso_3_z, t2)
    const ztzt = F2.add(iso_3_z_t2, F2.pow(iso_3_z_t2, 2n)) // (Z * t² + Z² * t⁴)
    let denominator = F2.negate(F2.multiply(iso_3_a, ztzt)) // -a(Z * t² + Z² * t⁴)
    let numerator = F2.multiply(iso_3_b, F2.add(ztzt, F2.ONE)) // b(Z * t² + Z² * t⁴ + 1)

    if (F2.isZero(denominator)) {
        denominator = F2.multiply(iso_3_z, iso_3_a)
    }

    // v = D³
    let v = F2.pow(denominator, 3n)
    // u = N³ + a * N * D² + b * D³
    let u = F2.add(
        F2.pow(numerator, 3n),
        F2.multiply(F2.multiply(iso_3_a, numerator), F2.pow(denominator, 2n)),
        F2.multiply(iso_3_b, v)
    )

    // Attempt y = sqrt(u / v)
    const gamma = F2.gamma(u, v)
    const rof = F2.rootOfUnity(u, v, gamma)

    // Handle case where (u / v) is not square
    // sqrt_candidate(x1) = sqrt_candidate(x0) * t³
    const sqrtCandidateX1 = F2.multiply(gamma, F2.pow(t, 3n))

    // u(x1) = Z³ * t⁶ * u(x0)
    u = F2.multiply(F2.pow(iso_3_z_t2, 3n), u)
    const eta = F2.eta(u, v, sqrtCandidateX1)

    let y = eta ?? rof

    if (!y) {
        throw new Error("Hash to Curve - Optimized SWU failure")
    }

    if (eta) {
        numerator = F2.multiply(numerator, iso_3_z_t2)
    }

    if (F2.sign(t) !== F2.sign(y)) {
        y = F2.negate(y)
    }

    const x = F2.divide(numerator, denominator)

    return {
        x,
        y
    }
}

/**
 * @param {number[]} msg
 * @param {number[]} dst domain specific tag
 * @returns {Point3<bigint>}
 */
export function hashToG1(msg, dst) {
    const [[u0], [u1]] = hashToField(msg, dst, 2, 1)
    const [x0, y0] = map_to_curve_simple_swu_3mod4(u0)
    const [x1, y1] = map_to_curve_simple_swu_3mod4(u1)
    const point2 = G1.toAffine(
        G1.add(G1.fromAffine({ x: x0, y: y0 }), G1.fromAffine({ x: x1, y: y1 }))
    )
    const point3 = isogenyMapG1(point2)

    return G1.clearCofactor(G1.fromAffine(point3))
}

/**
 * @param {number[]} msg
 * @param {number[]} dst domain specific tag
 * @returns {Point3<[bigint, bigint]>}
 */
export function hashToG2(msg, dst) {
    const [[u0, u1], [v0, v1]] = hashToField(msg, dst, 2, 2)

    const point0 = map_to_curve_simple_swu_9mod16([u0, u1])
    const point1 = map_to_curve_simple_swu_9mod16([v0, v1])

    // TODO: can get rid of affine here?
    const point2 = G2.toAffine(
        G2.add(G2.fromAffine(point0), G2.fromAffine(point1))
    )

    const point3 = isogenyMapG2(point2)
    return G2.clearCofactor(G2.fromAffine(point3))
}

/**
 * @param {Point2<bigint>} point
 * @returns {Point2<bigint>}
 */
function isogenyMapG1(point) {
    return isogenyMap(F1, ISOGENY_COEFFICIENTS_G1, point)
}

/**
 * @param {Point2<[bigint, bigint]>} point
 * @returns {Point2<[bigint, bigint]>}
 */
function isogenyMapG2(point) {
    return isogenyMap(F2, ISOGENY_COEFFICIENTS_G2, point)
}

/**
 * @template T
 * @param {FieldWithOpsI<T>} F
 * @param {[T[], T[], T[], T[]]} coeffs
 * @param {Point2<T>} point
 * @returns {Point2<T>}
 */
function isogenyMap(F, coeffs, { x, y }) {
    const [xNum, xDen, yNum, yDen] = coeffs.map((val) =>
        val.reduce((acc, i) => F.add(F.multiply(acc, x), i))
    )

    x = F.divide(xNum, xDen)
    y = F.multiply(y, F.divide(yNum, yDen))

    return { x, y }
}
