export namespace BitPacking {
    /**
     * Sets a value to specified bits of a number.
     *
     * @param {number} storage - Number to store the bits into.
     * @param {number} value - Value to store.
     * @param {number} shift - Number of bits to shift the value.
     * @param {number} [mask] - Mask for the value to limit the number of storage bits. Defaults to 1.
     * @returns {number} Returns the storage updated with the value.
     */
    function set(storage: number, value: number, shift: number, mask?: number): number;
    /**
     * Gets the value of specified bits from a number.
     *
     * @param {number} storage - Number to extract the bits from.
     * @param {number} shift - Number of bits to shift the mask.
     * @param {number} [mask] - Mask for the value to limit the number of storage bits. Defaults to 1.
     * @returns {number} Returns the extracted value.
     */
    function get(storage: number, shift: number, mask?: number): number;
    /**
     * Tests if all specified bits are set.
     *
     * @param {number} storage - Number to test.
     * @param {number} shift - Number of bits to shift the mask.
     * @param {number} [mask] - Mask to limit the number of storage bits. Defaults to 1.
     * @returns {boolean} Returns true if all bits in the mask are set in the storage.
     */
    function all(storage: number, shift: number, mask?: number): boolean;
    /**
     * Tests if any specified bits are set.
     *
     * @param {number} storage - Number to test.
     * @param {number} shift - Number of bits to shift the mask.
     * @param {number} [mask] - Mask to limit the number of storage bits. Defaults to 1.
     * @returns {boolean} Returns true if any bits in the mask are set in the storage.
     */
    function any(storage: number, shift: number, mask?: number): boolean;
}
