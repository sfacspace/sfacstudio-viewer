/**
 * @import { Entity } from '../../entity.js'
 * @import { SoundInstance } from '../../../platform/sound/instance.js'
 */
/**
 * The SoundComponent enables an {@link Entity} to play audio. The SoundComponent can manage
 * multiple {@link SoundSlot}s, each of which can play a different audio asset with its own set
 * of properties such as volume, pitch, and looping behavior.
 *
 * The SoundComponent supports positional audio, meaning that the sound can be played relative
 * to the Entity's position in 3D space. This is useful for creating immersive audio experiences
 * where the sound's volume and panning are affected by the listener's position and orientation.
 * Positional audio requires that an Entity with an {@link AudioListenerComponent} be added to the
 * scene.
 *
 * You should never need to use the SoundComponent constructor directly. To add a SoundComponent
 * to an Entity, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = new pc.Entity();
 * entity.addComponent('sound', {
 *     volume: 0.8,
 *     positional: true
 * });
 * ```
 *
 * Once the SoundComponent is added to the entity, you can access it via the {@link Entity#sound}
 * property:
 *
 * ```javascript
 * entity.sound.volume = 0.9;  // Set the volume for all sounds
 *
 * console.log(entity.sound.volume); // Get the volume and print it
 * ```
 *
 * Add individual sounds by creating sound slots on the component:
 *
 * ```javascript
 * entity.sound.addSlot('beep', {
 *     asset: asset
 * });
 * ```
 *
 * Relevant Engine API examples:
 *
 * - [Positional Sound](https://playcanvas.github.io/#/sound/positional)
 *
 * @hideconstructor
 * @category Sound
 */
