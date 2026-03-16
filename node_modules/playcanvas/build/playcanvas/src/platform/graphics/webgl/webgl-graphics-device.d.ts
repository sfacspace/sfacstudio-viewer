/**
 * WebglGraphicsDevice extends the base {@link GraphicsDevice} to provide rendering capabilities
 * utilizing the WebGL 2.0 specification.
 *
 * @category Graphics
 */
export class WebglGraphicsDevice extends GraphicsDevice {
    /**
     * Creates a new WebglGraphicsDevice instance.
     *
     * @param {HTMLCanvasElement} canvas - The canvas to which the graphics device will render.
     * @param {object} [options] - Options passed when creating the WebGL context.
     * @param {boolean} [options.alpha] - Boolean that indicates if the canvas contains an
     * alpha buffer. Defaults to true.
     * @param {boolean} [options.depth] - Boolean that indicates that the drawing buffer is
     * requested to have a depth buffer of at least 16 bits. Defaults to true.
     * @param {boolean} [options.stencil] - Boolean that indicates that the drawing buffer is
     * requested to have a stencil buffer of at least 8 bits. Defaults to true.
     * @param {boolean} [options.antialias] - Boolean that indicates whether or not to perform
     * anti-aliasing if possible. Defaults to true.
     * @param {boolean} [options.premultipliedAlpha] - Boolean that indicates that the page
     * compositor will assume the drawing buffer contains colors with pre-multiplied alpha.
     * Defaults to true.
     * @param {boolean} [options.preserveDrawingBuffer] - If the value is true the buffers will not
     * be cleared and will preserve their values until cleared or overwritten by the author.
     * Defaults to false.
     * @param {'default'|'high-performance'|'low-power'} [options.powerPreference] - A hint to the
     * user agent indicating what configuration of GPU is suitable for the WebGL context. Possible
     * values are:
     *
     * - 'default': Let the user agent decide which GPU configuration is most suitable. This is the
     * default value.
     * - 'high-performance': Prioritizes rendering performance over power consumption.
     * - 'low-power': Prioritizes power saving over rendering performance.
     *
     * Defaults to 'default'.
     * @param {boolean} [options.failIfMajorPerformanceCaveat] - Boolean that indicates if a
     * context will be created if the system performance is low or if no hardware GPU is available.
     * Defaults to false.
     * @param {boolean} [options.desynchronized] - Boolean that hints the user agent to reduce the
     * latency by desynchronizing the canvas paint cycle from the event loop. Defaults to false.
     * @param {boolean} [options.xrCompatible] - Boolean that hints to the user agent to use a
     * compatible graphics adapter for an immersive XR device.
     * @param {WebGL2RenderingContext} [options.gl] - The rendering context
     * to use. If not specified, a new context will be created.
     */
    constructor(canvas: HTMLCanvasElement, options?: {
        alpha?: boolean;
        depth?: boolean;
        stencil?: boolean;
        antialias?: boolean;
        premultipliedAlpha?: boolean;
        preserveDrawingBuffer?: boolean;
        powerPreference?: "default" | "high-performance" | "low-power";
        failIfMajorPerformanceCaveat?: boolean;
        desynchronized?: boolean;
        xrCompatible?: boolean;
        gl?: WebGL2RenderingContext;
    });
    /**
     * The WebGL2 context managed by the graphics device.
     *
     * @type {WebGL2RenderingContext}
     * @ignore
     */
    gl: WebGL2RenderingContext;
    /**
     * WebGLFramebuffer object that represents the backbuffer of the device for a rendering frame.
     * When null, this is a framebuffer created when the device was created, otherwise it is a
     * framebuffer supplied by the XR session.
     *
     * @ignore
     */
    _defaultFramebuffer: any;
    /**
     * True if the default framebuffer has changed since the last frame.
     *
     * @ignore
     */
    _defaultFramebufferChanged: boolean;
    _contextLostHandler: (event: any) => void;
    _contextRestoredHandler: () => void;
    forceDisableMultisampling: boolean;
    isWebGL2: boolean;
    _deviceType: string;
    _tempEnableSafariTextureUnitWorkaround: boolean;
    _tempMacChromeBlitFramebufferWorkaround: boolean;
    supportsImageBitmap: boolean;
    _samplerTypes: Set<35679 | 35682 | 36289 | 36293 | 36298 | 36299 | 36303 | 36306 | 36307 | 36311 | 35678 | 35680>;
    glAddress: (10497 | 33071 | 33648)[];
    glBlendEquation: (32775 | 32776 | 32774 | 32778 | 32779)[];
    glBlendFunctionColor: (0 | 1 | 768 | 769 | 770 | 771 | 772 | 773 | 774 | 775 | 776 | 32769 | 32770)[];
    glBlendFunctionAlpha: (0 | 1 | 768 | 769 | 770 | 771 | 772 | 773 | 774 | 775 | 776 | 32771 | 32772)[];
    glComparison: (512 | 513 | 514 | 515 | 516 | 517 | 518 | 519)[];
    glStencilOp: (0 | 7680 | 7681 | 7682 | 7683 | 5386 | 34055 | 34056)[];
    glClearFlag: number[];
    glCull: number[];
    glFilter: (9728 | 9729 | 9984 | 9985 | 9986 | 9987)[];
    glPrimitive: (0 | 2 | 1 | 3 | 4 | 5 | 6)[];
    glType: (5131 | 5120 | 5121 | 5122 | 5123 | 5124 | 5125 | 5126)[];
    pcUniformType: {};
    targetToSlot: {};
    commitFunction: {}[];
    constantTexSource: import("../scope-id.js").ScopeId;
    createBackbuffer(frameBuffer: any): void;
    updateBackbufferFormat(framebuffer: any): void;
    updateBackbuffer(): void;
    createVertexBufferImpl(vertexBuffer: any, format: any): WebglVertexBuffer;
    createIndexBufferImpl(indexBuffer: any): WebglIndexBuffer;
    createShaderImpl(shader: any): WebglShader;
    createDrawCommandImpl(drawCommands: any): WebglDrawCommands;
    createTextureImpl(texture: any): WebglTexture;
    createRenderTargetImpl(renderTarget: any): WebglRenderTarget;
    createUploadStreamImpl(uploadStream: any): WebglUploadStream;
    pushMarker(name: any): void;
    popMarker(): void;
    /**
     * Query the precision supported by ints and floats in vertex and fragment shaders. Note that
     * getShaderPrecisionFormat is not guaranteed to be present (such as some instances of the
     * default Android browser). In this case, assume highp is available.
     *
     * @returns {"highp"|"mediump"|"lowp"} The highest precision supported by the WebGL context.
     * @ignore
     */
    getPrecision(): "highp" | "mediump" | "lowp";
    getExtension(...args: any[]): ANGLE_instanced_arrays;
    get extDisjointTimerQuery(): ANGLE_instanced_arrays;
    _extDisjointTimerQuery: ANGLE_instanced_arrays;
    /**
     * Initialize the extensions provided by the WebGL context.
     *
     * @ignore
     */
    initializeExtensions(): void;
    supportedExtensions: string[];
    extColorBufferFloat: ANGLE_instanced_arrays;
    extColorBufferHalfFloat: ANGLE_instanced_arrays;
    extDebugRendererInfo: ANGLE_instanced_arrays;
    extTextureFloatLinear: ANGLE_instanced_arrays;
    extFloatBlend: ANGLE_instanced_arrays;
    extTextureFilterAnisotropic: ANGLE_instanced_arrays;
    extParallelShaderCompile: ANGLE_instanced_arrays;
    extMultiDraw: ANGLE_instanced_arrays;
    extCompressedTextureETC1: ANGLE_instanced_arrays;
    extCompressedTextureETC: ANGLE_instanced_arrays;
    extCompressedTexturePVRTC: ANGLE_instanced_arrays;
    extCompressedTextureS3TC: ANGLE_instanced_arrays;
    extCompressedTextureS3TC_SRGB: ANGLE_instanced_arrays;
    extCompressedTextureATC: ANGLE_instanced_arrays;
    extCompressedTextureASTC: ANGLE_instanced_arrays;
    extTextureCompressionBPTC: ANGLE_instanced_arrays;
    /**
     * Query the capabilities of the WebGL context.
     *
     * @ignore
     */
    initializeCapabilities(): void;
    maxPrecision: "highp" | "mediump" | "lowp";
    supportsMsaa: boolean;
    maxRenderBufferSize: any;
    maxTextures: any;
    maxCombinedTextures: any;
    maxVertexTextures: any;
    vertexUniformsCount: any;
    fragmentUniformsCount: any;
    unmaskedRenderer: any;
    unmaskedVendor: any;
    supportsGpuParticles: boolean;
    supportsAreaLights: boolean;
    cullFace: any;
    stencil: any;
    stencilFuncFront: any;
    stencilFuncBack: any;
    stencilRefFront: any;
    stencilRefBack: any;
    stencilMaskFront: any;
    stencilMaskBack: any;
    stencilFailFront: any;
    stencilFailBack: any;
    stencilZfailFront: any;
    stencilZfailBack: any;
    stencilZpassFront: any;
    stencilZpassBack: any;
    stencilWriteMaskFront: any;
    stencilWriteMaskBack: any;
    alphaToCoverage: any;
    raster: any;
    depthBiasEnabled: boolean;
    clearDepth: any;
    clearColor: Color;
    clearStencil: any;
    unpackFlipY: any;
    unpackPremultiplyAlpha: any;
    initTextureUnits(count?: number): void;
    textureUnits: any[];
    _vaoMap: Map<any, any>;
    boundVao: any;
    activeFramebuffer: any;
    feedback: WebGLTransformFeedback;
    transformFeedbackBuffer: any;
    textureUnit: any;
    /**
     * Set the active rectangle for rendering on the specified device.
     *
     * @param {number} x - The pixel space x-coordinate of the bottom left corner of the viewport.
     * @param {number} y - The pixel space y-coordinate of the bottom left corner of the viewport.
     * @param {number} w - The width of the viewport in pixels.
     * @param {number} h - The height of the viewport in pixels.
     */
    setViewport(x: number, y: number, w: number, h: number): void;
    /**
     * Set the active scissor rectangle on the specified device.
     *
     * @param {number} x - The pixel space x-coordinate of the bottom left corner of the scissor rectangle.
     * @param {number} y - The pixel space y-coordinate of the bottom left corner of the scissor rectangle.
     * @param {number} w - The width of the scissor rectangle in pixels.
     * @param {number} h - The height of the scissor rectangle in pixels.
     */
    setScissor(x: number, y: number, w: number, h: number): void;
    /**
     * Binds the specified framebuffer object.
     *
     * @param {WebGLFramebuffer | null} fb - The framebuffer to bind.
     * @ignore
     */
    setFramebuffer(fb: WebGLFramebuffer | null): void;
    /**
     * Copies source render target into destination render target. Mostly used by post-effects.
     *
     * @param {RenderTarget} [source] - The source render target. Defaults to frame buffer.
     * @param {RenderTarget} [dest] - The destination render target. Defaults to frame buffer.
     * @param {boolean} [color] - If true, will copy the color buffer. Defaults to false.
     * @param {boolean} [depth] - If true, will copy the depth buffer. Defaults to false.
     * @returns {boolean} True if the copy was successful, false otherwise.
     */
    copyRenderTarget(source?: RenderTarget, dest?: RenderTarget, color?: boolean, depth?: boolean): boolean;
    /**
     * Start a render pass.
     *
     * @param {RenderPass} renderPass - The render pass to start.
     * @ignore
     */
    startRenderPass(renderPass: RenderPass): void;
    /**
     * End a render pass.
     *
     * @param {RenderPass} renderPass - The render pass to end.
     * @ignore
     */
    endRenderPass(renderPass: RenderPass): void;
    set defaultFramebuffer(value: any);
    get defaultFramebuffer(): any;
    /**
     * Marks the beginning of a block of rendering. Internally, this function binds the render
     * target currently set on the device. This function should be matched with a call to
     * {@link GraphicsDevice#updateEnd}. Calls to {@link GraphicsDevice#updateBegin} and
     * {@link GraphicsDevice#updateEnd} must not be nested.
     *
     * @ignore
     */
    updateBegin(): void;
    /**
     * Marks the end of a block of rendering. This function should be called after a matching call
     * to {@link GraphicsDevice#updateBegin}. Calls to {@link GraphicsDevice#updateBegin} and
     * {@link GraphicsDevice#updateEnd} must not be nested.
     *
     * @ignore
     */
    updateEnd(): void;
    /**
     * Updates a texture's vertical flip.
     *
     * @param {boolean} flipY - True to flip the texture vertically.
     * @ignore
     */
    setUnpackFlipY(flipY: boolean): void;
    /**
     * Updates a texture to have its RGB channels premultiplied by its alpha channel or not.
     *
     * @param {boolean} premultiplyAlpha - True to premultiply the alpha channel against the RGB
     * channels.
     * @ignore
     */
    setUnpackPremultiplyAlpha(premultiplyAlpha: boolean): void;
    /**
     * Activate the specified texture unit.
     *
     * @param {number} textureUnit - The texture unit to activate.
     * @ignore
     */
    activeTexture(textureUnit: number): void;
    /**
     * If the texture is not already bound on the currently active texture unit, bind it.
     *
     * @param {Texture} texture - The texture to bind.
     * @ignore
     */
    bindTexture(texture: Texture): void;
    /**
     * If the texture is not bound on the specified texture unit, active the texture unit and bind
     * the texture to it.
     *
     * @param {Texture} texture - The texture to bind.
     * @param {number} textureUnit - The texture unit to activate and bind the texture to.
     * @ignore
     */
    bindTextureOnUnit(texture: Texture, textureUnit: number): void;
    /**
     * Update the texture parameters for a given texture if they have changed.
     *
     * @param {Texture} texture - The texture to update.
     * @ignore
     */
    setTextureParameters(texture: Texture): void;
    /**
     * Sets the specified texture on the specified texture unit.
     *
     * @param {Texture} texture - The texture to set.
     * @param {number} textureUnit - The texture unit to set the texture on.
     * @ignore
     */
    setTexture(texture: Texture, textureUnit: number): void;
    createVertexArray(vertexBuffers: any): any;
    unbindVertexArray(): void;
    setBuffers(indexBuffer: any): void;
    _multiDrawLoopFallback(mode: any, primitive: any, indexBuffer: any, numInstances: any, drawCommands: any): void;
    draw(primitive: any, indexBuffer: any, numInstances: any, drawCommands: any, first?: boolean, last?: boolean): void;
    /**
     * Clears the frame buffer of the currently set render target.
     *
     * @param {object} [options] - Optional options object that controls the behavior of the clear
     * operation defined as follows:
     * @param {number[]} [options.color] - The color to clear the color buffer to in the range 0 to
     * 1 for each component.
     * @param {number} [options.depth] - The depth value to clear the depth buffer to in the
     * range 0 to 1. Defaults to 1.
     * @param {number} [options.flags] - The buffers to clear (the types being color, depth and
     * stencil). Can be any bitwise combination of:
     *
     * - {@link CLEARFLAG_COLOR}
     * - {@link CLEARFLAG_DEPTH}
     * - {@link CLEARFLAG_STENCIL}
     *
     * @param {number} [options.stencil] - The stencil value to clear the stencil buffer to.
     * Defaults to 0.
     * @example
     * // Clear color buffer to black and depth buffer to 1
     * device.clear();
     *
     * // Clear just the color buffer to red
     * device.clear({
     *     color: [1, 0, 0, 1],
     *     flags: pc.CLEARFLAG_COLOR
     * });
     *
     * // Clear color buffer to yellow and depth to 1.0
     * device.clear({
     *     color: [1, 1, 0, 1],
     *     depth: 1,
     *     flags: pc.CLEARFLAG_COLOR | pc.CLEARFLAG_DEPTH
     * });
     */
    clear(options?: {
        color?: number[];
        depth?: number;
        flags?: number;
        stencil?: number;
    }): void;
    submit(): void;
    /**
     * Reads a block of pixels from a specified rectangle of the current color framebuffer into an
     * ArrayBufferView object.
     *
     * @param {number} x - The x-coordinate of the rectangle's lower-left corner.
     * @param {number} y - The y-coordinate of the rectangle's lower-left corner.
     * @param {number} w - The width of the rectangle, in pixels.
     * @param {number} h - The height of the rectangle, in pixels.
     * @param {ArrayBufferView} pixels - The ArrayBufferView object that holds the returned pixel
     * data.
     * @ignore
     */
    readPixels(x: number, y: number, w: number, h: number, pixels: ArrayBufferView): void;
    clientWaitAsync(flags: any, interval_ms: any): Promise<any>;
    /**
     * Asynchronously reads a block of pixels from a specified rectangle of the current color framebuffer
     * into an ArrayBufferView object.
     *
     * @param {number} x - The x-coordinate of the rectangle's lower-left corner.
     * @param {number} y - The y-coordinate of the rectangle's lower-left corner.
     * @param {number} w - The width of the rectangle, in pixels.
     * @param {number} h - The height of the rectangle, in pixels.
     * @param {ArrayBufferView} pixels - The ArrayBufferView object that holds the returned pixel
     * data.
     * @ignore
     */
    readPixelsAsync(x: number, y: number, w: number, h: number, pixels: ArrayBufferView): Promise<ArrayBufferView<ArrayBufferLike>>;
    readTextureAsync(texture: any, x: any, y: any, width: any, height: any, options: any): Promise<any>;
    writeTextureAsync(texture: any, x: any, y: any, width: any, height: any, data: any): Promise<void>;
    /**
     * Enables or disables alpha to coverage.
     *
     * @param {boolean} state - True to enable alpha to coverage and false to disable it.
     * @ignore
     */
    setAlphaToCoverage(state: boolean): void;
    /**
     * Sets the output vertex buffer. It will be written to by a shader with transform feedback
     * varyings.
     *
     * @param {VertexBuffer} tf - The output vertex buffer.
     * @ignore
     */
    setTransformFeedbackBuffer(tf: VertexBuffer): void;
    /**
     * Toggles the rasterization render state. Useful with transform feedback, when you only need
     * to process the data without drawing.
     *
     * @param {boolean} on - True to enable rasterization and false to disable it.
     * @ignore
     */
    setRaster(on: boolean): void;
    setStencilTest(enable: any): void;
    setStencilFunc(func: any, ref: any, mask: any): void;
    setStencilFuncFront(func: any, ref: any, mask: any): void;
    setStencilFuncBack(func: any, ref: any, mask: any): void;
    setStencilOperation(fail: any, zfail: any, zpass: any, writeMask: any): void;
    setStencilOperationFront(fail: any, zfail: any, zpass: any, writeMask: any): void;
    setStencilOperationBack(fail: any, zfail: any, zpass: any, writeMask: any): void;
    setBlendState(blendState: any): void;
    setStencilState(stencilFront: any, stencilBack: any): void;
    setDepthState(depthState: any): void;
    setCullMode(cullMode: any): void;
    /**
     * Sets the active shader to be used during subsequent draw calls.
     *
     * @param {Shader} shader - The shader to assign to the device.
     * @param {boolean} [asyncCompile] - If true, rendering will be skipped until the shader is
     * compiled, otherwise the rendering will wait for the shader compilation to finish. Defaults
     * to false.
     */
    setShader(shader: Shader, asyncCompile?: boolean): void;
    activateShader(): void;
    /**
     * Frees memory from all vertex array objects ever allocated with this device.
     *
     * @ignore
     */
    clearVertexArrayObjectCache(): void;
    debugLoseContext(sleep?: number): void;
}
import { GraphicsDevice } from '../graphics-device.js';
import { WebglVertexBuffer } from './webgl-vertex-buffer.js';
import { WebglIndexBuffer } from './webgl-index-buffer.js';
import { WebglShader } from './webgl-shader.js';
import { WebglDrawCommands } from './webgl-draw-commands.js';
import { WebglTexture } from './webgl-texture.js';
import { WebglRenderTarget } from './webgl-render-target.js';
import { WebglUploadStream } from './webgl-upload-stream.js';
import { Color } from '../../../core/math/color.js';
import { RenderTarget } from '../render-target.js';
import type { RenderPass } from '../render-pass.js';
import { Texture } from '../texture.js';
import type { VertexBuffer } from '../vertex-buffer.js';
import type { Shader } from '../shader.js';
