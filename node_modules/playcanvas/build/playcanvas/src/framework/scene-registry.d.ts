/**
 * Callback used by {@link SceneRegistry#loadSceneHierarchy}.
 */
export type LoadHierarchyCallback = (err: string | null, entity?: Entity) => void;
/**
 * Callback used by {@link SceneRegistry#loadSceneSettings}.
 */
export type LoadSettingsCallback = (err: string | null) => void;
/**
 * Callback used by {@link SceneRegistry#changeScene}.
 */
export type ChangeSceneCallback = (err: string | null, entity?: Entity) => void;
/**
 * Callback used by {@link SceneRegistry#loadScene}.
 */
export type LoadSceneCallback = (err: string | null, entity?: Entity) => void;
/**
 * Callback used by {@link SceneRegistry#loadSceneData}.
 */
export type LoadSceneDataCallback = (err: string | null, sceneItem?: SceneRegistryItem) => void;
/**
 * @import { AppBase } from './app-base.js'
 * @import { Entity } from './entity.js'
 */
/**
 * @callback LoadHierarchyCallback
 * Callback used by {@link SceneRegistry#loadSceneHierarchy}.
 * @param {string|null} err - The error message in the case where the loading or parsing fails.
 * @param {Entity} [entity] - The loaded root entity if no errors were encountered.
 * @returns {void}
 */
/**
 * @callback LoadSettingsCallback
 * Callback used by {@link SceneRegistry#loadSceneSettings}.
 * @param {string|null} err - The error message in the case where the loading or parsing fails.
 * @returns {void}
 */
/**
 * @callback ChangeSceneCallback
 * Callback used by {@link SceneRegistry#changeScene}.
 * @param {string|null} err - The error message in the case where the loading or parsing fails.
 * @param {Entity} [entity] - The loaded root entity if no errors were encountered.
 * @returns {void}
 */
/**
 * @callback LoadSceneCallback
 * Callback used by {@link SceneRegistry#loadScene}.
 * @param {string|null} err - The error message in the case where the loading or parsing fails.
 * @param {Entity} [entity] - The loaded root entity if no errors were encountered.
 * @returns {void}
 */
/**
 * @callback LoadSceneDataCallback
 * Callback used by {@link SceneRegistry#loadSceneData}.
 * @param {string|null} err - The error message in the case where the loading or parsing fails.
 * @param {SceneRegistryItem} [sceneItem] - The scene registry item if no errors were encountered.
 * @returns {void}
 */
/**
 * Container for storing and loading of scenes. An instance of the registry is created on the
 * {@link AppBase} object as {@link AppBase#scenes}.
 *
 * @category Graphics
 */
