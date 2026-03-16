/**
 * Represents a skeleton used to play animations.
 *
 * @category Animation
 */
export class Skeleton {
    /**
     * Create a new Skeleton instance.
     *
     * @param {GraphNode} graph - The root {@link GraphNode} of the skeleton.
     */
    constructor(graph: GraphNode);
    /**
     * Determines whether skeleton is looping its animation.
     *
     * @type {boolean}
     */
    looping: boolean;
    /**
     * @type {Animation}
     * @private
     */
    private _animation;
    _time: number;
    _interpolatedKeys: any[];
    _interpolatedKeyDict: {};
    _currKeyIndices: {};
    graph: GraphNode;
    /**
     * Sets the animation on the skeleton.
     *
     * @type {Animation}
     */
    set animation(value: Animation);
    /**
     * Gets the animation on the skeleton.
     *
     * @type {Animation}
     */
    get animation(): Animation;
    /**
     * Sets the current time of the currently active animation in seconds. This value is between
     * zero and the duration of the animation.
     *
     * @type {number}
     */
    set currentTime(value: number);
    /**
     * Gets the current time of the currently active animation in seconds.
     *
     * @type {number}
     */
    get currentTime(): number;
    /**
     * Gets the number of nodes in the skeleton.
     *
     * @type {number}
     */
    get numNodes(): number;
    /**
     * Progresses the animation assigned to the specified skeleton by the supplied time delta. If
     * the delta takes the animation passed its end point, if the skeleton is set to loop, the
     * animation will continue from the beginning. Otherwise, the animation's current time will
     * remain at its duration (i.e. the end).
     *
     * @param {number} delta - The time in seconds to progress the skeleton's animation.
     */
    addTime(delta: number): void;
    /**
     * Blends two skeletons together.
     *
     * @param {Skeleton} skel1 - Skeleton holding the first pose to be blended.
     * @param {Skeleton} skel2 - Skeleton holding the second pose to be blended.
     * @param {number} alpha - The value controlling the interpolation in relation to the two input
     * skeletons. The value is in the range 0 to 1, 0 generating skel1, 1 generating skel2 and
     * anything in between generating a spherical interpolation between the two.
     */
    blend(skel1: Skeleton, skel2: Skeleton, alpha: number): void;
    /**
     * Links a skeleton to a node hierarchy. The nodes animated skeleton are then subsequently used
     * to drive the local transformation matrices of the node hierarchy.
     *
     * @param {GraphNode} graph - The root node of the graph that the skeleton is to drive.
     */
    setGraph(graph: GraphNode): void;
    /**
     * Synchronizes the currently linked node hierarchy with the current state of the skeleton.
     * Internally, this function converts the interpolated keyframe at each node in the skeleton
     * into the local transformation matrix at each corresponding node in the linked node
     * hierarchy.
     */
    updateGraph(): void;
}
import type { GraphNode } from '../graph-node.js';
import type { Animation } from './animation.js';
