/**
 * Calculates simple hash value of a string. Designed for performance, not perfect.
 *
 * @param {string} str - String.
 * @returns {number} Hash value.
 */
export function hashCode(str: string): number;
/**
 * Calculates simple 32bit hash value of an array of 32bit integer numbers. Designed for
 * performance, but provides good distribution with small number of collisions. Based on
 * FNV-1a non-cryptographic hash function.
 *.
 * @param {number[]|Uint32Array} array - Array of 32bit integer numbers to hash.
 * @returns {number} 32bit unsigned integer hash value.
 */
export function hash32Fnv1a(array: number[] | Uint32Array): number;
