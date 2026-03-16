/**
 * An Animation contains the data that defines how a {@link Skeleton} animates over time. The
 * Animation contains an array of {@link AnimationNode}s, where each AnimationNode targets a
 * specific {@link GraphNode} referenced by a {@link Skeleton}.
 *
 * An Animation can be played back by an {@link AnimationComponent}.
 *
 * @category Animation
 */
export class Animation {
    /**
     * Human-readable name of the animation.
     *
     * @type {string}
     */
    name: string;
    /**
     * Duration of the animation in seconds.
     *
     * @type {number}
     */
    duration: number;
    _nodes: any[];
    _nodeDict: {};
    /**
     * Gets a {@link AnimationNode} by name.
     *
     * @param {string} name - The name of the {@link AnimationNode}.
     * @returns {AnimationNode} The {@link AnimationNode} with the specified name.
     */
    getNode(name: string): AnimationNode;
    /**
     * Adds a node to the internal nodes array.
     *
     * @param {AnimationNode} node - The node to add.
     */
    addNode(node: AnimationNode): void;
    /**
     * A read-only property to get array of animation nodes.
     *
     * @type {AnimationNode[]}
     */
    get nodes(): AnimationNode[];
}
export class AnimationKey {
    constructor(time: any, position: any, rotation: any, scale: any);
    time: any;
    position: any;
    rotation: any;
    scale: any;
}
/**
 * AnimationNode represents an array of keyframes that animate the transform of a {@link GraphNode}
 * over time. Typically, an {@link Animation} maintains a collection of AnimationNodes, one for
 * each GraphNode in a {@link Skeleton}.
 *
 * @category Animation
 */
export class AnimationNode {
    _name: string;
    _keys: any[];
}
