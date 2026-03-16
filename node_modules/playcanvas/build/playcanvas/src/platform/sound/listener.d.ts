/**
 * @import { SoundManager } from './manager.js'
 */
/**
 * Represents an audio listener - used internally.
 *
 * @ignore
 */
export class Listener {
    /**
     * Create a new listener instance.
     *
     * @param {SoundManager} manager - The sound manager.
     */
    constructor(manager: SoundManager);
    /**
     * @type {SoundManager}
     * @private
     */
    private _manager;
    /**
     * @type {Vec3}
     * @private
     */
    private position;
    /**
     * @type {Mat4}
     * @private
     */
    private orientation;
    /**
     * Get the position of the listener.
     *
     * @returns {Vec3} The position of the listener.
     */
    getPosition(): Vec3;
    /**
     * Set the position of the listener.
     *
     * @param {Vec3} position - The new position of the listener.
     */
    setPosition(position: Vec3): void;
    /**
     * Set the orientation matrix of the listener.
     *
     * @param {Mat4} orientation - The new orientation matrix of the listener.
     */
    setOrientation(orientation: Mat4): void;
    /**
     * Get the orientation matrix of the listener.
     *
     * @returns {Mat4} The orientation matrix of the listener.
     */
    getOrientation(): Mat4;
    /**
     * Get the listener.
     *
     * @type {AudioListener|null}
     */
    get listener(): AudioListener | null;
}
import { Vec3 } from '../../core/math/vec3.js';
import { Mat4 } from '../../core/math/mat4.js';
import type { SoundManager } from './manager.js';
