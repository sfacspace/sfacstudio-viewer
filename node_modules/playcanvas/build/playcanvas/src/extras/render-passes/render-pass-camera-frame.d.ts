/**
 * Render pass implementation of a common camera frame rendering with integrated  post-processing
 * effects.
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassCameraFrame extends RenderPass {
    constructor(app: any, cameraFrame: any, cameraComponent: any, options?: {});
    app: any;
    prePass: any;
    scenePass: any;
    composePass: any;
    bloomPass: any;
    ssaoPass: any;
    taaPass: any;
    scenePassHalf: any;
    dofPass: any;
    _renderTargetScale: number;
    /**
     * True if the render pass needs to be re-created because layers have been added or removed.
     *
     * @type {boolean}
     * @ignore
     */
    layersDirty: boolean;
    /**
     * The camera frame that this render pass belongs to.
     *
     * @type {CameraFrame}
     */
    cameraFrame: CameraFrame;
    /**
     * @type {RenderTarget|null}
     * @private
     */
    private rt;
    cameraComponent: any;
    reset(): void;
    sceneTexture: Texture;
    sceneTextureHalf: Texture;
    rtHalf: RenderTarget;
    scenePassTransparent: RenderPassForward;
    colorGrabPass: RenderPassColorGrab;
    afterPass: RenderPassForward;
    sanitizeOptions(options: any): any;
    set renderTargetScale(value: number);
    get renderTargetScale(): number;
    needsReset(options: any): boolean;
    update(options: any): void;
    createRenderTarget(name: any, depth: any, stencil: any, samples: any, flipY: any): RenderTarget;
    setupRenderPasses(options: any): void;
    hdrFormat: number;
    _bloomEnabled: boolean;
    _sceneHalfEnabled: any;
    sceneOptions: {
        resizeSource: any;
        scaleX: number;
        scaleY: number;
    };
    collectPasses(): any[];
    createPasses(options: any): void;
    setupScenePrepass(options: any): void;
    setupScenePassSettings(pass: any): void;
    setupScenePass(options: any): {
        lastAddedIndex: number;
        clearRenderTarget: boolean;
    };
    setupSsaoPass(options: any): void;
    setupSceneHalfPass(options: any, sourceTexture: any): void;
    setupBloomPass(options: any, inputTexture: any): void;
    setupDofPass(options: any, inputTexture: any, inputTextureHalf: any): void;
    setupTaaPass(options: any): Texture;
    setupComposePass(options: any): void;
    setupAfterPass(options: any, scenePassesInfo: any): void;
}
/**
 * @import { CameraFrame } from './camera-frame.js'
 */
/**
 * Options used to configure the RenderPassCameraFrame. To modify these options, you must create
 * a new instance of the RenderPassCameraFrame with the desired settings.
 *
 * @ignore
 */
export class CameraFrameOptions {
    formats: any;
    stencil: boolean;
    samples: number;
    sceneColorMap: boolean;
    lastGrabLayerId: number;
    lastGrabLayerIsTransparent: boolean;
    lastSceneLayerId: number;
    lastSceneLayerIsTransparent: boolean;
    taaEnabled: boolean;
    bloomEnabled: boolean;
    ssaoType: string;
    ssaoBlurEnabled: boolean;
    prepassEnabled: boolean;
    dofEnabled: boolean;
    dofNearBlur: boolean;
    dofHighQuality: boolean;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
import type { CameraFrame } from './camera-frame.js';
import { Texture } from '../../platform/graphics/texture.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
import { RenderPassForward } from '../../scene/renderer/render-pass-forward.js';
import { RenderPassColorGrab } from '../../scene/graphics/render-pass-color-grab.js';
