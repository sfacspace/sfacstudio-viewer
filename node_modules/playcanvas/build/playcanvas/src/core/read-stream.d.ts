/**
 * Helper class for organized reading of memory.
 *
 * @ignore
 */
export class ReadStream {
    /**
     * @param {ArrayBuffer} arraybuffer - The buffer to read from.
     */
    constructor(arraybuffer: ArrayBuffer);
    /** @type {ArrayBuffer} */
    arraybuffer: ArrayBuffer;
    /** @type {DataView} */
    dataView: DataView;
    /** @type {number} */
    offset: number;
    /**
     * The number of bytes remaining to be read.
     *
     * @type {number}
     */
    get remainingBytes(): number;
    /**
     * Resets the offset to a given value. If no value is given, the offset is reset to 0.
     *
     * @param {number} offset - The new offset.
     */
    reset(offset?: number): void;
    /**
     * Skips a number of bytes.
     *
     * @param {number} bytes - The number of bytes to skip.
     */
    skip(bytes: number): void;
    /**
     * Aligns the offset to a multiple of a number of bytes.
     *
     * @param {number} bytes - The number of bytes to align to.
     */
    align(bytes: number): void;
    /**
     * Increments the offset by the specified number of bytes and returns the previous offset.
     *
     * @param {number} amount - The number of bytes to increment by.
     * @returns {number} The previous offset.
     * @private
     */
    private _inc;
    /**
     * Reads a single character.
     *
     * @returns {string} The character.
     */
    readChar(): string;
    /**
     * Reads a string of a given length.
     *
     * @param {number} numChars - The number of characters to read.
     * @returns {string} The string.
     */
    readChars(numChars: number): string;
    /**
     * Read an unsigned 8-bit integer.
     *
     * @returns {number} The integer.
     */
    readU8(): number;
    /**
     * Read an unsigned 16-bit integer.
     *
     * @returns {number} The integer.
     */
    readU16(): number;
    /**
     * Read an unsigned 32-bit integer.
     *
     * @returns {number} The integer.
     */
    readU32(): number;
    /**
     * Read an unsigned 64-bit integer.
     *
     * @returns {number} The integer.
     */
    readU64(): number;
    /**
     * Read a big endian unsigned 32-bit integer.
     *
     * @returns {number} The integer.
     */
    readU32be(): number;
    /**
     * Read unsigned 8-bit integers into an array.
     *
     * @param {number[]} result - The array to read into.
     */
    readArray(result: number[]): void;
    /**
     * Read a line of text from the stream.
     *
     * @returns {string} The line of text.
     */
    readLine(): string;
}
