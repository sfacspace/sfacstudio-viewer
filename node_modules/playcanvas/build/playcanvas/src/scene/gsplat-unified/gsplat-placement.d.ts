/**
 * @import { GraphNode } from '../graph-node.js'
 * @import { GSplatResource } from '../gsplat/gsplat-resource.js'
 * @import { GSplatOctreeResource } from './gsplat-octree.resource.js'
 * @import { Vec2 } from '../../core/math/vec2.js'
 */
/**
 * Class representing a placement of a gsplat resource.
 *
 * @ignore
 */
export class GSplatPlacement {
    /**
     * Create a new GSplatPlacement.
     *
     * @param {GSplatResource|null} resource - The resource of the splat.
     * @param {GraphNode} node - The node that the gsplat is linked to.
     * @param {number} lodIndex - The LOD index for this placement.
     */
    constructor(resource: GSplatResource | null, node: GraphNode, lodIndex?: number);
    /**
     * The resource of the splat..
     *
     * @type {GSplatResource|GSplatOctreeResource|null}
     */
    resource: GSplatResource | GSplatOctreeResource | null;
    /**
     * The node that the gsplat is linked to.
     *
     * @type {GraphNode}
     */
    node: GraphNode;
    /**
     * Map of intervals for octree nodes using this placement.
     * Key is octree node index, value is Vec2 representing start and end index (inclusive).
     *
     * @type {Map<number, Vec2>}
     */
    intervals: Map<number, Vec2>;
    /**
     * The LOD index for this placement.
     *
     * @type {number}
     */
    lodIndex: number;
    /**
     * LOD distance thresholds for octree-based gsplat. Only used when the
     * resource is an octree resource; otherwise ignored and kept null.
     *
     * @type {number[]|null}
     */
    _lodDistances: number[] | null;
    /**
     * Target number of splats to render for this placement. Set to 0 to disable (default).
     *
     * @type {number}
     */
    splatBudget: number;
    /**
     * The axis-aligned bounding box for this placement, in local space.
     *
     * @type {BoundingBox}
     */
    _aabb: BoundingBox;
    set aabb(aabb: BoundingBox);
    get aabb(): BoundingBox;
    /**
     * Sets LOD distance thresholds. Only applicable for octree resources. The provided array is
     * copied. If the resource has an octree with N LOD levels, the array should contain N-1
     * elements. For non-octree resources, the value is ignored and kept null.
     *
     * @type {number[]|null}
     */
    set lodDistances(distances: number[] | null);
    /**
     * Gets a copy of LOD distance thresholds, or null when not set.
     *
     * @type {number[]|null}
     */
    get lodDistances(): number[] | null;
}
import type { GSplatResource } from '../gsplat/gsplat-resource.js';
import type { GSplatOctreeResource } from './gsplat-octree.resource.js';
import type { GraphNode } from '../graph-node.js';
import type { Vec2 } from '../../core/math/vec2.js';
import { BoundingBox } from '../../core/shape/bounding-box.js';
