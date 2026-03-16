/**
 * Class implementing reference counting cache for objects. The objects itself is used as the key.
 * If you need a reference counted cache for objects accessed by a key, use
 * {@link RefCountedKeyCache}.
 */
export class RefCountedCache {
    /**
     * The cache. The key is the object being stored in the cache. The value is ref count of the
     * object. When that reaches zero, destroy function on the object gets called and object is
     * removed from the cache.
     *
     * @type {Map<object, number>}
     */
    cache: Map<object, number>;
    /**
     * Destroy all stored objects.
     */
    destroy(): void;
    /**
     * Add object reference to the cache.
     *
     * @param {object} object - The object to add.
     */
    incRef(object: object): void;
    /**
     * Remove object reference from the cache.
     *
     * @param {object} object - The object to remove.
     */
    decRef(object: object): void;
}
