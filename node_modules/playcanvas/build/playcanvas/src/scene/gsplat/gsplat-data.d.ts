export class GSplatData {
    /**
     * @param {BoundingBox} result - Bounding box instance holding calculated result.
     * @param {Vec3} p - The splat position
     * @param {Quat} r - The splat rotation
     * @param {Vec3} s - The splat scale
     */
    static calcSplatAabb(result: BoundingBox, p: Vec3, r: Quat, s: Vec3): void;
    /**
     * @param {PlyElement[]} elements - The elements.
     * @param {string[]} comments - File header comments.
     */
    constructor(elements: PlyElement[], comments?: string[]);
    /** @type {PlyElement[]} */
    elements: PlyElement[];
    numSplats: number;
    /**
     * File header comments.
     *
     * @type { string[] }
     */
    comments: string[];
    getProp(name: any, elementName?: string): import("../../framework/parsers/ply.js").DataType;
    getElement(name: any): PlyElement;
    addProp(name: any, storage: any): void;
    /**
     * Create an iterator for accessing splat data
     *
     * @param {Vec3|null} [p] - the vector to receive splat position
     * @param {Quat|null} [r] - the quaternion to receive splat rotation
     * @param {Vec3|null} [s] - the vector to receive splat scale
     * @param {Vec4|null} [c] - the vector to receive splat color
     * @returns {SplatIterator} - The iterator
     */
    createIter(p?: Vec3 | null, r?: Quat | null, s?: Vec3 | null, c?: Vec4 | null): SplatIterator;
    /**
     * Calculate pessimistic scene aabb taking into account splat size. This is faster than
     * calculating an exact aabb.
     *
     * @param {BoundingBox} result - Where to store the resulting bounding box.
     * @param {(i: number) => boolean} [pred] - Optional predicate function to filter splats.
     * @returns {boolean} - Whether the calculation was successful.
     */
    calcAabb(result: BoundingBox, pred?: (i: number) => boolean): boolean;
    /**
     * Calculate exact scene aabb taking into account splat size
     *
     * @param {BoundingBox} result - Where to store the resulting bounding box.
     * @param {(i: number) => boolean} [pred] - Optional predicate function to filter splats.
     * @returns {boolean} - Whether the calculation was successful.
     */
    calcAabbExact(result: BoundingBox, pred?: (i: number) => boolean): boolean;
    /**
     * Returns a new Float32Array of centers (x, y, z per splat).
     * @returns {Float32Array} Centers buffer
     */
    getCenters(): Float32Array;
    /**
     * @param {Vec3} result - The result.
     * @param {Function} [pred] - Predicate given index for skipping.
     */
    calcFocalPoint(result: Vec3, pred?: Function): void;
    /**
     * @param {Scene} scene - The application's scene.
     * @param {Mat4} worldMat - The world matrix.
     */
    renderWireframeBounds(scene: Scene, worldMat: Mat4): void;
    get isCompressed(): boolean;
    get shBands(): any;
    calcMortonOrder(): Uint32Array<ArrayBuffer>;
    reorder(order: any): void;
    reorderData(): void;
}
import type { PlyElement } from '../../framework/parsers/ply.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import type { Vec4 } from '../../core/math/vec4.js';
declare class SplatIterator {
    constructor(gsplatData: any, p: any, r: any, s: any, c: any);
    read: (i: any) => void;
}
import { BoundingBox } from '../../core/shape/bounding-box.js';
import type { Scene } from '../scene.js';
import { Mat4 } from '../../core/math/mat4.js';
export {};
