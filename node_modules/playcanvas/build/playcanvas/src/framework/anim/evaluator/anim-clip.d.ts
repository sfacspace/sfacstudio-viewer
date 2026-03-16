/**
 * @import { AnimTrack } from './anim-track.js'
 * @import { EventHandler } from '../../../core/event-handler.js'
 */
/**
 * AnimClip wraps the running state of an animation track. It contains and update the animation
 * 'cursor' and performs looping logic.
 *
 * @ignore
 */
export class AnimClip {
    static eventFrame: {
        start: number;
        end: number;
        residual: number;
    };
    /**
     * Create a new animation clip.
     *
     * @param {AnimTrack} track - The animation data.
     * @param {number} time - The initial time of the clip.
     * @param {number} speed - Speed of the animation playback.
     * @param {boolean} playing - true if the clip is playing and false otherwise.
     * @param {boolean} loop - Whether the clip should loop.
     * @param {EventHandler} [eventHandler] - The handler to call when an event is fired by the clip.
     */
    constructor(track: AnimTrack, time: number, speed: number, playing: boolean, loop: boolean, eventHandler?: EventHandler);
    _name: string;
    _track: AnimTrack;
    _snapshot: AnimSnapshot;
    _playing: boolean;
    _time: number;
    _speed: number;
    _loop: boolean;
    _blendWeight: number;
    _blendOrder: number;
    _eventHandler: EventHandler;
    set name(name: string);
    get name(): string;
    set track(track: AnimTrack);
    get track(): AnimTrack;
    get snapshot(): AnimSnapshot;
    set time(time: number);
    get time(): number;
    set speed(speed: number);
    get speed(): number;
    set loop(loop: boolean);
    get loop(): boolean;
    set blendWeight(blendWeight: number);
    get blendWeight(): number;
    set blendOrder(blendOrder: number);
    get blendOrder(): number;
    set eventCursor(value: any);
    get eventCursor(): any;
    _eventCursor: any;
    get eventCursorEnd(): number;
    get nextEvent(): any;
    get isReverse(): boolean;
    nextEventAheadOfTime(time: any): boolean;
    nextEventBehindTime(time: any): boolean;
    resetEventCursor(): void;
    moveEventCursor(): void;
    clipFrameTime(frameEndTime: any): void;
    alignCursorToCurrentTime(): void;
    fireNextEvent(): void;
    fireNextEventInFrame(frameStartTime: any, frameEndTime: any): boolean;
    activeEventsForFrame(frameStartTime: any, frameEndTime: any): void;
    progressForTime(time: any): number;
    _update(deltaTime: any): void;
    play(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    reset(): void;
}
import type { AnimTrack } from './anim-track.js';
import { AnimSnapshot } from './anim-snapshot.js';
import type { EventHandler } from '../../../core/event-handler.js';