export class SceneRegistry {
    /**
     * Create a new SceneRegistry instance.
     *
     * @param {AppBase} app - The application.
     */
    constructor(app: AppBase);
    /**
     * @type {AppBase}
     * @private
     */
    private _app;
    /**
     * @type {SceneRegistryItem[]}
     * @private
     */
    private _list;
    /** @private */
    private _index;
    /** @private */
    private _urlIndex;
    /** @ignore */
    destroy(): void;
    /**
     * Return the list of scene.
     *
     * @returns {SceneRegistryItem[]} All items in the registry.
     */
    list(): SceneRegistryItem[];
    /**
     * Add a new item to the scene registry.
     *
     * @param {string} name - The name of the scene.
     * @param {string} url - The url of the scene file.
     * @returns {boolean} Returns true if the scene was successfully added to the registry, false otherwise.
     */
    add(name: string, url: string): boolean;
    /**
     * Find a Scene by name and return the {@link SceneRegistryItem}.
     *
     * @param {string} name - The name of the scene.
     * @returns {SceneRegistryItem|null} The stored data about a scene or null if no scene with
     * that name exists.
     */
    find(name: string): SceneRegistryItem | null;
    /**
     * Find a scene by the URL and return the {@link SceneRegistryItem}.
     *
     * @param {string} url - The URL to search by.
     * @returns {SceneRegistryItem|null} The stored data about a scene or null if no scene with
     * that URL exists.
     */
    findByUrl(url: string): SceneRegistryItem | null;
    /**
     * Remove an item from the scene registry.
     *
     * @param {string} name - The name of the scene.
     */
    remove(name: string): void;
    /**
     * Private function to load scene data with the option to cache. This allows us to retain
     * expected behavior of loadSceneSettings and loadSceneHierarchy where they don't store loaded
     * data which may be undesired behavior with projects that have many scenes.
     *
     * @param {SceneRegistryItem | string} sceneItem - The scene item (which can be found with
     * {@link SceneRegistry#find}, URL of the scene file (e.g."scene_id.json") or name of the scene.
     * @param {boolean} storeInCache - Whether to store the loaded data in the scene item.
     * @param {LoadSceneDataCallback} callback - The function to call after loading,
     * passed (err, sceneItem) where err is null if no errors occurred.
     * @private
     */
    private _loadSceneData;
    /**
     * Loads and stores the scene data to reduce the number of the network requests when the same
     * scenes are loaded multiple times. Can also be used to load data before calling
     * {@link SceneRegistry#loadSceneHierarchy} and {@link SceneRegistry#loadSceneSettings} to make
     * scene loading quicker for the user.
     *
     * @param {SceneRegistryItem | string} sceneItem - The scene item (which can be found with
     * {@link SceneRegistry#find}, URL of the scene file (e.g."scene_id.json") or name of the scene.
     * @param {LoadSceneDataCallback} callback - The function to call after loading,
     * passed (err, sceneItem) where err is null if no errors occurred.
     * @example
     * const sceneItem = app.scenes.find("Scene Name");
     * app.scenes.loadSceneData(sceneItem, (err, sceneItem) => {
     *     if (err) {
     *         // error
     *     }
     * });
     */
    loadSceneData(sceneItem: SceneRegistryItem | string, callback: LoadSceneDataCallback): void;
    /**
     * Unloads scene data that has been loaded previously using {@link SceneRegistry#loadSceneData}.
     *
     * @param {SceneRegistryItem | string} sceneItem - The scene item (which can be found with
     * {@link SceneRegistry#find} or URL of the scene file. Usually this will be "scene_id.json".
     * @example
     * const sceneItem = app.scenes.find("Scene Name");
     * app.scenes.unloadSceneData(sceneItem);
     */
    unloadSceneData(sceneItem: SceneRegistryItem | string): void;
    _loadSceneHierarchy(sceneItem: any, onBeforeAddHierarchy: any, callback: any): void;
    /**
     * Load a scene file, create and initialize the Entity hierarchy and add the hierarchy to the
     * application root Entity.
     *
     * @param {SceneRegistryItem | string} sceneItem - The scene item (which can be found with
     * {@link SceneRegistry#find}, URL of the scene file (e.g."scene_id.json") or name of the scene.
     * @param {LoadHierarchyCallback} callback - The function to call after loading,
     * passed (err, entity) where err is null if no errors occurred.
     * @example
     * const sceneItem = app.scenes.find("Scene Name");
     * app.scenes.loadSceneHierarchy(sceneItem, (err, entity) => {
     *     if (!err) {
     *         const e = app.root.find("My New Entity");
     *     } else {
     *         // error
     *     }
     * });
     */
    loadSceneHierarchy(sceneItem: SceneRegistryItem | string, callback: LoadHierarchyCallback): void;
    /**
     * Load a scene file and apply the scene settings to the current scene.
     *
     * @param {SceneRegistryItem | string} sceneItem - The scene item (which can be found with
     * {@link SceneRegistry#find}, URL of the scene file (e.g."scene_id.json") or name of the scene.
     * @param {LoadSettingsCallback} callback - The function called after the settings
     * are applied. Passed (err) where err is null if no error occurred.
     * @example
     * const sceneItem = app.scenes.find("Scene Name");
     * app.scenes.loadSceneSettings(sceneItem, (err) => {
     *     if (!err) {
     *         // success
     *     } else {
     *         // error
     *     }
     * });
     */
    loadSceneSettings(sceneItem: SceneRegistryItem | string, callback: LoadSettingsCallback): void;
    /**
     * Change to a new scene. Calling this function will load the scene data, delete all
     * entities and graph nodes under `app.root` and load the scene settings and hierarchy.
     *
     * @param {SceneRegistryItem | string} sceneItem - The scene item (which can be found with
     * {@link SceneRegistry#find}, URL of the scene file (e.g."scene_id.json") or name of the scene.
     * @param {ChangeSceneCallback} [callback] - The function to call after loading,
     * passed (err, entity) where err is null if no errors occurred.
     * @example
     * app.scenes.changeScene("Scene Name", (err, entity) => {
     *     if (!err) {
     *         // success
     *     } else {
     *         // error
     *     }
     * });
     */
    changeScene(sceneItem: SceneRegistryItem | string, callback?: ChangeSceneCallback): void;
    /**
     * Load the scene hierarchy and scene settings. This is an internal method used by the
     * {@link AppBase}.
     *
     * @param {string} url - The URL of the scene file.
     * @param {LoadSceneCallback} callback - The function called after the settings are
     * applied. Passed (err, scene) where err is null if no error occurred and scene is the
     * {@link Scene}.
     */
    loadScene(url: string, callback: LoadSceneCallback): void;
}
import type { Entity } from './entity.js';
import { SceneRegistryItem } from './scene-registry-item.js';
import type { AppBase } from './app-base.js';
