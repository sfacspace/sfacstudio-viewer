/**
 * Used to manage multiple post effects for a camera.
 *
 * @category Graphics
 */
export class PostEffectQueue {
    /**
     * Create a new PostEffectQueue instance.
     *
     * @param {AppBase} app - The application.
     * @param {CameraComponent} camera - The camera component.
     */
    constructor(app: AppBase, camera: CameraComponent);
    app: AppBase;
    camera: CameraComponent;
    /**
     * Render target where the postprocessed image needs to be rendered to. Defaults to null
     * which is main framebuffer.
     *
     * @type {RenderTarget}
     * @ignore
     */
    destinationRenderTarget: RenderTarget;
    /**
     * All of the post effects in the queue.
     *
     * @type {PostEffectEntry[]}
     * @ignore
     */
    effects: PostEffectEntry[];
    /**
     * If the queue is enabled it will render all of its effects, otherwise it will not render
     * anything.
     *
     * @type {boolean}
     * @ignore
     */
    enabled: boolean;
    depthTarget: any;
    /**
     * Allocate a color buffer texture.
     *
     * @param {number} format - The format of the color buffer.
     * @param {string} name - The name of the color buffer.
     * @returns {Texture} The color buffer texture.
     * @private
     */
    private _allocateColorBuffer;
    /**
     * Creates a render target with the dimensions of the canvas, with an optional depth buffer.
     *
     * @param {boolean} useDepth - Set to true to create a render target with a depth buffer.
     * @param {boolean} hdr - Use HDR render target format.
     * @returns {RenderTarget} The render target.
     * @private
     */
    private _createOffscreenTarget;
    _resizeOffscreenTarget(rt: any): void;
    _destroyOffscreenTarget(rt: any): void;
    /**
     * Adds a post effect to the queue. If the queue is disabled adding a post effect will
     * automatically enable the queue.
     *
     * @param {PostEffect} effect - The post effect to add to the queue.
     */
    addEffect(effect: PostEffect): void;
    _sourceTarget: any;
    _newPostEffect: PostEffect;
    /**
     * Removes a post effect from the queue. If the queue becomes empty it will be disabled
     * automatically.
     *
     * @param {PostEffect} effect - The post effect to remove.
     */
    removeEffect(effect: PostEffect): void;
    _requestDepthMaps(): void;
    _releaseDepthMaps(): void;
    _requestDepthMap(): void;
    _releaseDepthMap(): void;
    /**
     * Removes all the effects from the queue and disables it.
     */
    destroy(): void;
    /**
     * Enables the queue and all of its effects. If there are no effects then the queue will not be
     * enabled.
     */
    enable(): void;
    /**
     * Disables the queue and all of its effects.
     */
    disable(): void;
    /**
     * Handler called when the application's canvas element is resized.
     *
     * @param {number} width - The new width of the canvas.
     * @param {number} height - The new height of the canvas.
     * @private
     */
    private _onCanvasResized;
    resizeRenderTargets(): void;
    onCameraRectChanged(name: any, oldValue: any, newValue: any): void;
}
import type { AppBase } from '../../app-base.js';
import type { CameraComponent } from './component.js';
import { RenderTarget } from '../../../platform/graphics/render-target.js';
/**
 * @import { AppBase } from '../../app-base.js'
 * @import { CameraComponent } from './component.js'
 * @import { PostEffect } from '../../../scene/graphics/post-effect.js'
 */
declare class PostEffectEntry {
    constructor(effect: any, inputTarget: any);
    effect: any;
    inputTarget: any;
    outputTarget: any;
    name: any;
}
import type { PostEffect } from '../../../scene/graphics/post-effect.js';
export {};
