/**
 * Base class that implements reference counting for objects.
 */
export class RefCountedObject {
    /**
     * @type {number}
     * @private
     */
    private _refCount;
    /**
     * Increments the reference counter.
     */
    incRefCount(): void;
    /**
     * Decrements the reference counter.
     */
    decRefCount(): void;
    /**
     * Gets the current reference count.
     *
     * @type {number}
     */
    get refCount(): number;
}
