/**
 * The SoundSlot controls the playback of {@link SoundInstance}s. SoundSlots are managed by
 * {@link SoundComponent}s. To add and remove SoundSlots on a SoundComponent, use
 * {@link SoundComponent#addSlot} and {@link SoundComponent#removeSlot} respectively.
 *
 * @hideconstructor
 * @category Sound
 */
export class SoundSlot extends EventHandler {
    /**
     * Fired when a {@link SoundInstance} starts playing on a slot. The handler is passed the sound
     * instance that started playing.
     *
     * @event
     * @example
     * slot.on('play', (instance) => {
     *     console.log('Sound instance started playing');
     * });
     */
    static EVENT_PLAY: string;
    /**
     * Fired when a {@link SoundInstance} is paused on a slot. The handler is passed the sound
     * instance that is paused.
     *
     * @event
     * @example
     * slot.on('pause', (instance) => {
     *     console.log('Sound instance paused');
     * });
     */
    static EVENT_PAUSE: string;
    /**
     * Fired when a {@link SoundInstance} is resumed on a slot. The handler is passed the sound
     * instance that is resumed.
     *
     * @event
     * @example
     * slot.on('resume', (instance) => {
     *     console.log('Sound instance resumed');
     * });
     */
    static EVENT_RESUME: string;
    /**
     * Fired when a {@link SoundInstance} is stopped on a slot. The handler is passed the sound
     * instance that is stopped.
     *
     * @event
     * @example
     * slot.on('stop', (instance) => {
     *     console.log('Sound instance stopped');
     * });
     */
    static EVENT_STOP: string;
    /**
     * Fired when a sound instance stops playing because it reached its end. The handler is passed
     * the {@link SoundInstance} that ended.
     *
     * @event
     * @example
     * slot.on('end', (instance) => {
     *     console.log('Sound instance playback ended');
     * });
     */
    static EVENT_END: string;
    /**
     * Fired when the sound {@link Asset} assigned to the slot is loaded. The handler is passed the
     * loaded {@link Sound} resource.
     *
     * @event
     * @example
     * slot.on('load', (sound) => {
     *     console.log('Sound resource loaded');
     * });
     */
    static EVENT_LOAD: string;
    /**
     * Create a new SoundSlot.
     *
     * @param {SoundComponent} component - The Component that created this slot.
     * @param {string} [name] - The name of the slot. Defaults to 'Untitled'.
     * @param {object} [options] - Settings for the slot.
     * @param {number} [options.volume] - The playback volume, between 0 and 1.
     * @param {number} [options.pitch] - The relative pitch, default of 1, plays at normal pitch.
     * @param {boolean} [options.loop] - If true, the sound will restart when it reaches the end.
     * @param {number} [options.startTime] - The start time from which the sound will start
     * playing.
     * @param {number} [options.duration] - The duration of the sound that the slot will play
     * starting from startTime.
     * @param {boolean} [options.overlap] - If true, then sounds played from slot will be played
     * independently of each other. Otherwise the slot will first stop the current sound before
     * starting the new one.
     * @param {boolean} [options.autoPlay] - If true, the slot will start playing as soon as its
     * audio asset is loaded.
     * @param {number} [options.asset] - The asset id of the audio asset that is going to be played
     * by this slot.
     */
    constructor(component: SoundComponent, name?: string, options?: {
        volume?: number;
        pitch?: number;
        loop?: boolean;
        startTime?: number;
        duration?: number;
        overlap?: boolean;
        autoPlay?: boolean;
        asset?: number;
    });
    /**
     * The name of the slot.
     *
     * @type {string}
     */
    name: string;
    /**
     * An array that contains all the {@link SoundInstance}s currently being played by the slot.
     *
     * @type {SoundInstance[]}
     */
    instances: SoundInstance[];
    _component: SoundComponent;
    _assets: import("../../asset/asset-registry.js").AssetRegistry;
    _manager: any;
    _volume: number;
    _pitch: number;
    _loop: boolean;
    _duration: number;
    _startTime: number;
    _overlap: boolean;
    _autoPlay: boolean;
    _firstNode: AudioNode;
    _lastNode: AudioNode;
    _asset: number;
    _onInstancePlayHandler: any;
    _onInstancePauseHandler: any;
    _onInstanceResumeHandler: any;
    _onInstanceStopHandler: any;
    _onInstanceEndHandler: any;
    /**
     * Plays a sound. If {@link overlap} is true the new sound instance will be played
     * independently of any other instances already playing. Otherwise existing sound instances
     * will stop before playing the new sound.
     *
     * @returns {SoundInstance} The new sound instance.
     */
    play(): SoundInstance;
    /**
     * Pauses all sound instances. To continue playback call {@link resume}.
     *
     * @returns {boolean} True if the sound instances paused successfully, false otherwise.
     */
    pause(): boolean;
    /**
     * Resumes playback of all paused sound instances.
     *
     * @returns {boolean} True if any instances were resumed.
     */
    resume(): boolean;
    /**
     * Stops playback of all sound instances.
     *
     * @returns {boolean} True if any instances were stopped.
     */
    stop(): boolean;
    /**
     * Loads the asset assigned to this slot.
     */
    load(): void;
    /**
     * Connect external Web Audio API nodes. Any sound played by this slot will automatically
     * attach the specified nodes to the source that plays the sound. You need to pass the first
     * node of the node graph that you created externally and the last node of that graph. The
     * first node will be connected to the audio source and the last node will be connected to the
     * destination of the AudioContext (e.g. speakers).
     *
     * @param {AudioNode} firstNode - The first node that will be connected to the audio source of
     * sound instances.
     * @param {AudioNode} [lastNode] - The last node that will be connected to the destination of
     * the AudioContext. If unspecified then the firstNode will be connected to the destination
     * instead.
     * @example
     * const context = app.systems.sound.context;
     * const analyzer = context.createAnalyzer();
     * const distortion = context.createWaveShaper();
     * const filter = context.createBiquadFilter();
     * analyzer.connect(distortion);
     * distortion.connect(filter);
     * slot.setExternalNodes(analyzer, filter);
     */
    setExternalNodes(firstNode: AudioNode, lastNode?: AudioNode): void;
    /**
     * Clears any external nodes set by {@link setExternalNodes}.
     */
    clearExternalNodes(): void;
    /**
     * Gets an array that contains the two external nodes set by {@link setExternalNodes}.
     *
     * @returns {AudioNode[]} An array of 2 elements that contains the first and last nodes set by
     * {@link setExternalNodes}.
     */
    getExternalNodes(): AudioNode[];
    /**
     * Reports whether an asset is set on this slot.
     *
     * @returns {boolean} Returns true if the slot has an asset assigned.
     * @private
     */
    private _hasAsset;
    /**
     * Creates a new {@link SoundInstance} with the properties of the slot.
     *
     * @returns {SoundInstance} The new instance.
     * @private
     */
    private _createInstance;
    _onInstancePlay(instance: any): void;
    _onInstancePause(instance: any): void;
    _onInstanceResume(instance: any): void;
    _onInstanceStop(instance: any): void;
    _onInstanceEnd(instance: any): void;
    _onAssetAdd(asset: any): void;
    _onAssetLoad(asset: any): void;
    _onAssetRemoved(asset: any): void;
    updatePosition(position: any): void;
    /**
     * Sets the asset id.
     *
     * @type {number|null}
     */
    set asset(value: number | null);
    /**
     * Gets the asset id.
     *
     * @type {number|null}
     */
    get asset(): number | null;
    /**
     * Sets whether the slot will begin playing as soon as it is loaded.
     *
     * @type {boolean}
     */
    set autoPlay(value: boolean);
    /**
     * Gets whether the slot will begin playing as soon as it is loaded.
     *
     * @type {boolean}
     */
    get autoPlay(): boolean;
    /**
     * Sets the duration of the sound that the slot will play starting from startTime.
     *
     * @type {number}
     */
    set duration(value: number);
    /**
     * Gets the duration of the sound that the slot will play starting from startTime.
     *
     * @type {number}
     */
    get duration(): number;
    /**
     * Gets whether the asset of the slot is loaded.
     *
     * @type {boolean}
     */
    get isLoaded(): boolean;
    /**
     * Gets whether the slot is currently paused.
     *
     * @type {boolean}
     */
    get isPaused(): boolean;
    /**
     * Gets whether the slot is currently playing.
     *
     * @type {boolean}
     */
    get isPlaying(): boolean;
    /**
     * Gets whether the slot is currently stopped.
     *
     * @type {boolean}
     */
    get isStopped(): boolean;
    /**
     * Sets whether the slot will restart when it finishes playing.
     *
     * @type {boolean}
     */
    set loop(value: boolean);
    /**
     * Gets whether the slot will restart when it finishes playing.
     *
     * @type {boolean}
     */
    get loop(): boolean;
    /**
     * Sets whether the sounds played from this slot will be played independently of each other.
     * Otherwise, the slot will first stop the current sound before starting the new one.
     *
     * @type {boolean}
     */
    set overlap(value: boolean);
    /**
     * Gets whether the sounds played from this slot will be played independently of each other.
     *
     * @type {boolean}
     */
    get overlap(): boolean;
    /**
     * Sets the pitch modifier to play the sound with. Must be larger than 0.01.
     *
     * @type {number}
     */
    set pitch(value: number);
    /**
     * Gets the pitch modifier to play the sound with.
     *
     * @type {number}
     */
    get pitch(): number;
    /**
     * Sets the start time from which the sound will start playing.
     *
     * @type {number}
     */
    set startTime(value: number);
    /**
     * Gets the start time from which the sound will start playing.
     *
     * @type {number}
     */
    get startTime(): number;
    /**
     * Sets the volume modifier to play the sound with. In range 0-1.
     *
     * @type {number}
     */
    set volume(value: number);
    /**
     * Gets the volume modifier to play the sound with.
     *
     * @type {number}
     */
    get volume(): number;
}
import { EventHandler } from '../../../core/event-handler.js';
import { SoundInstance } from '../../../platform/sound/instance.js';
import type { SoundComponent } from './component.js';
