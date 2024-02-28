# crypto

Cryptography primitives used throughout the HeliosLang codebase:

  * bech32
  * blake2b
  * ECDSASecp256k1
  * Ed25519
  * hmac
  * hmacDrbg
  * keccak_256
  * pbkdf2
  * sha2_256
  * sha2_512
  * sha3_256
  * SchnorrSecp256k1

Advantages of this library:
  
  * No dependencies (not even on the SubtleCrypto/NodeJSCrypto builtins for sha2 hashing)
  * Each implementation has been chosen to be as easy to audit as possible (sometimes compromising algorithm speed)

Disadvantage of this library:

  * Not the fastest (but mostly good enough)

## Timing attack resistance

Note: other side-channel attacks might be possible, but this library is not intended to be used in any other environments than browsers and servers.

### Signatures

Any method involving private keys should be resistant to timing attacks. Although no special effort was made to make any of this library constant time, the calculation time of elliptic signing algorithms are dominated by the point multiplication using a private random number `k` used in the first part of each signature (Ed25519, ECDSASecp256k1 and SchnorrSecp256k1). The unpredictable amount of time needed for the first part of the signature, it is impossible to determine the time needed for the multiplication involving the private key in the second part of each signature. So even we are able to time the signing without any noise, we wouldn't be able to find out anything about the private key.

### Zero-knowledge

TBD