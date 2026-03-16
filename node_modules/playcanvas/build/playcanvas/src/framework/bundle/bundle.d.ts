/**
 * Represents the resource of a Bundle Asset, which contains an index that maps URLs to DataViews.
 *
 * @ignore
 */
export class Bundle extends EventHandler {
    /**
     * Fired when a file has been added to a Bundle.
     *
     * @event
     * @example
     * bundle.on("add", (url, data) => {
     *     console.log("file added: " + url);
     * });
     */
    static EVENT_ADD: string;
    /**
     * Fired when all files of a Bundle has been loaded.
     *
     * @event
     * @example
     * bundle.on("load", () => {
     *     console.log("All Bundle files has been loaded");
     * });
     */
    static EVENT_LOAD: string;
    /**
     * Index of file url to to DataView.
     * @type {Map<string, DataView>}
     * @private
     */
    private _index;
    /**
     * If Bundle has all files loaded.
     * @type {boolean}
     * @private
     */
    private _loaded;
    /**
     * Add file to a Bundle.
     *
     * @param {string} url - A url of a file.
     * @param {DataView} data - A DataView of a file.
     * @ignore
     */
    addFile(url: string, data: DataView): void;
    /**
     * Returns true if the specified URL exists in the loaded bundle.
     *
     * @param {string} url - The original file URL. Make sure you have called decodeURIComponent on
     * the URL first.
     * @returns {boolean} True of false.
     */
    has(url: string): boolean;
    /**
     * Returns a DataView for the specified URL.
     *
     * @param {string} url - The original file URL. Make sure you have called decodeURIComponent on
     * the URL first.
     * @returns {DataView|null} A DataView.
     */
    get(url: string): DataView | null;
    /**
     * Destroys the bundle.
     */
    destroy(): void;
    /**
     * True if all files of a Bundle are loaded.
     * @type {boolean}
     */
    set loaded(value: boolean);
    get loaded(): boolean;
}
import { EventHandler } from '../../core/event-handler.js';
