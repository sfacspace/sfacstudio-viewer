export class SceneUtils {
    /**
     * Loads the scene JSON file from a URL.
     *
     * @param {string} url - URL to scene JSON.
     * @param {number} maxRetries - Number of http load retry attempts.
     * @param {Function} callback - The callback to the JSON file is loaded.
     */
    static load(url: string, maxRetries: number, callback: Function): void;
}
