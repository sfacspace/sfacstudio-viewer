/**
 * @import { AnimController } from './anim-controller.js'
 */
/**
 * Defines a single state that the controller can be in. Each state contains either a single
 * {@link AnimNode} or an {@link AnimBlendTree} of multiple {@link AnimNode}s, which will be used
 * to animate the {@link Entity} while the state is active. An AnimState will stay active and play
 * as long as there is no {@link AnimTransition} with its conditions met that has that AnimState
 * as its source state.
 *
 * @category Animation
 */
export class AnimState {
    /**
     * Create a new AnimState instance.
     *
     * @param {AnimController} controller - The controller this AnimState is associated with.
     * @param {string} name - The name of the state. Used to find this state when the controller
     * transitions between states and links animations.
     * @param {number} [speed] - The speed animations in the state should play at. Individual
     * {@link AnimNode}s can override this value.
     * @param {boolean} [loop] - Determines whether animations in this state should loop.
     * @param {object|null} [blendTree] - If supplied, the AnimState will recursively build a
     * {@link AnimBlendTree} hierarchy, used to store, blend and play multiple animations.
     */
    constructor(controller: AnimController, name: string, speed?: number, loop?: boolean, blendTree?: object | null);
    /** @private */
    private _animations;
    /** @private */
    private _animationList;
    _controller: AnimController;
    _name: string;
    _speed: number;
    _loop: boolean;
    _hasAnimations: boolean;
    _blendTree: AnimNode | AnimBlendTree1D | AnimBlendTreeCartesian2D | AnimBlendTreeDirectional2D | AnimBlendTreeDirect;
    _createTree(type: any, state: any, parent: any, name: any, point: any, parameters: any, children: any, syncAnimations: any, createTree: any, findParameter: any): AnimBlendTree1D | AnimBlendTreeCartesian2D | AnimBlendTreeDirectional2D | AnimBlendTreeDirect;
    _getNodeFromPath(path: any): AnimNode | AnimBlendTree1D | AnimBlendTreeCartesian2D | AnimBlendTreeDirectional2D | AnimBlendTreeDirect;
    addAnimation(path: any, animTrack: any): void;
    _updateHasAnimations(): void;
    get name(): string;
    set animations(value: any[]);
    get animations(): any[];
    get hasAnimations(): boolean;
    set speed(value: number);
    get speed(): number;
    set loop(value: boolean);
    get loop(): boolean;
    get nodeCount(): any;
    get playable(): boolean;
    get looping(): boolean;
    get totalWeight(): number;
    get timelineDuration(): number;
}
import type { AnimController } from './anim-controller.js';
import { AnimNode } from './anim-node.js';
import { AnimBlendTree1D } from './anim-blend-tree-1d.js';
import { AnimBlendTreeCartesian2D } from './anim-blend-tree-2d-cartesian.js';
import { AnimBlendTreeDirectional2D } from './anim-blend-tree-2d-directional.js';
import { AnimBlendTreeDirect } from './anim-blend-tree-direct.js';
