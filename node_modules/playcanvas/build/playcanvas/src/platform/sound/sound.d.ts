/**
 * Represents the raw audio data of playable sound. A Sound is the resource of an audio
 * {@link Asset}. An audio asset can be assigned to a {@link SoundSlot} owned by a
 * {@link SoundComponent}.
 *
 * @category Sound
 */
export class Sound {
    /**
     * Create a new Sound instance.
     *
     * @param {HTMLAudioElement|AudioBuffer} resource - If the Web Audio API is supported, pass an
     * AudioBuffer object, otherwise an Audio object.
     */
    constructor(resource: HTMLAudioElement | AudioBuffer);
    /**
     * If the Web Audio API is not supported this contains the audio data.
     *
     * @type {HTMLAudioElement|undefined}
     */
    audio: HTMLAudioElement | undefined;
    /**
     * If the Web Audio API is supported this contains the audio data.
     *
     * @type {AudioBuffer|undefined}
     */
    buffer: AudioBuffer | undefined;
    /**
     * Gets the duration of the sound. If the sound is not loaded it returns 0.
     *
     * @type {number}
     */
    get duration(): number;
}
