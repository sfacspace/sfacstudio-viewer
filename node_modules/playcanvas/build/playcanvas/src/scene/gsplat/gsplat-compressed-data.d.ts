export class GSplatCompressedData {
    numSplats: any;
    /**
     * File header comments.
     *
     * @type { string[] }
     */
    comments: string[];
    /**
     * Contains either 12 or 18 floats per chunk:
     *      min_x, min_y, min_z,
     *      max_x, max_y, max_z,
     *      min_scale_x, min_scale_y, min_scale_z,
     *      max_scale_x, max_scale_y, max_scale_z
     *      min_r, min_g, min_b,
     *      max_r, max_g, max_b
     * @type {Float32Array}
     */
    chunkData: Float32Array;
    /**
     * Contains 4 uint32 per vertex:
     *      packed_position
     *      packed_rotation
     *      packed_scale
     *      packed_color
     * @type {Uint32Array}
     */
    vertexData: Uint32Array;
    /**
     * Contains optional quantized spherical harmonic data.
     * @type {Uint8Array}
     */
    shData0: Uint8Array;
    /**
     * Contains optional quantized spherical harmonic data.
     * @type {Uint8Array}
     */
    shData1: Uint8Array;
    /**
     * Contains optional quantized spherical harmonic data.
     * @type {Uint8Array}
     */
    shData2: Uint8Array;
    /**
     * Contains the number of bands of spherical harmonics data.
     * @type {number}
     */
    shBands: number;
    /**
     * Create an iterator for accessing splat data
     *
     * @param {Vec3|null} [p] - the vector to receive splat position
     * @param {Quat|null} [r] - the quaternion to receive splat rotation
     * @param {Vec3|null} [s] - the vector to receive splat scale
     * @param {Vec4|null} [c] - the vector to receive splat color
     * @param {Float32Array|null} [sh] - the array to receive spherical harmonics data
     * @returns {SplatCompressedIterator} - The iterator
     */
    createIter(p?: Vec3 | null, r?: Quat | null, s?: Vec3 | null, c?: Vec4 | null, sh?: Float32Array | null): SplatCompressedIterator;
    /**
     * Calculate pessimistic scene aabb taking into account splat size. This is faster than
     * calculating an exact aabb.
     *
     * @param {BoundingBox} result - Where to store the resulting bounding box.
     * @returns {boolean} - Whether the calculation was successful.
     */
    calcAabb(result: BoundingBox): boolean;
    /**
     * Returns a new Float32Array of centers (x, y, z per splat).
     * @returns {Float32Array} Centers buffer
     */
    getCenters(): Float32Array;
    getChunks(result: any): void;
    /**
     * @param {Vec3} result - The result.
     */
    calcFocalPoint(result: Vec3): void;
    get isCompressed(): boolean;
    get numChunks(): number;
    get chunkSize(): number;
    decompress(): GSplatData;
}
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import { Vec4 } from '../../core/math/vec4.js';
declare class SplatCompressedIterator {
    constructor(gsplatData: any, p: any, r: any, s: any, c: any, sh: any);
    read: (i: any) => void;
}
import type { BoundingBox } from '../../core/shape/bounding-box.js';
import { GSplatData } from './gsplat-data.js';
export {};
