/**
 * A SoundInstance plays a {@link Sound}.
 *
 * @category Sound
 */
export class SoundInstance extends EventHandler {
    /**
     * Fired when the instance starts playing its source.
     *
     * @event
     * @example
     * instance.on('play', () => {
     *     console.log('Instance started playing');
     * });
     */
    static EVENT_PLAY: string;
    /**
     * Fired when the instance is paused.
     *
     * @event
     * @example
     * instance.on('pause', () => {
     *     console.log('Instance paused');
     * });
     */
    static EVENT_PAUSE: string;
    /**
     * Fired when the instance is resumed.
     *
     * @event
     * @example
     * instance.on('resume', () => {
     *     console.log('Instance resumed');
     * });
     */
    static EVENT_RESUME: string;
    /**
     * Fired when the instance is stopped.
     *
     * @event
     * @example
     * instance.on('stop', () => {
     *     console.log('Instance stopped');
     * });
     */
    static EVENT_STOP: string;
    /**
     * Fired when the sound currently played by the instance ends.
     *
     * @event
     * @example
     * instance.on('end', () => {
     *     console.log('Instance ended');
     * });
     */
    static EVENT_END: string;
    /**
     * Create a new SoundInstance instance.
     *
     * @param {SoundManager} manager - The sound manager.
     * @param {Sound} sound - The sound to play.
     * @param {object} options - Options for the instance.
     * @param {number} [options.volume] - The playback volume, between 0 and 1. Defaults to 1.
     * @param {number} [options.pitch] - The relative pitch. Defaults to 1 (plays at normal pitch).
     * @param {boolean} [options.loop] - Whether the sound should loop when it reaches the end or
     * not. Defaults to false.
     * @param {number} [options.startTime] - The time from which the playback will start in
     * seconds. Default is 0 to start at the beginning. Defaults to 0.
     * @param {number} [options.duration] - The total time after the startTime in seconds when
     * playback will stop or restart if loop is true. Defaults to 0.
     * @param {Function} [options.onPlay] - Function called when the instance starts playing.
     * @param {Function} [options.onPause] - Function called when the instance is paused.
     * @param {Function} [options.onResume] - Function called when the instance is resumed.
     * @param {Function} [options.onStop] - Function called when the instance is stopped.
     * @param {Function} [options.onEnd] - Function called when the instance ends.
     */
    constructor(manager: SoundManager, sound: Sound, options: {
        volume?: number;
        pitch?: number;
        loop?: boolean;
        startTime?: number;
        duration?: number;
        onPlay?: Function;
        onPause?: Function;
        onResume?: Function;
        onStop?: Function;
        onEnd?: Function;
    });
    /**
     * Gets the source that plays the sound resource. If the Web Audio API is not supported the
     * type of source is [Audio](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio).
     * Source is only available after calling play.
     *
     * @type {AudioBufferSourceNode}
     */
    source: AudioBufferSourceNode;
    /**
     * @type {SoundManager}
     * @private
     */
    private _manager;
    /**
     * @type {number}
     * @private
     */
    private _volume;
    /**
     * @type {number}
     * @private
     */
    private _pitch;
    /**
     * @type {boolean}
     * @private
     */
    private _loop;
    /**
     * @type {Sound}
     * @private
     */
    private _sound;
    /**
     * Start at 'stopped'.
     *
     * @type {number}
     * @private
     */
    private _state;
    /**
     * True if the manager was suspended.
     *
     * @type {boolean}
     * @private
     */
    private _suspended;
    /**
     * Greater than 0 if we want to suspend the event handled to the 'onended' event.
     * When an 'onended' event is suspended, this counter is decremented by 1.
     * When a future 'onended' event is to be suspended, this counter is incremented by 1.
     *
     * @type {number}
     * @private
     */
    private _suspendEndEvent;
    /**
     * True if we want to suspend firing instance events.
     *
     * @type {boolean}
     * @private
     */
    private _suspendInstanceEvents;
    /**
     * If true then the instance will start playing its source when its created.
     *
     * @type {boolean}
     * @private
     */
    private _playWhenLoaded;
    /**
     * @type {number}
     * @private
     */
    private _startTime;
    /**
     * @type {number}
     * @private
     */
    private _duration;
    /**
     * @type {number|null}
     * @private
     */
    private _startOffset;
    /** @private */
    private _onPlayCallback;
    /** @private */
    private _onPauseCallback;
    /** @private */
    private _onResumeCallback;
    /** @private */
    private _onStopCallback;
    /** @private */
    private _onEndCallback;
    /**
     * @type {number}
     * @private
     */
    private _startedAt;
    /**
     * Manually keep track of the playback position because the Web Audio API does not
     * provide a way to do this accurately if the playbackRate is not 1.
     *
     * @type {number}
     * @private
     */
    private _currentTime;
    /**
     * @type {number}
     * @private
     */
    private _currentOffset;
    /**
     * The input node is the one that is connected to the source.
     *
     * @type {AudioNode|null}
     * @private
     */
    private _inputNode;
    /**
     * The connected node is the one that is connected to the destination (speakers). Any
     * external nodes will be connected to this node.
     *
     * @type {AudioNode|null}
     * @private
     */
    private _connectorNode;
    /**
     * The first external node set by a user.
     *
     * @type {AudioNode|null}
     * @private
     */
    private _firstNode;
    /**
     * The last external node set by a user.
     *
     * @type {AudioNode|null}
     * @private
     */
    private _lastNode;
    /**
     * Set to true if a play() request was issued when the AudioContext was still suspended,
     * and will therefore wait until it is resumed to play the audio.
     *
     * @type {boolean}
     * @private
     */
    private _waitingContextSuspension;
    /** @private */
    private _endedHandler;
    /** @private */
    private _isReady;
    /** @private */
    private _loadedMetadataHandler;
    /** @private */
    private _timeUpdateHandler;
    /**
     * Sets the current time of the sound that is playing. If the value provided is bigger than the
     * duration of the instance it will wrap from the beginning.
     *
     * @type {number}
     */
    set currentTime(value: number);
    /**
     * Gets the current time of the sound that is playing.
     *
     * @type {number}
     */
    get currentTime(): number;
    /**
     * Sets the duration of the sound that the instance will play starting from startTime.
     *
     * @type {number}
     */
    set duration(value: number);
    /**
     * Gets the duration of the sound that the instance will play starting from startTime.
     *
     * @type {number}
     */
    get duration(): number;
    /**
     * Gets whether the instance is currently paused.
     *
     * @type {boolean}
     */
    get isPaused(): boolean;
    /**
     * Gets whether the instance is currently playing.
     *
     * @type {boolean}
     */
    get isPlaying(): boolean;
    /**
     * Gets whether the instance is currently stopped.
     *
     * @type {boolean}
     */
    get isStopped(): boolean;
    /**
     * Gets whether the instance is currently suspended because the window is not focused.
     *
     * @type {boolean}
     */
    get isSuspended(): boolean;
    /**
     * Sets whether the instance will restart when it finishes playing.
     *
     * @type {boolean}
     */
    set loop(value: boolean);
    /**
     * Gets whether the instance will restart when it finishes playing.
     *
     * @type {boolean}
     */
    get loop(): boolean;
    /**
     * Sets the pitch modifier to play the sound with. Must be larger than 0.01.
     *
     * @type {number}
     */
    set pitch(pitch: number);
    /**
     * Gets the pitch modifier to play the sound with.
     *
     * @type {number}
     */
    get pitch(): number;
    /**
     * Sets the sound resource that the instance will play.
     *
     * @type {Sound}
     */
    set sound(value: Sound);
    /**
     * Gets the sound resource that the instance will play.
     *
     * @type {Sound}
     */
    get sound(): Sound;
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
    set volume(volume: number);
    /**
     * Gets the volume modifier to play the sound with. In range 0-1.
     *
     * @type {number}
     */
    get volume(): number;
    /** @private */
    private _onPlay;
    /** @private */
    private _onPause;
    /** @private */
    private _onResume;
    /** @private */
    private _onStop;
    /** @private */
    private _onEnded;
    /**
     * Handle the manager's 'volumechange' event.
     *
     * @private
     */
    private _onManagerVolumeChange;
    /**
     * Handle the manager's 'suspend' event.
     *
     * @private
     */
    private _onManagerSuspend;
    /**
     * Handle the manager's 'resume' event.
     *
     * @private
     */
    private _onManagerResume;
    /**
     * Creates internal audio nodes and connects them.
     *
     * @private
     */
    private _initializeNodes;
    gain: GainNode;
    /**
     * Attempt to begin playback the sound.
     * If the AudioContext is suspended, the audio will only start once it's resumed.
     * If the sound is already playing, this will restart the sound.
     *
     * @returns {boolean} True if the sound was started immediately.
     */
    play(): boolean;
    /**
     * Immediately play the sound.
     * This method assumes the AudioContext is ready (not suspended or locked).
     *
     * @private
     */
    private _playAudioImmediate;
    /**
     * Pauses playback of sound. Call resume() to resume playback from the same position.
     *
     * @returns {boolean} Returns true if the sound was paused.
     */
    pause(): boolean;
    /**
     * Resumes playback of the sound. Playback resumes at the point that the audio was paused.
     *
     * @returns {boolean} Returns true if the sound was resumed.
     */
    resume(): boolean;
    /**
     * Stops playback of sound. Calling play() again will restart playback from the beginning of
     * the sound.
     *
     * @returns {boolean} Returns true if the sound was stopped.
     */
    stop(): boolean;
    /**
     * Connects external Web Audio API nodes. You need to pass the first node of the node graph
     * that you created externally and the last node of that graph. The first node will be
     * connected to the audio source and the last node will be connected to the destination of the
     * AudioContext (e.g. speakers). Requires Web Audio API support.
     *
     * @param {AudioNode} firstNode - The first node that will be connected to the audio source of sound instances.
     * @param {AudioNode} [lastNode] - The last node that will be connected to the destination of the AudioContext.
     * If unspecified then the firstNode will be connected to the destination instead.
     * @example
     * const context = app.systems.sound.context;
     * const analyzer = context.createAnalyzer();
     * const distortion = context.createWaveShaper();
     * const filter = context.createBiquadFilter();
     * analyzer.connect(distortion);
     * distortion.connect(filter);
     * instance.setExternalNodes(analyzer, filter);
     */
    setExternalNodes(firstNode: AudioNode, lastNode?: AudioNode): void;
    /**
     * Clears any external nodes set by {@link SoundInstance#setExternalNodes}.
     */
    clearExternalNodes(): void;
    /**
     * Gets any external nodes set by {@link SoundInstance#setExternalNodes}.
     *
     * @returns {AudioNode[]} Returns an array that contains the two nodes set by
     * {@link SoundInstance#setExternalNodes}.
     */
    getExternalNodes(): AudioNode[];
    /**
     * Creates the source for the instance.
     *
     * @returns {AudioBufferSourceNode|null} Returns the created source or null if the sound
     * instance has no {@link Sound} associated with it.
     * @private
     */
    private _createSource;
    /**
     * Sets the current time taking into account the time the instance started playing, the current
     * pitch and the current time offset.
     *
     * @private
     */
    private _updateCurrentTime;
    /**
     * Handle the manager's 'destroy' event.
     *
     * @private
     */
    private _onManagerDestroy;
}
import { EventHandler } from '../../core/event-handler.js';
import type { Sound } from './sound.js';
import type { SoundManager } from './manager.js';
