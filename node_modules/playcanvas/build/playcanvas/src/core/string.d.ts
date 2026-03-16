export namespace string {
    export { ASCII_LOWERCASE };
    export { ASCII_UPPERCASE };
    export { ASCII_LETTERS };
    /**
     * Return a string with \{n\} replaced with the n-th argument.
     *
     * @param {string} s - The string to format.
     * @param {...*} args - All other arguments are substituted into the string.
     * @returns {string} The formatted string.
     * @example
     * const s = pc.string.format("Hello {0}", "world");
     * console.log(s); // Prints "Hello world"
     */
    export function format(s: string, ...args: any[]): string;
    /**
     * Get the code point number for a character in a string. Polyfill for
     * [`codePointAt`]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt}.
     *
     * @param {string} string - The string to get the code point from.
     * @param {number} [i] - The index in the string.
     * @returns {number} The code point value for the character in the string.
     */
    export function getCodePoint(string: string, i?: number): number;
    /**
     * Gets an array of all code points in a string.
     *
     * @param {string} string - The string to get code points from.
     * @returns {number[]} The code points in the string.
     */
    export function getCodePoints(string: string): number[];
    /**
     * Gets an array of all grapheme clusters (visible symbols) in a string. This is needed because
     * some symbols (such as emoji or accented characters) are actually made up of multiple
     * character codes. See {@link https://mathiasbynens.be/notes/javascript-unicode here} for more
     * info.
     *
     * @param {string} string - The string to break into symbols.
     * @returns {string[]} The symbols in the string.
     */
    export function getSymbols(string: string): string[];
    /**
     * Get the string for a given code point or set of code points. Polyfill for
     * [`fromCodePoint`]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint}.
     *
     * @param {...number} args - The code points to convert to a string.
     * @returns {string} The converted string.
     * @ignore
     */
    export function fromCodePoint(...args: number[]): string;
}
declare const ASCII_LOWERCASE: "abcdefghijklmnopqrstuvwxyz";
declare const ASCII_UPPERCASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
declare const ASCII_LETTERS: string;
export {};
