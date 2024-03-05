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
