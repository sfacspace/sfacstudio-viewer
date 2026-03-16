/**
 * Holds mesh batching settings and a unique id. Created via {@link BatchManager#addGroup}.
 *
 * @category Graphics
 */
export class BatchGroup {
    static MODEL: string;
    static ELEMENT: string;
    static SPRITE: string;
    static RENDER: string;
    /**
     * Create a new BatchGroup instance.
     *
     * @param {number} id - Unique id. Can be assigned to model, render and element components.
     * @param {string} name - The name of the group.
     * @param {boolean} dynamic - Whether objects within this batch group should support
     * transforming at runtime.
     * @param {number} maxAabbSize - Maximum size of any dimension of a bounding box around batched
     * objects. {@link BatchManager#prepare} will split objects into local groups based on this
     * size.
     * @param {number[]} [layers] - Layer ID array. Default is [{@link LAYERID_WORLD}]. The whole
     * batch group will belong to these layers. Layers of source models will be ignored.
     */
    constructor(id: number, name: string, dynamic: boolean, maxAabbSize: number, layers?: number[]);
    /** @private */
    private _ui;
    /** @private */
    private _sprite;
    /** @private */
    private _obj;
    /**
     * Unique id. Can be assigned to model, render and element components.
     *
     * @type {number}
     */
    id: number;
    /**
     * Name of the group.
     *
     * @type {string}
     */
    name: string;
    /**
     * Whether objects within this batch group should support transforming at runtime.
     *
     * @type {boolean}
     */
    dynamic: boolean;
    /**
     * Maximum size of any dimension of a bounding box around batched objects.
     * {@link BatchManager#prepare} will split objects into local groups based on this size.
     *
     * @type {number}
     */
    maxAabbSize: number;
    /**
     * Layer ID array. Default is [{@link LAYERID_WORLD}]. The whole batch group will belong to
     * these layers. Layers of source models will be ignored.
     *
     * @type {number[]}
     */
    layers: number[];
}
