/**
 * @import { AnimState } from './anim-state.js'
 * @import { Vec2 } from '../../../core/math/vec2.js'
 */
/**
 * AnimBlendTrees are used to store and blend multiple {@link AnimNode}s together. BlendTrees can
 * be the child of other AnimBlendTrees, in order to create a hierarchy of AnimNodes. It takes a
 * blend type as an argument which defines which function should be used to determine the weights
 * of each of its children, based on the current parameter value.
 *
 * @category Animation
 */
export class AnimBlendTree extends AnimNode {
    /**
     * Create a new AnimBlendTree instance.
     *
     * @param {AnimState} state - The AnimState that this AnimBlendTree belongs to.
     * @param {AnimBlendTree|null} parent - The parent of the AnimBlendTree. If not null, the
     * AnimNode is stored as part of a {@link AnimBlendTree} hierarchy.
     * @param {string} name - The name of the BlendTree. Used when assigning an {@link AnimTrack}
     * to its children.
     * @param {number|Vec2} point - The coordinate/vector that's used to determine the weight of
     * this node when it's part of an {@link AnimBlendTree}.
     * @param {string[]} parameters - The anim component parameters which are used to calculate the
     * current weights of the blend trees children.
     * @param {object[]} children - The child nodes that this blend tree should create. Can either
     * be of type {@link AnimNode} or {@link AnimBlendTree}.
     * @param {boolean} syncAnimations - If true, the speed of each blended animation will be
     * synchronized.
     * @param {Function} createTree - Used to create child blend trees of varying types.
     * @param {Function} findParameter - Used at runtime to get the current parameter values.
     */
    constructor(state: AnimState, parent: AnimBlendTree | null, name: string, point: number | Vec2, parameters: string[], children: object[], syncAnimations: boolean, createTree: Function, findParameter: Function);
    _parameters: string[];
    _parameterValues: any[];
    _children: any[];
    _findParameter: Function;
    _syncAnimations: boolean;
    _pointCache: {};
    get weight(): any;
    get syncAnimations(): boolean;
    getChild(name: any): any;
    updateParameterValues(): boolean;
    getNodeWeightedDuration(i: any): number;
    getNodeCount(): number;
}
import { AnimNode } from './anim-node.js';
import type { AnimState } from './anim-state.js';
import type { Vec2 } from '../../../core/math/vec2.js';
