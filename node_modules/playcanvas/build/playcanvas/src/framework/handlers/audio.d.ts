/**
 * Resource handler used for loading {@link Sound} resources.
 *
 * @category Sound
 */
export class AudioHandler extends ResourceHandler {
    /**
     * Create a new AudioHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    manager: import("../../index.js").SoundManager;
    _isSupported(url: any): boolean;
    load(url: any, callback: any): void;
    /**
     * Loads an audio asset using an AudioContext by URL and calls success or error with the
     * created resource or error respectively.
     *
     * @param {string} url - The url of the audio asset.
     * @param {Function} success - Function to be called if the audio asset was loaded or if we
     * just want to continue without errors even if the audio is not loaded.
     * @param {Function} error - Function to be called if there was an error while loading the
     * audio asset.
     * @private
     */
    private _createSound;
}
import { ResourceHandler } from './handler.js';
import type { AppBase } from '../app-base.js';
