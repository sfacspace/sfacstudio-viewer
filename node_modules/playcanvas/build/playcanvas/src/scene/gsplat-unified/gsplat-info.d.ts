/**
 * @ignore
 */
export class GSplatInfo {
    /**
     * Create a new GSplatInfo.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatResourceBase} resource - The splat resource.
     * @param {GSplatPlacement} placement - The placement of the splat.
     */
    constructor(device: GraphicsDevice, resource: GSplatResourceBase, placement: GSplatPlacement);
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    /** @type {GSplatResourceBase} */
    resource: GSplatResourceBase;
    /** @type {GraphNode} */
    node: GraphNode;
    /** @type {number} */
    lodIndex: number;
    /** @type {number} */
    numSplats: number;
    /** @type {number} */
    activeSplats: number;
    /**
     * Array of intervals for remapping of indices, each two consecutive numbers represent
     * start and end of a range of splats.
     *
     * @type {number[]}
     */
    intervals: number[];
    /** @type {number} */
    lineStart: number;
    /** @type {number} */
    lineCount: number;
    /** @type {number} */
    padding: number;
    /** @type {Vec4} */
    viewport: Vec4;
    /** @type {Mat4} */
    previousWorldTransform: Mat4;
    /** @type {BoundingBox} */
    aabb: BoundingBox;
    /**
     * Manager for the intervals texture generation
     *
     * @type {GSplatIntervalTexture|null}
     */
    intervalTexture: GSplatIntervalTexture | null;
    /** @type {number} */
    colorAccumulatedRotation: number;
    /** @type {number} */
    colorAccumulatedTranslation: number;
    destroy(): void;
    setLines(start: any, count: any, textureSize: any, activeSplats: any): void;
    /**
     * Updates the flattened intervals array and GPU texture from placement intervals.
     *
     * @param {Map<number, Vec2>} intervals - Map of node index to inclusive [x, y] intervals.
     */
    updateIntervals(intervals: Map<number, Vec2>): void;
    update(): boolean;
    resetColorAccumulators(colorUpdateAngle: any, colorUpdateDistance: any): void;
    get hasSphericalHarmonics(): boolean;
}
import type { GraphicsDevice } from "../../platform/graphics/graphics-device.js";
import type { GSplatResourceBase } from "../gsplat/gsplat-resource-base.js";
import type { GraphNode } from '../graph-node.js';
import { Vec4 } from '../../core/math/vec4.js';
import { Mat4 } from '../../core/math/mat4.js';
import { BoundingBox } from '../../core/shape/bounding-box.js';
import { GSplatIntervalTexture } from './gsplat-interval-texture.js';
import type { Vec2 } from '../../core/math/vec2.js';
import type { GSplatPlacement } from "./gsplat-placement.js";
