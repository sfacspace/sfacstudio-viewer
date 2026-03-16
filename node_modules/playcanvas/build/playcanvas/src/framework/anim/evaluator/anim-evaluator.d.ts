/**
 * @import { AnimBinder } from '../binder/anim-binder.js'
 * @import { AnimClip } from './anim-clip.js'
 */
/**
 * AnimEvaluator blends multiple sets of animation clips together.
 *
 * @ignore
 */
export class AnimEvaluator {
    /**
     * Create a new animation evaluator.
     *
     * @param {AnimBinder} binder - Interface that resolves curve paths to instances of
     * {@link AnimTarget}.
     */
    constructor(binder: AnimBinder);
    _binder: AnimBinder;
    _clips: any[];
    _inputs: any[];
    _outputs: any[];
    _targets: {};
    /**
     * The list of animation clips.
     *
     * @type {AnimClip[]}
     */
    get clips(): AnimClip[];
    /**
     * Add a clip to the evaluator.
     *
     * @param {AnimClip} clip - The clip to add to the evaluator.
     */
    addClip(clip: AnimClip): void;
    /**
     * Remove a clip from the evaluator.
     *
     * @param {number} index - Index of the clip to remove.
     */
    removeClip(index: number): void;
    /**
     * Remove all clips from the evaluator.
     */
    removeClips(): void;
    updateClipTrack(name: any, animTrack: any): void;
    /**
     * Returns the first clip which matches the given name, or null if no such clip was found.
     *
     * @param {string} name - Name of the clip to find.
     * @returns {AnimClip|null} - The clip with the given name or null if no such clip was found.
     */
    findClip(name: string): AnimClip | null;
    rebind(): void;
    assignMask(mask: any): any;
    /**
     * Evaluator frame update function. All the attached {@link AnimClip}s are evaluated, blended
     * and the results set on the {@link AnimTarget}.
     *
     * @param {number} deltaTime - The amount of time that has passed since the last update, in
     * seconds.
     * @param {boolean} [outputAnimation] - Whether the evaluator should output the results of the
     * update to the bound animation targets.
     */
    update(deltaTime: number, outputAnimation?: boolean): void;
}
import type { AnimBinder } from '../binder/anim-binder.js';
import type { AnimClip } from './anim-clip.js';