export class SoundComponent extends Component {
    /**
     * Fired when a sound instance starts playing. The handler is passed the {@link SoundSlot} and
     * the {@link SoundInstance} that started playing.
     *
     * @event
     * @example
     * entity.sound.on('play', (slot, instance) => {
     *     console.log(`Sound ${slot.name} started playing`);
     * });
     */
    static EVENT_PLAY: string;
    /**
     * Fired when a sound instance is paused. The handler is passed the {@link SoundSlot} and the
     * {@link SoundInstance} that was paused.
     *
     * @event
     * @example
     * entity.sound.on('pause', (slot, instance) => {
     *     console.log(`Sound ${slot.name} paused`);
     * });
     */
    static EVENT_PAUSE: string;
    /**
     * Fired when a sound instance is resumed. The handler is passed the {@link SoundSlot} and the
     * {@link SoundInstance} that was resumed.
     *
     * @event
     * @example
     * entity.sound.on('resume', (slot, instance) => {
     *     console.log(`Sound ${slot.name} resumed`);
     * });
     */
    static EVENT_RESUME: string;
    /**
     * Fired when a sound instance is stopped. The handler is passed the {@link SoundSlot} and the
     * {@link SoundInstance} that was stopped.
     *
     * @event
     * @example
     * entity.sound.on('stop', (slot, instance) => {
     *     console.log(`Sound ${slot.name} stopped`);
     * });
     */
    static EVENT_STOP: string;
    /**
     * Fired when a sound instance stops playing because it reached its end. The handler is passed
     * the {@link SoundSlot} and the {@link SoundInstance} that ended.
     *
     * @event
     * @example
     * entity.sound.on('end', (slot, instance) => {
     *     console.log(`Sound ${slot.name} ended`);
     * });
     */
    static EVENT_END: string;
    /** @private */
    private _volume;
    /** @private */
    private _pitch;
    /** @private */
    private _positional;
    /** @private */
    private _refDistance;
    /** @private */
    private _maxDistance;
    /** @private */
    private _rollOffFactor;
    /** @private */
    private _distanceModel;
    /**
     * @type {Object<string, SoundSlot>}
     * @private
     */
    private _slots;
    /** @private */
    private _playingBeforeDisable;
    /**
     * Update the specified property on all sound instances.
     *
     * @param {string} property - The name of the SoundInstance property to update.
     * @param {string|number} value - The value to set the property to.
     * @param {boolean} isFactor - True if the value is a factor of the slot property or false
     * if it is an absolute value.
     * @private
     */
    private _updateSoundInstances;
    /**
     * Sets which algorithm to use to reduce the volume of the sound as it moves away from the
     * listener. Can be:
     *
     * - {@link DISTANCE_LINEAR}
     * - {@link DISTANCE_INVERSE}
     * - {@link DISTANCE_EXPONENTIAL}
     *
     * Defaults to {@link DISTANCE_LINEAR}.
     *
     * @type {string}
     */
    set distanceModel(value: string);
    /**
     * Gets which algorithm to use to reduce the volume of the sound as it moves away from the
     * listener.
     *
     * @type {string}
     */
    get distanceModel(): string;
    /**
     * Sets the maximum distance from the listener at which audio falloff stops. Note that the
     * volume of the audio is not 0 after this distance, but just doesn't fall off anymore.
     * Defaults to 10000.
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
     * listener. Defaults to 1.
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
     * Sets the factor used in the falloff equation. Defaults to 1.
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
     * Sets the pitch modifier to play the audio with. Must be larger than 0.01. Defaults to 1.
     *
     * @type {number}
     */
    set pitch(value: number);
    /**
     * Gets the pitch modifier to play the audio with.
     *
     * @type {number}
     */
    get pitch(): number;
    /**
     * Sets the volume modifier to play the audio with. In range 0-1. Defaults to 1.
     *
     * @type {number}
     */
    set volume(value: number);
    /**
     * Gets the volume modifier to play the audio with.
     *
     * @type {number}
     */
    get volume(): number;
    /**
     * Sets whether the component plays positional sound. If true, the audio will play back at the
     * location of the Entity in space, so the audio will be affected by the position of the
     * {@link AudioListenerComponent}. Defaults to true.
     *
     * @type {boolean}
     */
    set positional(newValue: boolean);
    /**
     * Gets whether the component plays positional sound.
     *
     * @type {boolean}
     */
    get positional(): boolean;
    /**
     * Sets a dictionary that contains the {@link SoundSlot}s managed by this SoundComponent.
     *
     * @type {Object<string, SoundSlot>}
     */
    set slots(newValue: {
        [x: string]: SoundSlot;
    });
    /**
     * Gets a dictionary that contains the {@link SoundSlot}s managed by this SoundComponent.
     *
     * @type {Object<string, SoundSlot>}
     */
    get slots(): {
        [x: string]: SoundSlot;
    };
    onRemove(): void;
    /**
     * Creates a new {@link SoundSlot} with the specified name.
     *
     * @param {string} name - The name of the slot.
     * @param {object} [options] - Settings for the slot.
     * @param {number} [options.volume] - The playback volume, between 0 and 1. Defaults to 1.
     * @param {number} [options.pitch] - The relative pitch. Defaults to 1 (plays at normal pitch).
     * @param {boolean} [options.loop] - If true, the sound will restart when it reaches the end.
     * Defaults to false.
     * @param {number} [options.startTime] - The start time from which the sound will start playing.
     * Defaults to 0 to start at the beginning.
     * @param {number} [options.duration] - The duration of the sound that the slot will play
     * starting from startTime. Defaults to `null` which means play to end of the sound.
     * @param {boolean} [options.overlap] - If true, then sounds played from slot will be played
     * independently of each other. Otherwise the slot will first stop the current sound before
     * starting the new one. Defaults to false.
     * @param {boolean} [options.autoPlay] - If true, the slot will start playing as soon as its
     * audio asset is loaded. Defaults to false.
     * @param {number} [options.asset] - The asset id of the audio asset that is going to be played
     * by this slot.
     * @returns {SoundSlot|null} The new slot or null if the slot already exists.
     * @example
     * // get an asset by id
     * const asset = app.assets.get(10);
     * // add a slot
     * this.entity.sound.addSlot('beep', {
     *     asset: asset
     * });
     * // play
     * this.entity.sound.play('beep');
     */
    addSlot(name: string, options?: {
        volume?: number;
        pitch?: number;
        loop?: boolean;
        startTime?: number;
        duration?: number;
        overlap?: boolean;
        autoPlay?: boolean;
        asset?: number;
    }): SoundSlot | null;
    /**
     * Removes the {@link SoundSlot} with the specified name.
     *
     * @param {string} name - The name of the slot.
     * @example
     * // remove a slot called 'beep'
     * this.entity.sound.removeSlot('beep');
     */
    removeSlot(name: string): void;
    /**
     * Returns the slot with the specified name.
     *
     * @param {string} name - The name of the slot.
     * @returns {SoundSlot|undefined} The slot.
     * @example
     * // get a slot and set its volume
     * this.entity.sound.slot('beep').volume = 0.5;
     *
     */
    slot(name: string): SoundSlot | undefined;
    /**
     * Return a property from the slot with the specified name.
     *
     * @param {string} name - The name of the {@link SoundSlot} to look for.
     * @param {string} property - The name of the property to look for.
     * @returns {*} The value from the looked property inside the slot with specified name. May be
     * undefined if slot does not exist.
     * @private
     */
    private _getSlotProperty;
    /**
     * Returns true if the slot with the specified name is currently playing.
     *
     * @param {string} name - The name of the {@link SoundSlot} to look for.
     * @returns {boolean} True if the slot with the specified name exists and is currently playing.
     */
    isPlaying(name: string): boolean;
    /**
     * Returns true if the asset of the slot with the specified name is loaded..
     *
     * @param {string} name - The name of the {@link SoundSlot} to look for.
     * @returns {boolean} True if the slot with the specified name exists and its asset is loaded.
     */
    isLoaded(name: string): boolean;
    /**
     * Returns true if the slot with the specified name is currently paused.
     *
     * @param {string} name - The name of the {@link SoundSlot} to look for.
     * @returns {boolean} True if the slot with the specified name exists and is currently paused.
     */
    isPaused(name: string): boolean;
    /**
     * Returns true if the slot with the specified name is currently stopped.
     *
     * @param {string} name - The name of the {@link SoundSlot} to look for.
     * @returns {boolean} True if the slot with the specified name exists and is currently stopped.
     */
    isStopped(name: string): boolean;
    /**
     * Begins playing the sound slot with the specified name. The slot will restart playing if it
     * is already playing unless the overlap field is true in which case a new sound will be
     * created and played.
     *
     * @param {string} name - The name of the {@link SoundSlot} to play.
     * @returns {SoundInstance|null} The sound instance that will be played. Returns null if the
     * component or its parent entity is disabled or if the SoundComponent has no slot with the
     * specified name.
     * @example
     * // get asset by id
     * const asset = app.assets.get(10);
     * // create a slot and play it
     * this.entity.sound.addSlot('beep', {
     *     asset: asset
     * });
     * this.entity.sound.play('beep');
     */
    play(name: string): SoundInstance | null;
    /**
     * Pauses playback of the slot with the specified name. If the name is undefined then all slots
     * currently played will be paused. The slots can be resumed by calling {@link SoundComponent#resume}.
     *
     * @param {string} [name] - The name of the slot to pause. Leave undefined to pause everything.
     * @example
     * // pause all sounds
     * this.entity.sound.pause();
     * // pause a specific sound
     * this.entity.sound.pause('beep');
     */
    pause(name?: string): void;
    /**
     * Resumes playback of the sound slot with the specified name if it's paused. If no name is
     * specified all slots will be resumed.
     *
     * @param {string} [name] - The name of the slot to resume. Leave undefined to resume everything.
     * @example
     * // resume all sounds
     * this.entity.sound.resume();
     * // resume a specific sound
     * this.entity.sound.resume('beep');
     */
    resume(name?: string): void;
    /**
     * Stops playback of the sound slot with the specified name if it's paused. If no name is
     * specified all slots will be stopped.
     *
     * @param {string} [name] - The name of the slot to stop. Leave undefined to stop everything.
     * @example
     * // stop all sounds
     * this.entity.sound.stop();
     * // stop a specific sound
     * this.entity.sound.stop('beep');
     */
    stop(name?: string): void;
}
import { Component } from '../component.js';
import { SoundSlot } from './slot.js';
import type { SoundInstance } from '../../../platform/sound/instance.js';
