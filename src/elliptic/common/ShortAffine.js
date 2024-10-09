import { CurveWithOps } from "./CurveWithOps.js"
import { FieldWithOps } from "./FieldWithOps.js"

/**
 * @template T
 * @typedef {import("./Curve.js").Curve<T>} Curve
 */

/**
 * @template T
 * @typedef {import("./Field.js").Field<T>} Field
 */

/**
 * @template T
 * @typedef {import("./Point2.js").Point2<T>} Point2
 */

/**
 * Short weierstrass curve using the simple affine formulation
 *   Y^2 = X^3 + (a*X) + b
 * Currently all the relevant elliptic curves for Cardano use a==0, so this is also simplified here
 *   Y^2 = X^3 + b
 * @template T bigint, [bigint, bigint] etc.
 * @implements {Curve<Point2<T>>}
 */
class ShortAffineInternal {
    /**
     * @readonly
     * @type {FieldWithOps<T>}
     */
    F

    /**
     * Coefficient of curve formula
     * @readonly
     * @type {T}
     */
    b

    /**
     * @param {Field<T>} F
     * @param {T} b
     */
    constructor(F, b) {
        this.F = new FieldWithOps(F)
        this.b = b
    }

    /**
     * @type {Point2<T>}
     */
    get ZERO() {
        return { x: this.F.ZERO, y: this.F.ONE }
    }

    /**
     * Check that the elliptic equation for Secp256k1 holds:
     *   `y^2 === x^3 + b`
     * @param {Point2<T>} point
     * @returns {boolean}
     */
    isValidPoint(point) {
        if (this.equals(point, this.ZERO)) {
            return true
        } else {
            const F = this.F
            const { x, y } = point

            const lhs = F.square(y)

            const x3 = F.cube(x)
            const rhs = F.add(x3, this.b)

            return F.equals(lhs, rhs)
        }
    }

    /**
     * @param {Point2<T>} a
     * @returns {Point2<T>}
     */
    negate(a) {
        if (this.equals(this.ZERO, a)) {
            return a
        } else {
            return {
                x: a.x,
                y: this.F.scale(a.y, -1n)
            }
        }
    }

    /**
     * @param {Point2<T>} a
     * @param {Point2<T>} b
     * @returns {boolean}
     */
    equals(a, b) {
        const F = this.F

        return F.equals(a.x, b.x) && F.equals(a.y, b.y)
    }

    /**
     * Taken from https://bitcoin.stackexchange.com/questions/119860/how-to-convert-the-results-of-point-doubling-rx1-and-ry1-to-point-addition-rx
     * @param {Point2<T>} point
     * @returns {Point2<T>}
     */
    double(point) {
        if (this.equals(point, this.ZERO)) {
            return point
        } else {
            const F = this.F
            const { x, y } = point

            const tx = F.scale(x, 2n)
            const ty = F.scale(y, 2n)

            const x2 = F.square(x)
            const tyi = F.invert(ty)

            const s = F.multiply(F.scale(x2, 3n), tyi)
            const s2 = F.square(s)

            const nx = F.subtract(s2, tx)
            const ny = F.subtract(F.multiply(s, F.subtract(x, nx)), y)

            return { x: nx, y: ny }
        }
    }

    /**
     * Taken from https://bitcoin.stackexchange.com/questions/119860/how-to-convert-the-results-of-point-doubling-rx1-and-ry1-to-point-addition-rx
     * @param {Point2<T>} a
     * @param {Point2<T>} b
     * @returns {Point2<T>}
     */
    add(a, b) {
        const F = this.F

        if (this.equals(a, b)) {
            // a + a = 2a
            return this.double(a)
        } else if (this.equals(this.negate(a), b)) {
            // a + (-a) = O
            return this.ZERO
        } else if (F.add(a.x, b.x) === 0n) {
            // a + b = O
            return this.ZERO
        } else if (this.equals(a, this.ZERO)) {
            // 0 + b = b
            return b
        } else if (this.equals(b, this.ZERO)) {
            // a + 0 = a
            return a
        }

        const dx = F.subtract(a.x, b.x)
        const dy = F.subtract(a.y, b.y)
        const s = F.multiply(dy, F.invert(dx))
        const s2 = F.square(s)

        const nx = F.subtract(F.subtract(s2, a.x), b.x)
        const ny = F.subtract(F.multiply(s, F.subtract(a.x, nx)), a.y)

        return { x: nx, y: ny }
    }
}
/**
 * @template T
 * @extends {CurveWithOps<Point2<T>, ShortAffineInternal<T>>}
 */
export class ShortAffine extends CurveWithOps {
    /**
     * @param {Field<T>} F
     * @param {T} b
     */
    constructor(F, b) {
        super(new ShortAffineInternal(F, b))
    }

    /**
     * @type {T}
     */
    get b() {
        return this.curve.b
    }

    /**
     * This method makes it easier to swap out the affine curve for the projected curve
     * @param {Point2<T>} point
     * @returns {Point2<T>}
     */
    toAffine(point) {
        return point
    }

    /**
     * This method makes it easier to swap out the affine curve for the projected curve
     * @param {Point2<T>} point
     * @returns {Point2<T>}
     */
    fromAffine(point) {
        return point
    }
}
