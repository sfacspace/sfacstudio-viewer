/**
 * A render pass represents a node in the frame graph, and encapsulates a system which
 * renders to a render target using an execution callback.
 *
 * @ignore
 */
export class RenderPass {
    /**
     * Creates an instance of the RenderPass.
     *
     * @param {GraphicsDevice} graphicsDevice - The
     * graphics device.
     */
    constructor(graphicsDevice: GraphicsDevice);
    /** @type {string} */
    _name: string;
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * True if the render pass is enabled.
     *
     * @type {boolean}
     * @private
     */
    private _enabled;
    /**
     * True if the render pass start is skipped. This means the render pass is merged into the
     * previous one.
     *
     * @type {boolean}
     * @private
     */
    private _skipStart;
    /**
     * True if the render pass end is skipped. This means the following render pass is merged into
     * this one.
     *
     * @type {boolean}
     * @private
     */
    private _skipEnd;
    /**
     * True if the render pass is enabled and execute function will be called. Note that before and
     * after functions are called regardless of this flag.
     */
    executeEnabled: boolean;
    /**
     * The render target for this render pass:
     *
     * - `undefined`: render pass does not render to any render target
     * - `null`: render pass renders to the backbuffer
     * - Otherwise, renders to the provided RT.
     *
     * @type {RenderTarget|null|undefined}
     */
    renderTarget: RenderTarget | null | undefined;
    /**
     * The options specified when the render target was initialized.
     */
    _options: any;
    /**
     * Number of samples. 0 if no render target, otherwise number of samples from the render target,
     * or the main framebuffer if render target is null.
     *
     * @type {number}
     */
    samples: number;
    /**
     * Array of color attachment operations. The first element corresponds to the color attachment
     * 0, and so on.
     *
     * @type {Array<ColorAttachmentOps>}
     */
    colorArrayOps: Array<ColorAttachmentOps>;
    /**
     * Color attachment operations for the first color attachment.
     *
     * @type {ColorAttachmentOps}
     */
    get colorOps(): ColorAttachmentOps;
    /** @type {DepthStencilAttachmentOps} */
    depthStencilOps: DepthStencilAttachmentOps;
    /**
     * If true, this pass might use dynamically rendered cubemaps. Use for a case where rendering to cubemap
     * faces is interleaved with rendering to shadows, to avoid generating cubemap mipmaps. This will likely
     * be retired when render target dependency tracking gets implemented.
     *
     * @type {boolean}
     */
    requiresCubemaps: boolean;
    /**
     * True if the render pass uses the full viewport / scissor for rendering into the render target.
     *
     * @type {boolean}
     */
    fullSizeClearRect: boolean;
    /**
     * Render passes which need to be executed before this pass.
     *
     * @type {RenderPass[]}
     */
    beforePasses: RenderPass[];
    /**
     * Render passes which need to be executed after this pass.
     *
     * @type {RenderPass[]}
     */
    afterPasses: RenderPass[];
    set name(value: string);
    get name(): string;
    set scaleX(value: any);
    get scaleX(): any;
    set scaleY(value: any);
    get scaleY(): any;
    set options(value: any);
    get options(): any;
    /**
     * @param {RenderTarget|null} [renderTarget] - The render target to render into (output). This
     * function should be called only for render passes which use render target, or passes which
     * render directly into the default framebuffer, in which case a null or undefined render
     * target is expected.
     * @param {object} [options] - Object for passing optional arguments.
     * @param {Texture} [options.resizeSource] - A texture to use as a source for the automatic
     * render target resize operation. If not provided, no automatic resizing takes place.
     * @param {number} [options.scaleX] - The scale factor for the render target width. Defaults to 1.
     * @param {number} [options.scaleY] - The scale factor for the render target height. Defaults to 1.
     */
    init(renderTarget?: RenderTarget | null, options?: {
        resizeSource?: Texture;
        scaleX?: number;
        scaleY?: number;
    }): void;
    allocateAttachments(): void;
    destroy(): void;
    postInit(): void;
    frameUpdate(): void;
    before(): void;
    execute(): void;
    after(): void;
    onEnable(): void;
    onDisable(): void;
    set enabled(value: boolean);
    get enabled(): boolean;
    /**
     * Mark render pass as clearing the full color buffer.
     *
     * @param {Color|undefined} color - The color to clear to, or undefined to preserve the existing
     * content.
     */
    setClearColor(color: Color | undefined): void;
    /**
     * Mark render pass as clearing the full depth buffer.
     *
     * @param {number|undefined} depthValue - The depth value to clear to, or undefined to preserve
     * the existing content.
     */
    setClearDepth(depthValue: number | undefined): void;
    /**
     * Mark render pass as clearing the full stencil buffer.
     *
     * @param {number|undefined} stencilValue - The stencil value to clear to, or undefined to
     * preserve the existing content.
     */
    setClearStencil(stencilValue: number | undefined): void;
    /**
     * Render the render pass
     */
    render(): void;
    log(device: any, index?: number): void;
}
import type { GraphicsDevice } from '../graphics/graphics-device.js';
import type { RenderTarget } from '../graphics/render-target.js';
/**
 * @import { GraphicsDevice } from '../graphics/graphics-device.js'
 * @import { RenderTarget } from '../graphics/render-target.js'
 * @import { Texture } from './texture.js'
 */
declare class ColorAttachmentOps {
    /**
     * A color used to clear the color attachment when the clear is enabled, specified in sRGB space.
     */
    clearValue: Color;
    /**
     * A color used to clear the color attachment when the clear is enabled, specified in linear
     * space.
     */
    clearValueLinear: Color;
    /**
     * True if the attachment should be cleared before rendering, false to preserve
     * the existing content.
     */
    clear: boolean;
    /**
     * True if the attachment needs to be stored after the render pass. False if it can be
     * discarded. Note: This relates to the surface that is getting rendered to, and can be either
     * single or multi-sampled. Further, if a multi-sampled surface is used, the resolve flag
     * further specifies if this gets resolved to a single-sampled surface. This behavior matches
     * the WebGPU specification.
     *
     * @type {boolean}
     */
    store: boolean;
    /**
     * True if the attachment needs to be resolved.
     *
     * @type {boolean}
     */
    resolve: boolean;
    /**
     * True if the attachment needs to have mipmaps generated.
     *
     * @type {boolean}
     */
    genMipmaps: boolean;
}
declare class DepthStencilAttachmentOps {
    /**
     * A depth value used to clear the depth attachment when the clear is enabled.
     */
    clearDepthValue: number;
    /**
     * A stencil value used to clear the stencil attachment when the clear is enabled.
     */
    clearStencilValue: number;
    /**
     * True if the depth attachment should be cleared before rendering, false to preserve
     * the existing content.
     */
    clearDepth: boolean;
    /**
     * True if the stencil attachment should be cleared before rendering, false to preserve
     * the existing content.
     */
    clearStencil: boolean;
    /**
     * True if the depth attachment needs to be stored after the render pass. False
     * if it can be discarded.
     *
     * @type {boolean}
     */
    storeDepth: boolean;
    /**
     * True if the depth attachment needs to be resolved.
     *
     * @type {boolean}
     */
    resolveDepth: boolean;
    /**
     * True if the stencil attachment needs to be stored after the render pass. False
     * if it can be discarded.
     *
     * @type {boolean}
     */
    storeStencil: boolean;
}
import type { Texture } from './texture.js';
import { Color } from '../../core/math/color.js';
export {};
