/**
 * A ordered list-type data structure that can provide item look up by key and can also return a list.
 *
 * @ignore
 */
export class IndexedList {
    /**
     * @type {object[]}
     * @private
     */
    private _list;
    /**
     * @type {Object<string, number>}
     * @private
     */
    private _index;
    /**
     * Add a new item into the list with a index key.
     *
     * @param {string} key - Key used to look up item in index.
     * @param {object} item - Item to be stored.
     */
    push(key: string, item: object): void;
    /**
     * Test whether a key has been added to the index.
     *
     * @param {string} key - The key to test.
     * @returns {boolean} Returns true if key is in the index, false if not.
     */
    has(key: string): boolean;
    /**
     * Return the item indexed by a key.
     *
     * @param {string} key - The key of the item to retrieve.
     * @returns {object|null} The item stored at key. Returns null if key is not in the index.
     */
    get(key: string): object | null;
    /**
     * Remove the item indexed by key from the list.
     *
     * @param {string} key - The key at which to remove the item.
     * @returns {boolean} Returns true if the key exists and an item was removed, returns false if
     * no item was removed.
     */
    remove(key: string): boolean;
    /**
     * Returns the list of items.
     *
     * @returns {object[]} The list of items.
     */
    list(): object[];
    /**
     * Remove all items from the list.
     */
    clear(): void;
}
