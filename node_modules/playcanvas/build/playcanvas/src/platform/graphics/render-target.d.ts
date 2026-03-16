/**
 * A render target is a rectangular rendering surface.
 *
 * @category Graphics
 */
export class RenderTarget {
    /**
     * Creates a new RenderTarget instance. A color buffer or a depth buffer must be set.
     *
     * @param {object} [options] - Object for passing optional arguments.
     * @param {boolean} [options.autoResolve] - If samples > 1, enables or disables automatic MSAA
     * resolve after rendering to this RT (see {@link RenderTarget#resolve}). Defaults to true.
     * @param {Texture} [options.colorBuffer] - The texture that this render target will treat as a
     * rendering surface.
     * @param {Texture[]} [options.colorBuffers] - The textures that this render target will treat
     * as a rendering surfaces. If this option is set, the colorBuffer option is ignored.
     * @param {boolean} [options.depth] - If set to true, depth buffer will be created. Defaults to
     * true. Ignored if depthBuffer is defined.
     * @param {Texture} [options.depthBuffer] - The texture that this render target will treat as a
     * depth/stencil surface (WebGL2 only). If set, the 'depth' and 'stencil' properties are
     * ignored. Texture must have {@link PIXELFORMAT_DEPTH} or {@link PIXELFORMAT_DEPTHSTENCIL}
     * format.
     * @param {number} [options.mipLevel] - If set to a number greater than 0, the render target
     * will render to the specified mip level of the color buffer. Defaults to 0.
     * @param {number} [options.face] - If the colorBuffer parameter is a cubemap, use this option
     * to specify the face of the cubemap to render to. Can be:
     *
     * - {@link CUBEFACE_POSX}
     * - {@link CUBEFACE_NEGX}
     * - {@link CUBEFACE_POSY}
     * - {@link CUBEFACE_NEGY}
     * - {@link CUBEFACE_POSZ}
     * - {@link CUBEFACE_NEGZ}
     *
     * Defaults to {@link CUBEFACE_POSX}.
     * @param {boolean} [options.flipY] - When set to true the image will be flipped in Y. Default
     * is false.
     * @param {string} [options.name] - The name of the render target.
     * @param {number} [options.samples] - Number of hardware anti-aliasing samples. Default is 1.
     * @param {boolean} [options.stencil] - If set to true, depth buffer will include stencil.
     * Defaults to false. Ignored if depthBuffer is defined or depth is false.
     * @example
     * // Create a 512x512x24-bit render target with a depth buffer
     * const colorBuffer = new pc.Texture(graphicsDevice, {
     *     width: 512,
     *     height: 512,
     *     format: pc.PIXELFORMAT_RGB8
     * });
     * const renderTarget = new pc.RenderTarget({
     *     colorBuffer: colorBuffer,
     *     depth: true
     * });
     *
     * // Set the render target on a camera component
     * camera.renderTarget = renderTarget;
     *
     * // Destroy render target at a later stage. Note that the color buffer needs
     * // to be destroyed separately.
     * renderTarget.colorBuffer.destroy();
     * renderTarget.destroy();
     * camera.renderTarget = null;
     */
    constructor(options?: {
        autoResolve?: boolean;
        colorBuffer?: Texture;
        colorBuffers?: Texture[];
        depth?: boolean;
        depthBuffer?: Texture;
        mipLevel?: number;
        face?: number;
        flipY?: boolean;
        name?: string;
        samples?: number;
        stencil?: boolean;
    });
    /**
     * The name of the render target.
     *
     * @type {string}
     */
    name: string;
    /**
     * @type {GraphicsDevice}
     * @private
     */
    private _device;
    /**
     * @type {Texture}
     * @private
     */
    private _colorBuffer;
    /**
     * @type {Texture[]}
     * @private
     */
    private _colorBuffers;
    /**
     * @type {Texture}
     * @private
     */
    private _depthBuffer;
    /**
     * @type {boolean}
     * @private
     */
    private _depth;
    /**
     * @type {boolean}
     * @private
     */
    private _stencil;
    /**
     * @type {number}
     * @private
     */
    private _samples;
    /** @type {boolean} */
    autoResolve: boolean;
    /**
     * @type {number}
     * @private
     */
    private _face;
    /**
     * @type {number}
     * @private
     */
    private _mipLevel;
    /**
     * True if the mipmaps should be automatically generated for the color buffer(s) if it contains
     * a mip chain.
     *
     * @type {boolean}
     * @private
     */
    private _mipmaps;
    /**
     * @type {number | undefined}
     * @private
     */
    private _width;
    /**
     * @type {number | undefined}
     * @private
     */
    private _height;
    /** @type {boolean} */
    flipY: boolean;
    id: number;
    impl: any;
    /**
     * Frees resources associated with this render target.
     */
    destroy(): void;
    /**
     * Free device resources associated with this render target.
     *
     * @ignore
     */
    destroyFrameBuffers(): void;
    /**
     * Free textures associated with this render target.
     *
     * @ignore
     */
    destroyTextureBuffers(): void;
    /**
     * Resizes the render target to the specified width and height. Internally this resizes all the
     * assigned texture color and depth buffers.
     *
     * @param {number} width - The width of the render target in pixels.
     * @param {number} height - The height of the render target in pixels.
     */
    resize(width: number, height: number): void;
    validateMrt(): void;
    /**
     * Evaluates and stores the width and height of the render target based on the color/depth
     * buffers and mip level.
     *
     * @private
     */
    private evaluateDimensions;
    /**
     * Initializes the resources associated with this render target.
     *
     * @ignore
     */
    init(): void;
    /** @ignore */
    get initialized(): any;
    /** @ignore */
    get device(): GraphicsDevice;
    /**
     * Called when the device context was lost. It releases all context related resources.
     *
     * @ignore
     */
    loseContext(): void;
    /**
     * If samples > 1, resolves the anti-aliased render target (WebGL2 only). When you're rendering
     * to an anti-aliased render target, pixels aren't written directly to the readable texture.
     * Instead, they're first written to a MSAA buffer, where each sample for each pixel is stored
     * independently. In order to read the results, you first need to 'resolve' the buffer - to
     * average all samples and create a simple texture with one color per pixel. This function
     * performs this averaging and updates the colorBuffer and the depthBuffer. If autoResolve is
     * set to true, the resolve will happen after every rendering to this render target, otherwise
     * you can do it manually, during the app update or similar.
     *
     * @param {boolean} [color] - Resolve color buffer. Defaults to true.
     * @param {boolean} [depth] - Resolve depth buffer. Defaults to true if the render target has a
     * depth buffer.
     */
    resolve(color?: boolean, depth?: boolean): void;
    /**
     * Copies color and/or depth contents of source render target to this one. Formats, sizes and
     * anti-aliasing samples must match. Depth buffer can only be copied on WebGL 2.0.
     *
     * @param {RenderTarget} source - Source render target to copy from.
     * @param {boolean} [color] - If true, will copy the color buffer. Defaults to false.
     * @param {boolean} [depth] - If true, will copy the depth buffer. Defaults to false.
     * @returns {boolean} True if the copy was successful, false otherwise.
     */
    copy(source: RenderTarget, color?: boolean, depth?: boolean): boolean;
    /**
     * Number of antialiasing samples the render target uses.
     *
     * @type {number}
     */
    get samples(): number;
    /**
     * True if the render target contains the depth attachment.
     *
     * @type {boolean}
     */
    get depth(): boolean;
    /**
     * True if the render target contains the stencil attachment.
     *
     * @type {boolean}
     */
    get stencil(): boolean;
    /**
     * Color buffer set up on the render target.
     *
     * @type {Texture}
     */
    get colorBuffer(): Texture;
    /**
     * Accessor for multiple render target color buffers.
     *
     * @param {*} index - Index of the color buffer to get.
     * @returns {Texture} - Color buffer at the specified index.
     */
    getColorBuffer(index: any): Texture;
    /**
     * Depth buffer set up on the render target. Only available, if depthBuffer was set in
     * constructor. Not available if depth property was used instead.
     *
     * @type {Texture}
     */
    get depthBuffer(): Texture;
    /**
     * If the render target is bound to a cubemap, this property specifies which face of the
     * cubemap is rendered to. Can be:
     *
     * - {@link CUBEFACE_POSX}
     * - {@link CUBEFACE_NEGX}
     * - {@link CUBEFACE_POSY}
     * - {@link CUBEFACE_NEGY}
     * - {@link CUBEFACE_POSZ}
     * - {@link CUBEFACE_NEGZ}
     *
     * @type {number}
     */
    get face(): number;
    /**
     * Mip level of the render target.
     *
     * @type {number}
     */
    get mipLevel(): number;
    /**
     * True if the mipmaps are automatically generated for the color buffer(s) if it contains
     * a mip chain.
     *
     * @type {boolean}
     */
    get mipmaps(): boolean;
    /**
     * Width of the render target in pixels.
     *
     * @type {number}
     */
    get width(): number;
    /**
     * Height of the render target in pixels.
     *
     * @type {number}
     */
    get height(): number;
    /**
     * Gets whether the format of the specified color buffer is sRGB.
     *
     * @param {number} index - The index of the color buffer.
     * @returns {boolean} True if the color buffer is sRGB, false otherwise.
     * @ignore
     */
    isColorBufferSrgb(index?: number): boolean;
}
import { GraphicsDevice } from './graphics-device.js';
import type { Texture } from './texture.js';
