/**
 * Callback used by {@link ModelHandler#addParser} to decide on which parser to use.
 */
export type AddParserCallback = (url: string, data: object) => boolean;
/**
 * @import { AppBase } from '../app-base.js'
 */
/**
 * @callback AddParserCallback
 * Callback used by {@link ModelHandler#addParser} to decide on which parser to use.
 * @param {string} url - The resource url.
 * @param {object} data - The raw model data.
 * @returns {boolean} Return true if this parser should be used to parse the data into a
 * {@link Model}.
 */
/**
 * Resource handler used for loading {@link Model} resources.
 *
 * @category Graphics
 */
export class ModelHandler extends ResourceHandler {
    /**
     * Create a new ModelHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    _parsers: any[];
    device: import("../../index.js").GraphicsDevice;
    assets: import("../asset/asset-registry.js").AssetRegistry;
    defaultMaterial: import("../../index.js").StandardMaterial;
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any): any;
    patch(asset: any, assets: any): void;
    /**
     * Add a parser that converts raw data into a {@link Model}. Default parser is for JSON models.
     *
     * @param {object} parser - See JsonModelParser for example.
     * @param {AddParserCallback} decider - Function that decides on which parser to use. Function
     * should take (url, data) arguments and return true if this parser should be used to parse the
     * data into a {@link Model}. The first parser to return true is used.
     */
    addParser(parser: object, decider: AddParserCallback): void;
}
import { ResourceHandler } from './handler.js';
import type { AppBase } from '../app-base.js';
