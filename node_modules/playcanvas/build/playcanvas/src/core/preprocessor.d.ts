/**
 * Pure static class implementing subset of C-style preprocessor.
 * inspired by: https://github.com/dcodeIO/Preprocessor.js
 */
export class Preprocessor {
    static sourceName: any;
    /**
     * Run c-like preprocessor on the source code, and resolves the code based on the defines and ifdefs
     *
     * @param {string} source - The source code to work on.
     * @param {Map<string, string>} [includes] - A map containing key-value pairs of include names
     * and their content. These are used for resolving #include directives in the source.
     * @param {object} [options] - Optional parameters.
     * @param {boolean} [options.stripUnusedColorAttachments] - If true, strips unused color attachments.
     * @param {boolean} [options.stripDefines] - If true, strips all defines from the source.
     * @param {string} [options.sourceName] - The name of the source file.
     * @returns {string|null} Returns preprocessed source code, or null in case of error.
     */
    static run(source: string, includes?: Map<string, string>, options?: {
        stripUnusedColorAttachments?: boolean;
        stripDefines?: boolean;
        sourceName?: string;
    }): string | null;
    static stripUnusedColorAttachments(source: any, options: any): any;
    static stripComments(source: any): any;
    static processArraySize(source: any, intDefines: any): any;
    static injectDefines(source: any, injectDefines: any): any;
    static RemoveEmptyLines(source: any): any;
    /**
     * Process source code, and resolves the code based on the defines and ifdefs.
     *
     * @param {string} source - The source code to work on.
     * @param {Map<string, string>} defines - Supplied defines which are used in addition to those
     * defined in the source code. Maps a define name to its value. Note that the map is modified
     * by the function.
     * @param {Map<string, string>} injectDefines - An object to collect defines that are to be
     * replaced with their values.
     * @param {Map<string, string>} [includes] - An object containing key-value pairs of include names and their
     * content.
     * @param {boolean} [stripDefines] - If true, strips all defines from the source.
     * @returns {string|null} Returns preprocessed source code, or null if failed.
     */
    static _preprocess(source: string, defines: Map<string, string>, injectDefines: Map<string, string>, includes?: Map<string, string>, stripDefines?: boolean): string | null;
    static _keep(stack: any): boolean;
    /**
     * Evaluates a single atomic expression, which can be:
     * - `defined(EXPRESSION)` or `!defined(EXPRESSION)`
     * - Comparisons such as `A == B`, `A != B`, `A > B`, etc.
     * - Simple checks for the existence of a define.
     *
     * @param {string} expr - The atomic expression to evaluate.
     * @param {Map<string, string>} defines - A map containing key-value pairs of defines.
     * @returns {object} Returns an object containing the result of the evaluation and an error flag.
     */
    static evaluateAtomicExpression(expr: string, defines: Map<string, string>): object;
    /**
     * Processes parentheses in an expression by recursively evaluating subexpressions.
     * Ignores parentheses that are part of defined() calls.
     *
     * @param {string} expression - The expression to process.
     * @param {Map<string, string>} defines - A map containing key-value pairs of defines.
     * @returns {object} Returns an object containing the processed expression and an error flag.
     */
    static processParentheses(expression: string, defines: Map<string, string>): object;
    /**
     * Evaluates a complex expression with support for `defined`, `!defined`, comparisons, `&&`,
     * `||`, and parentheses for precedence.
     *
     * @param {string} expression - The expression to evaluate.
     * @param {Map<string, string>} defines - A map containing key-value pairs of defines.
     * @returns {object} Returns an object containing the result of the evaluation and an error flag.
     */
    static evaluate(expression: string, defines: Map<string, string>): object;
}
