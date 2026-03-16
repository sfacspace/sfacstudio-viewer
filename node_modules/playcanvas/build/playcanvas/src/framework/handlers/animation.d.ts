/**
 * @import { AppBase } from '../app-base.js'
 */
/**
 * Resource handler used for loading {@link Animation} resources.
 *
 * @category Animation
 */
export class AnimationHandler extends ResourceHandler {
    /**
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    device: import("../../index.js").GraphicsDevice;
    assets: import("../asset/asset-registry.js").AssetRegistry;
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any, asset: any): any;
    _parseAnimationV3(data: any): Animation;
    _parseAnimationV4(data: any): Animation;
}
import { ResourceHandler } from './handler.js';
import { Animation } from '../../scene/animation/animation.js';
import type { AppBase } from '../app-base.js';
