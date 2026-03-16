/**
 * @import { AnimCurve } from './anim-curve.js'
 * @import { AnimData } from './anim-data.js'
 */
/**
 * An AnimTrack stores the curve data necessary to animate a set of target nodes. It can be linked
 * to the nodes it should animate using the {@link AnimComponent#assignAnimation} method.
 *
 * @category Animation
 */
export class AnimTrack {
    /**
     * This AnimTrack can be used as a placeholder track when creating a state graph before having all associated animation data available.
     *
     * @type {AnimTrack}
     */
    static EMPTY: AnimTrack;
    /**
     * Create a new AnimTrack instance.
     *
     * @param {string} name - The track name.
     * @param {number} duration - The duration of the track in seconds.
     * @param {AnimData[]} inputs - List of curve key data.
     * @param {AnimData[]} outputs - List of curve value data.
     * @param {AnimCurve[]} curves - The list of curves.
     * @param {AnimEvents} animEvents - A sequence of animation events.
     * @ignore
     */
    constructor(name: string, duration: number, inputs: AnimData[], outputs: AnimData[], curves: AnimCurve[], animEvents?: AnimEvents);
    _name: string;
    _duration: number;
    _inputs: AnimData[];
    _outputs: AnimData[];
    _curves: AnimCurve[];
    _animEvents: AnimEvents;
    /**
     * Gets the name of the AnimTrack.
     *
     * @type {string}
     */
    get name(): string;
    /**
     * Gets the duration of the AnimTrack.
     *
     * @type {number}
     */
    get duration(): number;
    /**
     * Gets the list of curve key data contained in the AnimTrack.
     *
     * @type {AnimData[]}
     */
    get inputs(): AnimData[];
    /**
     * Gets the list of curve values contained in the AnimTrack.
     *
     * @type {AnimData[]}
     */
    get outputs(): AnimData[];
    /**
     * Gets the list of curves contained in the AnimTrack.
     *
     * @type {AnimCurve[]}
     */
    get curves(): AnimCurve[];
    /**
     * Sets the animation events that will fire during the playback of this anim track.
     *
     * @type {AnimEvents}
     */
    set events(animEvents: AnimEvents);
    /**
     * Gets the animation events that will fire during the playback of this anim track.
     *
     * @type {AnimEvents}
     */
    get events(): AnimEvents;
    eval(time: any, snapshot: any): void;
}
import type { AnimData } from './anim-data.js';
import type { AnimCurve } from './anim-curve.js';
import { AnimEvents } from './anim-events.js';
