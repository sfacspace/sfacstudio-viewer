/**
 * @import { AnimTrack } from './anim-track.js'
 */
/**
 * AnimSnapshot stores the state of an animation track at a particular time.
 *
 * @ignore
 */
export class AnimSnapshot {
    /**
     * Create a new animation snapshot.
     *
     * @param {AnimTrack} animTrack - The source track.
     */
    constructor(animTrack: AnimTrack);
    _name: string;
    _time: number;
    _cache: AnimCache[];
    _results: number[][];
}
import { AnimCache } from './anim-cache.js';
import type { AnimTrack } from './anim-track.js';
