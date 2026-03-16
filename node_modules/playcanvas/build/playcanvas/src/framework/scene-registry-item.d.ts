/**
 * Item to be stored in the {@link SceneRegistry}.
 *
 * @category Graphics
 */
export class SceneRegistryItem {
    /**
     * Creates a new SceneRegistryItem instance.
     *
     * @param {string} name - The name of the scene.
     * @param {string} url - The url of the scene file.
     */
    constructor(name: string, url: string);
    /**
     * The name of the scene.
     *
     * @type {string}
     */
    name: string;
    /**
     * The url of the scene file.
     *
     * @type {string}
     */
    url: string;
    /** @ignore */
    data: any;
    /** @private */
    private _loading;
    /** @private */
    private _onLoadedCallbacks;
    /**
     * Returns true if the scene data has loaded.
     *
     * @type {boolean}
     */
    get loaded(): boolean;
    /**
     * Returns true if the scene data is still being loaded.
     *
     * @type {boolean}
     */
    get loading(): boolean;
}
