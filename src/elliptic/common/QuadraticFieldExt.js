/**
 * @template T
 * @typedef {import("./Field.js").Field<T>} Field
 */

/**
 * @template T
 * @typedef {import("./FieldWithOps.js").FieldWithOps<T>} FieldWithOps
 */

/**
 * Extends the scalar field analogously to how complex numbers extend real numbers
 * @template T
 * @implements {Field<[T, T]>}
 */
export class QuadraticFieldExt {
    /**
     * Field used for each component
     * @readonly
     * @type {FieldWithOps<T>}
     */
    F

    /**
     * We can always replace u^2 by this number (e.g. for complex numbers this is -1)
     * @readonly
     * @type {T}
     */
    U2

    /**
     * @param {FieldWithOps<T>} F applied to each part separately
     * @param {T} U2
     */
    constructor(F, U2) {
        this.F = F
        this.U2 = U2
    }

    /**
     * @type {[T, T]}
     */
    get ZERO() {
        return [this.F.ZERO, this.F.ZERO]
    }

    /**
     * @type {[T, T]}
     */
    get ONE() {
        return [this.F.ONE, this.F.ZERO]
    }

    /**
     * @param {[T, T]} a
     * @param {[T, T][]} b
     * @returns {[T, T]}
     */
    add([ax, ay], ...b) {
        const F = this.F
        return [
            F.add(ax, ...b.map((b) => b[0])),
            F.add(ay, ...b.map((b) => b[1]))
        ]
    }

    /**
     * @param {[T, T]} a
     * @param {bigint} s
     * @returns {[T, T]}
     */
    scale([ax, ay], s) {
        const F = this.F
        return [F.scale(ax, s), F.scale(ay, s)]
    }

    /**
     * @param {[T, T]} a
     * @param {[T, T]} b
     * @returns {[T, T]}
     */
    multiply([ax, ay], [bx, by]) {
        const F = this.F

        return [
            F.add(F.multiply(ax, bx), F.multiply(F.multiply(ay, by), this.U2)),
            F.add(F.multiply(ay, bx), F.multiply(by, ax))
        ]
    }

    /**
     * @param {[T, T]} a
     * @param {[T, T]} b
     * @returns {boolean}
     */
    equals([ax, ay], [bx, by]) {
        const F = this.F

        return F.equals(ax, bx) && F.equals(ay, by)
    }

    /**
     * Using the following formula we can derive the inverse of complex field element
     *   (ax + u*ay)*(ax - u*ay) = ax^2 - u^2*ay^2
     *   (ax + u*ay)^-1 = (ax - u*ay)/(ax^2 - u^2*ay^2)
     * @param {[T, T]} a
     * @returns {[T, T]}
     */
    invert([ax, ay]) {
        const F = this.F
        const f = F.invert(
            F.subtract(F.square(ax), F.multiply(F.square(ay), this.U2))
        )

        return [F.multiply(ax, f), F.multiply(ay, F.negate(f))]
    }
}
