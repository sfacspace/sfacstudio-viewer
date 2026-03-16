/**
 * A SoundInstance3d plays a {@link Sound} in 3D.
 *
 * @category Sound
 */
export class SoundInstance3d extends SoundInstance {
    /**
     * Create a new SoundInstance3d instance.
     *
     * @param {SoundManager} manager - The sound manager.
     * @param {Sound} sound - The sound to play.
     * @param {object} options - Options for the instance.
     * @param {number} [options.volume] - The playback volume, between 0 and 1. Defaults to 1.
     * @param {number} [options.pitch] - The relative pitch. Defaults to 1 (plays at normal pitch).
     * @param {boolean} [options.loop] - Whether the sound should loop when it reaches the end or
     * not. Defaults to false.
     * @param {number} [options.startTime] - The time from which the playback will start. Default
     * is 0 to start at the beginning.
     * @param {number} [options.duration] - The total time after the startTime when playback will
     * stop or restart if loop is true.
     * @param {Vec3} [options.position] - The position of the sound in 3D space.
     * @param {string} [options.distanceModel] - Determines which algorithm to use to reduce the
     * volume of the audio as it moves away from the listener. Can be:
     *
     * - {@link DISTANCE_LINEAR}
     * - {@link DISTANCE_INVERSE}
     * - {@link DISTANCE_EXPONENTIAL}
     *
     * Defaults to {@link DISTANCE_LINEAR}.
     * @param {number} [options.refDistance] - The reference distance for reducing volume as the
     * sound source moves further from the listener. Defaults to 1.
     * @param {number} [options.maxDistance] - The maximum distance from the listener at which
     * audio falloff stops. Note the volume of the audio is not 0 after this distance, but just
     * doesn't fall off anymore. Defaults to 10000.
     * @param {number} [options.rollOffFactor] - The factor used in the falloff equation. Defaults
     * to 1.
     */
    constructor(manager: SoundManager, sound: Sound, options?: {
        volume?: number;
        pitch?: number;
        loop?: boolean;
        startTime?: number;
        duration?: number;
        position?: Vec3;
        distanceModel?: string;
        refDistance?: number;
        maxDistance?: number;
        rollOffFactor?: number;
    });
    /**
     * @type {Vec3}
     * @private
     */
    private _position;
    /**
     * @type {Vec3}
     * @private
     */
    private _velocity;
    /**
     * Sets the position of the sound in 3D space.
     *
     * @type {Vec3}
     */
    set position(value: Vec3);
    /**
     * Gets the position of the sound in 3D space.
     *
     * @type {Vec3}
     */
    get position(): Vec3;
    /**
     * Sets the maximum distance from the listener at which audio falloff stops. Note that the
     * volume of the audio is not 0 after this distance, but just doesn't fall off anymore.
     *
     * @type {number}
     */
    set maxDistance(value: number);
    /**
     * Gets the maximum distance from the listener at which audio falloff stops.
     *
     * @type {number}
     */
    get maxDistance(): number;
    /**
     * Sets the reference distance for reducing volume as the sound source moves further from the
     * listener.
     *
     * @type {number}
     */
    set refDistance(value: number);
    /**
     * Gets the reference distance for reducing volume as the sound source moves further from the
     * listener.
     *
     * @type {number}
     */
    get refDistance(): number;
    /**
     * Sets the factor used in the falloff equation.
     *
     * @type {number}
     */
    set rollOffFactor(value: number);
    /**
     * Gets the factor used in the falloff equation.
     *
     * @type {number}
     */
    get rollOffFactor(): number;
    /**
     * Sets which algorithm to use to reduce the volume of the audio as it moves away from
     * the listener. Can be:
     *
     * - {@link DISTANCE_LINEAR}
     * - {@link DISTANCE_INVERSE}
     * - {@link DISTANCE_EXPONENTIAL}
     *
     * Default is {@link DISTANCE_LINEAR}.
     *
     * @type {string}
     */
    set distanceModel(value: string);
    /**
     * Gets which algorithm to use to reduce the volume of the audio as it moves away from
     * the listener.
     *
     * @type {string}
     */
    get distanceModel(): string;
    panner: PannerNode;
    set velocity(velocity: Vec3);
    get velocity(): Vec3;
}
import { SoundInstance } from './instance.js';
import { Vec3 } from '../../core/math/vec3.js';
import type { SoundManager } from './manager.js';
import type { Sound } from './sound.js';
