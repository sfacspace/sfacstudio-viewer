/**
 * Callback used by {@link WasmModule.setConfig}.
 */
export type ModuleErrorCallback = (error: string) => void;
/**
 * Callback used by {@link WasmModule.getInstance}.
 */
export type ModuleInstanceCallback = (moduleInstance: any) => void;
/**
 * @callback ModuleErrorCallback
 * Callback used by {@link WasmModule.setConfig}.
 * @param {string} error - If the instance fails to load this will contain a description of the error.
 * @returns {void}
 */
/**
 * @callback ModuleInstanceCallback
 * Callback used by {@link WasmModule.getInstance}.
 * @param {any} moduleInstance - The module instance.
 * @returns {void}
 */
/**
 * A pure static utility class which supports immediate and lazy loading of
 * [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) modules. Note that you can
 * load WebAssembly modules even before instantiating your {@link AppBase} instance.
 *
 * This class is generally only needed if you are developing against the Engine directly. Editor
 * projects automatically load WebAssembly modules included in the project's assets.
 *
 * Do not use this class to load the Basis WebAssembly module. Instead, please refer to
 * {@link basisInitialize}.
 *
 * @example
 * // Load the Ammo.js physics engine
 * pc.WasmModule.setConfig('Ammo', {
 *     glueUrl: `ammo.wasm.js`,
 *     wasmUrl: `ammo.wasm.wasm`,
 *     fallbackUrl: `ammo.js`
 * });
 * await new Promise((resolve) => {
 *     pc.WasmModule.getInstance('Ammo', () => resolve());
 * });
 */
export class WasmModule {
    /**
     * Set a wasm module's configuration.
     *
     * @param {string} moduleName - Name of the module.
     * @param {object} [config] - The configuration object.
     * @param {string} [config.glueUrl] - URL of glue script.
     * @param {string} [config.wasmUrl] - URL of the wasm script.
     * @param {string} [config.fallbackUrl] - URL of the fallback script to use when wasm modules
     * aren't supported.
     * @param {number} [config.numWorkers] - For modules running on worker threads, the number of
     * threads to use. Default value is based on module implementation.
     * @param {ModuleErrorCallback} [config.errorHandler] - Function to be called if the module fails
     * to download.
     */
    static setConfig(moduleName: string, config?: {
        glueUrl?: string;
        wasmUrl?: string;
        fallbackUrl?: string;
        numWorkers?: number;
        errorHandler?: ModuleErrorCallback;
    }): void;
    /**
     * Get a wasm module's configuration.
     *
     * @param {string} moduleName - Name of the module.
     * @returns {object | undefined} The previously set configuration.
     */
    static getConfig(moduleName: string): object | undefined;
    /**
     * Get a wasm module instance. The instance will be created if necessary and returned
     * in the second parameter to callback.
     *
     * @param {string} moduleName - Name of the module.
     * @param {ModuleInstanceCallback} callback - The function called when the instance is
     * available.
     */
    static getInstance(moduleName: string, callback: ModuleInstanceCallback): void;
}
