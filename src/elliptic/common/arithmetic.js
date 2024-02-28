/**
 * Positive modulo operator
 * @param {bigint} x
 * @param {bigint} modulo
 * @returns {bigint}
 */
export function mod(x, modulo) {
    const res = x % modulo

    if (res < 0n) {
        return res + modulo
    } else {
        return res
    }
}

/**
 * Invert a number on a field (i.e. calculate n^-1 so that n*n^-1 = 1)
 * This is an expensive iterative procedure that is only guaranteed to converge if the modulo is a prime number
 * @param {bigint} n
 * @param {bigint} m modulo
 * @returns {bigint}
 */
export function invert(n, m) {
    let a = mod(n, m)
    let b = m

    let x = 0n
    let y = 1n
    let u = 1n
    let v = 0n

    while (a !== 0n) {
        const q = b / a
        const r = b % a
        const m = x - u * q
        const n = y - v * q
        b = a
        a = r
        x = u
        y = v
        u = m
        v = n
    }

    return mod(x, m)
}

/**
 * Modular exponent
 * TODO: would a non-recursive version of this algorithm be faster?
 * @param {bigint} base base
 * @param {bigint} power exponent
 * @param {bigint} modulo
 * @returns {bigint}
 */
export function exp(base, power, modulo) {
    if (power == 0n) {
        return 1n
    } else {
        let t = exp(base, power / 2n, modulo)
        t = (t * t) % modulo

        if (power % 2n != 0n) {
            t = mod(t * base, modulo)
        }

        return t
    }
}
