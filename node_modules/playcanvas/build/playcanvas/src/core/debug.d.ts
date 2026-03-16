/**
 * Engine debug log system. Note that the logging only executes in the debug build of the engine,
 * and is stripped out in other builds.
 */
export class Debug {
    /**
     * Set storing already logged messages, to only print each unique message one time.
     *
     * @type {Set<string>}
     * @private
     */
    private static _loggedMessages;
    /**
     * Deprecated warning message.
     *
     * @param {string} message - The message to log.
     */
    static deprecated(message: string): void;
    /**
     * Removed warning message.
     *
     * @param {string} message - The message to log.
     */
    static removed(message: string): void;
    /**
     * Assertion deprecated message. If the assertion is false, the deprecated message is written to the log.
     *
     * @param {boolean|object} assertion - The assertion to check.
     * @param {string} message - The message to log.
     */
    static assertDeprecated(assertion: boolean | object, message: string): void;
    /**
     * Assertion error message. If the assertion is false, the error message is written to the log.
     *
     * @param {boolean|object} assertion - The assertion to check.
     * @param {...*} args - The values to be written to the log.
     */
    static assert(assertion: boolean | object, ...args: any[]): void;
    /**
     * Assertion error message that writes an error message to the log if the object has already
     * been destroyed. To be used along setDestroyed.
     *
     * @param {object} object - The object to check.
     */
    static assertDestroyed(object: object): void;
    /**
     * Executes a function in debug mode only.
     *
     * @param {Function} func - Function to call.
     */
    static call(func: Function): void;
    /**
     * Info message.
     *
     * @param {...*} args - The values to be written to the log.
     */
    static log(...args: any[]): void;
    /**
     * Info message logged no more than once.
     *
     * @param {string} message - The message to log.
     * @param {...*} args - The values to be written to the log.
     */
    static logOnce(message: string, ...args: any[]): void;
    /**
     * Warning message.
     *
     * @param {...*} args - The values to be written to the log.
     */
    static warn(...args: any[]): void;
    /**
     * Warning message logged no more than once.
     *
     * @param {string} message - The message to log.
     * @param {...*} args - The values to be written to the log.
     */
    static warnOnce(message: string, ...args: any[]): void;
    /**
     * Error message.
     *
     * @param {...*} args - The values to be written to the log.
     */
    static error(...args: any[]): void;
    /**
     * Error message logged no more than once.
     *
     * @param {string} message - The message to log.
     * @param {...*} args - The values to be written to the log.
     */
    static errorOnce(message: string, ...args: any[]): void;
    /**
     * Trace message, which is logged to the console if the tracing for the channel is enabled
     *
     * @param {string} channel - The trace channel
     * @param {...*} args - The values to be written to the log.
     */
    static trace(channel: string, ...args: any[]): void;
}
/**
 * A helper debug functionality.
 */
export class DebugHelper {
    /**
     * Set a name to the name property of the object. Executes only in the debug build.
     *
     * @param {object} object - The object to assign the name to.
     * @param {string} name - The name to assign.
     */
    static setName(object: object, name: string): void;
    /**
     * Set a label to the label property of the object. Executes only in the debug build.
     *
     * @param {object} object - The object to assign the name to.
     * @param {string} label - The label to assign.
     */
    static setLabel(object: object, label: string): void;
    /**
     * Marks object as destroyed. Executes only in the debug build. To be used along assertDestroyed.
     *
     * @param {object} object - The object to mark as destroyed.
     */
    static setDestroyed(object: object): void;
}
