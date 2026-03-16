/**
 * A Morph Target (also known as Blend Shape) contains deformation data to apply to existing mesh.
 * Multiple morph targets can be blended together on a mesh. This is useful for effects that are
 * hard to achieve with conventional animation and skinning.
 *
 * @category Graphics
 */
export class MorphTarget {
    /**
     * Create a new MorphTarget instance.
     *
     * @param {object} options - Object for passing optional arguments.
     * @param {ArrayBuffer} options.deltaPositions - An array of 3-dimensional vertex position
     * offsets.
     * @param {ArrayBuffer} [options.deltaNormals] - An array of 3-dimensional vertex normal
     * offsets.
     * @param {string} [options.name] - Name.
     * @param {BoundingBox} [options.aabb] - Bounding box. Will be automatically generated, if
     * undefined.
     * @param {number} [options.defaultWeight] - Default blend weight to use for this morph target.
     * @param {boolean} [options.preserveData] - When true, the morph target keeps its data passed using the options,
     * allowing the clone operation.
     */
    constructor(options: {
        deltaPositions: ArrayBuffer;
        deltaNormals?: ArrayBuffer;
        name?: string;
        aabb?: BoundingBox;
        defaultWeight?: number;
        preserveData?: boolean;
    }, ...args: any[]);
    /**
     * A used flag. A morph target can be used / owned by the Morph class only one time.
     *
     * @type {boolean}
     */
    used: boolean;
    options: {
        deltaPositions: ArrayBuffer;
        deltaNormals?: ArrayBuffer;
        name?: string;
        aabb?: BoundingBox;
        defaultWeight?: number;
        preserveData?: boolean;
    };
    _name: string;
    _defaultWeight: number;
    _aabb: BoundingBox;
    deltaPositions: ArrayBuffer;
    morphPositions: boolean;
    morphNormals: boolean;
    /**
     * Gets the name of the morph target.
     *
     * @type {string}
     */
    get name(): string;
    /**
     * Gets the default weight of the morph target.
     *
     * @type {number}
     */
    get defaultWeight(): number;
    get aabb(): BoundingBox;
    /**
     * Returns an identical copy of the specified morph target. This can only be used if the morph target
     * was created with options.preserveData set to true.
     *
     * @returns {MorphTarget} A morph target instance containing the result of the cloning.
     */
    clone(): MorphTarget;
    _postInit(): void;
}
import { BoundingBox } from '../core/shape/bounding-box.js';
