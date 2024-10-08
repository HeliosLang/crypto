// Decimal representations of large numbers because that's most common in literature

// curve prime, 2^256−2^32−977, so 256 bits are needed to encode a coordinate, so 257 bits are needed to encoded a compressed point
//  round up to word size this becomes 264 bits, or 33 bytes
export const P =
    115792089237316195423570985008687907853269984665640564039457584007908834671663n

// Curve scale order, prime <= max number of unique points on curve
export const N =
    115792089237316195423570985008687907852837564279074904382605163141518161494337n

// Generator point
export const G = {
    x: 55066263022277343669578718895168534326250603453777594175500187360389116729240n,
    y: 32670510020758816978083085130507043184471273380659243275938904335757337482424n
}

// pre-calculated for slightly faster sqrt when decoding a point (P + 1n)/4n
export const P14 =
    28948022309329048855892746252171976963317496166410141009864396001977208667916n
