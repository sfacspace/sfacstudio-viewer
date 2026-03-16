/**
 * @import { AnimState } from './anim-state.js'
 * @import { Vec2 } from '../../../core/math/vec2.js'
 */
/**
 * An AnimBlendTree that calculates its weights using a 1D algorithm based on the thesis
 * http://runevision.com/thesis/rune_skovbo_johansen_thesis.pdf Chapter 6.
 *
 * @category Animation
 */
export class AnimBlendTree1D extends AnimBlendTree {
    calculateWeights(): void;
}
import { AnimBlendTree } from './anim-blend-tree.js';
