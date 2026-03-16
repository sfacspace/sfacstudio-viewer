/**
 * Base class for GSplat asset loaders. This provides the interface that all
 * GSplat asset loaders must implement.
 *
 * @category Asset
 * @ignore
 */
export class GSplatAssetLoaderBase {
    /**
     * Initiates loading of a gsplat asset. This is a fire-and-forget operation that starts
     * the loading process.
     *
     * @param {string} url - The URL of the gsplat file to load.
     * @abstract
     */
    load(url: string): void;
    /**
     * Unloads an asset that was previously loaded by this loader.
     *
     * @param {string} url - The URL of the asset to unload.
     * @abstract
     */
    unload(url: string): void;
    /**
     * Gets the resource for a given URL if it has been loaded by this loader.
     *
     * @param {string} url - The URL of the asset to retrieve the resource from.
     * @returns {object|undefined} The loaded resource if found and loaded, undefined otherwise.
     * @abstract
     */
    getResource(url: string): object | undefined;
    /**
     * Destroys the loader and cleans up any resources it holds.
     *
     * @abstract
     */
    destroy(): void;
}
