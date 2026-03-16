/**
 * Reconstruct original object field names in a compressed scene.
 */
export class Decompress {
    /**
     * Create a new Decompress instance.
     *
     * @param {object} node - The current node of the object being decompressed, initially the
     * 'entities' field of a scene.
     * @param {object} data - Compression metadata.
     */
    constructor(node: object, data: object);
    _node: any;
    _data: any;
    run(): any;
    _result: any;
    _handleMap(): void;
    _handleKey(origKey: any): void;
    _handleArray(): void;
    _handleArElt(elt: any): void;
}
