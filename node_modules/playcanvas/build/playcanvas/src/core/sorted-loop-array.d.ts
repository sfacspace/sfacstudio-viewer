/**
 * Helper class used to hold an array of items in a specific order. This array is safe to modify
 * while we loop through it. The class assumes that it holds objects that need to be sorted based
 * on one of their fields.
 *
 * @ignore
 */
export class SortedLoopArray {
    /**
     * Create a new SortedLoopArray instance.
     *
     * @param {object} args - Arguments.
     * @param {string} args.sortBy - The name of the field that each element in the array is going
     * to be sorted by.
     * @example
     * const array = new pc.SortedLoopArray({ sortBy: 'priority' });
     * array.insert(item); // adds item to the right slot based on item.priority
     * array.append(item); // adds item to the end of the array
     * array.remove(item); // removes item from array
     * for (array.loopIndex = 0; array.loopIndex < array.length; array.loopIndex++) {
     *   // do things with array elements
     *   // safe to remove and add elements into the array while looping
     * }
     */
    constructor(args: {
        sortBy: string;
    });
    /**
     * The internal array that holds the actual array elements.
     *
     * @type {object[]}
     */
    items: object[];
    /**
     * The number of elements in the array.
     *
     * @type {number}
     */
    length: number;
    /**
     * The current index used to loop through the array. This gets modified if we add or remove
     * elements from the array while looping. See the example to see how to loop through this
     * array.
     *
     * @type {number}
     */
    loopIndex: number;
    /** @private */
    private _sortBy;
    /** @private */
    private _sortHandler;
    /**
     * Searches for the right spot to insert the specified item.
     *
     * @param {object} item - The item.
     * @returns {number} The index where to insert the item.
     * @private
     */
    private _binarySearch;
    _doSort(a: any, b: any): number;
    /**
     * Inserts the specified item into the array at the right index based on the 'sortBy' field
     * passed into the constructor. This also adjusts the loopIndex accordingly.
     *
     * @param {object} item - The item to insert.
     */
    insert(item: object): void;
    /**
     * Appends the specified item to the end of the array. Faster than insert() as it does not
     * binary search for the right index. This also adjusts the loopIndex accordingly.
     *
     * @param {object} item - The item to append.
     */
    append(item: object): void;
    /**
     * Removes the specified item from the array.
     *
     * @param {object} item - The item to remove.
     */
    remove(item: object): void;
    /**
     * Sorts elements in the array based on the 'sortBy' field passed into the constructor. This
     * also updates the loopIndex if we are currently looping.
     *
     * WARNING: Be careful if you are sorting while iterating because if after sorting the array
     * element that you are currently processing is moved behind other elements then you might end
     * up iterating over elements more than once!
     */
    sort(): void;
}
