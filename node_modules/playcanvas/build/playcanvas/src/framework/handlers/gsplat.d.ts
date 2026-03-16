/**
 * @import { AppBase } from '../app-base.js'
 */
export class GSplatHandler extends ResourceHandler {
    /**
     * Create a new GSplatHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    parsers: {
        ply: PlyParser;
        sog: SogBundleParser;
        json: SogsParser;
        octree: GSplatOctreeParser;
    };
    _getUrlWithoutParams(url: any): any;
    _getParser(url: any): any;
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any, asset: any): any;
}
import { ResourceHandler } from './handler.js';
import { PlyParser } from '../parsers/ply.js';
import { SogBundleParser } from '../parsers/sog-bundle.js';
import { SogsParser } from '../parsers/sogs.js';
import { GSplatOctreeParser } from '../parsers/gsplat-octree.js';
import type { AppBase } from '../app-base.js';
