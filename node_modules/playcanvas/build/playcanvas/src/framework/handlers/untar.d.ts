/**
 * A utility class for untaring archives from a fetch request. It processes files from a tar file
 * in a streamed manner, so asset parsing can happen in parallel instead of all at once at the end.
 */
export class Untar extends EventHandler {
    /**
     * Create an instance of an Untar.
     *
     * @param {Promise} fetchPromise - A Promise object returned from a fetch request.
     * @param {string} assetsPrefix - Assets registry files prefix.
     */
    constructor(fetchPromise: Promise<any>, assetsPrefix?: string);
    /**
     * @type {number}
     * @private
     */
    private headerSize;
    /**
     * @type {number}
     * @private
     */
    private paddingSize;
    /**
     * @type {number}
     * @private
     */
    private bytesRead;
    /**
     * @type {number}
     * @private
     */
    private bytesReceived;
    /**
     * @type {boolean}
     * @private
     */
    private headerRead;
    /**
     * @type {ReadableStream|null}
     * @private
     */
    private reader;
    /**
     * @type {Uint8Array}
     * @private
     */
    private data;
    /**
     * @type {TextDecoder|null}
     * @private
     */
    private decoder;
    /**
     * @type {string}
     * @private
     */
    private prefix;
    /**
     * @type {string}
     * @private
     */
    private fileName;
    /**
     * @type {number}
     * @private
     */
    private fileSize;
    /**
     * @type {string}
     * @private
     */
    private fileType;
    /**
     * @type {string}
     * @private
     */
    private ustarFormat;
    /**
     * This method is called multiple times when the stream provides data.
     *
     * @param {boolean} done - True when reading data is complete.
     * @param {Uint8Array} value - Chunk of data read from a stream.
     * @returns {Promise|null} Return new pump Promise or null when no more data is available.
     */
    pump(done: boolean, value: Uint8Array): Promise<any> | null;
    /**
     * Attempt to read file from an available data buffer
     *
     * @returns {boolean} True if file was successfully read and more data is potentially available for
     * processing.
     */
    readFile(): boolean;
}
import { EventHandler } from '../../core/event-handler.js';
