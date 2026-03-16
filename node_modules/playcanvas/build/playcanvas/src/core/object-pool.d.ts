/**
 * A pool of reusable objects of the same type. Designed to promote reuse of objects to reduce
 * garbage collection.
 *
 * @template {new (...args: any[]) => any} T
 * @ignore
 */
export class ObjectPool<T extends new (...args: any[]) => any> {
    /**
     * @param {T} constructorFunc - The constructor function for the
     * objects in the pool.
     * @param {number} size - The initial number of object instances to allocate.
     */
    constructor(constructorFunc: T, size: number);
    /**
     * The constructor function for the objects in the pool.
     *
     * @type {new (...args: any[]) => any}
     * @private
     */
    private _constructor;
    /**
     * Array of object instances.
     *
     * @type {InstanceType<T>[]}
     * @private
     */
    private _pool;
    /**
     * The number of object instances that are currently allocated.
     *
     * @type {number}
     * @private
     */
    private _count;
    /**
     * @param {number} size - The number of object instances to allocate.
     * @private
     */
    private _resize;
    /**
     * Returns an object instance from the pool. If no instances are available, the pool will be
     * doubled in size and a new instance will be returned.
     *
     * @returns {InstanceType<T>} An object instance from the pool.
     */
    allocate(): InstanceType<T>;
    /**
     * All object instances in the pool will be available again. The pool itself will not be
     * resized.
     */
    freeAll(): void;
}
