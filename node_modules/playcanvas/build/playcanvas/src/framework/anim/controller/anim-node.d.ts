/**
 * @import { AnimBlendTree } from './anim-blend-tree.js'
 * @import { AnimState } from './anim-state.js'
 */
/**
 * AnimNodes are used to represent a single animation track in the current state. Each state can
 * contain multiple AnimNodes, in which case they are stored in a BlendTree hierarchy, which will
 * control the weight (contribution to the states final animation) of its child AnimNodes.
 *
 * @category Animation
 */
export class AnimNode {
    /**
     * Create a new AnimNode instance.
     *
     * @param {AnimState} state - The AnimState that this BlendTree belongs to.
     * @param {AnimBlendTree|null} parent - The parent of the AnimNode. If not null, the AnimNode
     * is stored as part of an {@link AnimBlendTree} hierarchy.
     * @param {string} name - The name of the AnimNode. Used when assigning an {@link AnimTrack} to
     * it.
     * @param {number[]|number} point - The coordinate/vector thats used to determine the weight of
     * this node when it's part of an {@link AnimBlendTree}.
     * @param {number} [speed] - The speed that its {@link AnimTrack} should play at. Defaults to 1.
     */
    constructor(state: AnimState, parent: AnimBlendTree | null, name: string, point: number[] | number, speed?: number);
    _state: AnimState;
    _parent: AnimBlendTree;
    _name: string;
    _point: number | Vec2;
    _pointLength: number;
    _speed: number;
    _weightedSpeed: number;
    _weight: number;
    _animTrack: any;
    get parent(): AnimBlendTree;
    get name(): string;
    get path(): any;
    get point(): number | Vec2;
    get pointLength(): number;
    set weight(value: number);
    get weight(): number;
    get normalizedWeight(): number;
    get speed(): number;
    get absoluteSpeed(): number;
    set weightedSpeed(weightedSpeed: number);
    get weightedSpeed(): number;
    set animTrack(value: any);
    get animTrack(): any;
}
import type { AnimState } from './anim-state.js';
import type { AnimBlendTree } from './anim-blend-tree.js';
import { Vec2 } from '../../../core/math/vec2.js';
