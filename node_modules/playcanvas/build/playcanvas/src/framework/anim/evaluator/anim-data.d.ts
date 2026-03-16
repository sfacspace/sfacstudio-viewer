/**
 * Wraps a set of data used in animation.
 *
 * @category Animation
 */
export class AnimData {
    /**
     * Create a new animation AnimData instance.
     *
     * @param {number} components - Specifies how many components make up an element of data. For
     * example, specify 3 for a set of 3-dimensional vectors. The number of elements in data array
     * must be a multiple of components.
     * @param {Float32Array|number[]} data - The set of data.
     */
    constructor(components: number, data: Float32Array | number[]);
    _components: number;
    _data: number[] | Float32Array<ArrayBufferLike>;
    /**
     * Gets the number of components that make up an element.
     *
     * @type {number}
     */
    get components(): number;
    /**
     * Gets the data.
     *
     * @type {Float32Array|number[]}
     */
    get data(): Float32Array | number[];
}
