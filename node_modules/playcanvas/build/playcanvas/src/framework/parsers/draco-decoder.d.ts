/**
 * Initialize the Draco mesh decoder.
 *
 * @param {object} [config] - The Draco decoder configuration.
 * @param {string} [config.jsUrl] - URL of glue script.
 * @param {string} [config.wasmUrl] - URL of the wasm module.
 * @param {number} [config.numWorkers] - Number of workers to use for decoding (default is 1).
 * @param {boolean} [config.lazyInit] - Wait for first decode request before initializing workers
 * (default is false). Otherwise initialize workers immediately.
 */
export function dracoInitialize(config?: {
    jsUrl?: string;
    wasmUrl?: string;
    numWorkers?: number;
    lazyInit?: boolean;
}): void;
/**
 * Enqueue a buffer for decoding.
 *
 * @param {ArrayBuffer} buffer - The draco data to decode.
 * @param {Function} callback - Callback function to receive decoded result.
 * @returns {boolean} True if the draco worker was initialized and false otherwise.
 */
export function dracoDecode(buffer: ArrayBuffer, callback: Function): boolean;
