/**
 * The SoundManager is used to load and play audio. It also applies system-wide settings like
 * global volume, suspend and resume.
 *
 * @category Sound
 */
export class SoundManager extends EventHandler {
    /**
     * The underlying AudioContext, lazy loaded in the 'context' property.
     *
     * @type {AudioContext|null}
     * @private
     */
    private _context;
    AudioContext: any;
    _unlockHandlerFunc: any;
    _userSuspended: boolean;
    listener: Listener;
    _volume: number;
    /**
     * Sets the global volume for the manager. All {@link SoundInstance}s will scale their volume
     * with this volume. Valid between [0, 1].
     *
     * @type {number}
     */
    set volume(volume: number);
    /**
     * Gets the global volume for the manager.
     *
     * @type {number}
     */
    get volume(): number;
    get suspended(): boolean;
    /**
     * Get the Web Audio API context.
     *
     * @type {AudioContext}
     * @ignore
     */
    get context(): AudioContext;
    suspend(): void;
    resume(): void;
    destroy(): void;
    _resume(): void;
    _suspend(): void;
    _unlockHandler(): void;
    _registerUnlockListeners(): void;
    _removeUnlockListeners(): void;
}
import { EventHandler } from '../../core/event-handler.js';
import { Listener } from './listener.js';
