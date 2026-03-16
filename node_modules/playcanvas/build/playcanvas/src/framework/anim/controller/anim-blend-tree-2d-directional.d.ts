/**
 * An AnimBlendTree that calculates its weights using a 2D directional algorithm based on the thesis
 * http://runevision.com/thesis/rune_skovbo_johansen_thesis.pdf Chapter 6.
 *
 * @category Animation
 */
export class AnimBlendTreeDirectional2D extends AnimBlendTree {
    static _p: Vec2;
    static _pip: Vec2;
    pointCache(i: any, j: any): any;
    calculateWeights(): void;
}
import { AnimBlendTree } from './anim-blend-tree.js';
import { Vec2 } from '../../../core/math/vec2.js';
