// Decimal representations of large numbers because that's most common in literature

// Curve coordinate prime number.
// 255 bits so last bit can instead be used to encode sign
//   (i.e. 32 byte compressed format for points which is neede by publicKey and first part of signature)
//  operations on point coordinates are modulo P
export const P =
    57896044618658097711785492504343953926634992332820282019728792003956564819949n // ipowi(255n) - 19n, hence 25519

// A prime number that is <= the number of unique points on the curve
//  operations on point multiplication factors are modulo N
export const N =
    7237005577332262213973186563042994240857116359379907606001950938285454250989n // ipow2(252n) + 27742317777372353535851937790883648493n;

// d parameter of affine twisted Edwards curve
//  The formula for the twisted Edwards curve is:
//    -x^2 + y^2 = 1 - d*x^2*y^2
// Note: the negative number is already included in this parameter
export const D =
    -4513249062541557337682894930092624173785641285191125241628941591882900924598840740n // -121665n/121666n == -121665n * invert(121666n)

// Generator point
export const Gx =
    15112221349535400772501151409588531511454012693041857206046113283949847762202n // recovered from Gy
export const Gy =
    46316835694926478169428394003475163141307993866256225615783033603165251855960n // (4n*invert(5n)) % P

// pre-calculated coefficients for slightly faster sqrt when decoding a point
//  (P + 3n)/8n
export const P38 =
    7237005577332262213973186563042994240829374041602535252466099000494570602494n
//  exp(2n, (P - 1n)/4n, P)
export const SQRT2P14 =
    19681161376707505956807079304988542015446066515923890162744021073123829784752n
