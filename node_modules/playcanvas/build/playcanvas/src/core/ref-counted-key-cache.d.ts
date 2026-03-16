/**
 * Class implementing reference counting cache for objects accessed by a key. Reference counting is
 * separate from the stored object.
 */
export class RefCountedKeyCache {
    /**
     * Map storing the cache. They key is a look up key for the object, the value is an instance
     * of the Entry class, which wraps the object with a reference count.
     *
     * {@type <object, Entry>}
     * @private
     */
    private cache;
    /**
     * Destroy all stored objects.
     */
    destroy(): void;
    /**
     * Clear the cache, without destroying the objects.
     */
    clear(): void;
    /**
     * Get the object from the cache with the given key, while incrementing the reference count. If
     * the object is not in the cache, returns null.
     *
     * @param {object} key - The key to look up the object.
     * @returns {object} The object, or null if not found.
     */
    get(key: object): object;
    /**
     * Put the object in the cache with the given key. The object cannot be in the cache already.
     * This sets its reference count to 1.
     *
     * @param {object} key - The key to store the object under.
     * @param {object} object - The object to store.
     */
    set(key: object, object: object): void;
    /**
     * Remove the object reference from the cache with the given key. If the reference count reaches
     * zero, the object is destroyed.
     *
     * @param {object} key - The key to remove the object under.
     */
    release(key: object): void;
}
