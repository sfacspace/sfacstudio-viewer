export class CssHandler extends ResourceHandler {
    constructor(app: any);
    /**
     * TextDecoder for decoding binary data.
     *
     * @type {TextDecoder|null}
     * @private
     */
    private decoder;
    load(url: any, callback: any): void;
    /**
     * Parses raw DataView and returns string.
     *
     * @param {DataView} data - The raw data as a DataView
     * @returns {string} The parsed resource data.
     */
    openBinary(data: DataView): string;
}
import { ResourceHandler } from './handler.js';
