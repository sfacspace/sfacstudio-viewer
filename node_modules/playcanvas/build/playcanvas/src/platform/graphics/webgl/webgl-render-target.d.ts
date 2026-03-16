/**
 * A WebGL implementation of the RenderTarget.
 *
 * @ignore
 */
export class WebglRenderTarget {
    _glFrameBuffer: any;
    _glDepthBuffer: any;
    _glResolveFrameBuffer: any;
    /**
     * A list of framebuffers created When MSAA and MRT are used together, one for each color buffer.
     * This allows color buffers to be resolved separately.
     *
     * @type {FramebufferPair[]}
     */
    colorMrtFramebuffers: FramebufferPair[];
    _glMsaaColorBuffers: any[];
    _glMsaaDepthBuffer: any;
    /**
     * Key used to store _glMsaaDepthBuffer in the cache.
     */
    msaaDepthBufferKey: any;
    /**
     * The supplied single-sampled framebuffer for rendering. Undefined represents no supplied
     * framebuffer. Null represents the default framebuffer. A value represents a user-supplied
     * framebuffer.
     */
    suppliedColorFramebuffer: any;
    _isInitialized: boolean;
    destroy(device: any): void;
    get initialized(): boolean;
    init(device: any, target: any): void;
    _createMsaaMrtFramebuffers(device: any, target: any, colorBufferCount: any): void;
    /**
     * Checks the completeness status of the currently bound WebGLFramebuffer object.
     *
     * @param {WebglGraphicsDevice} device - The graphics device.
     * @param {RenderTarget} target - The render target.
     * @param {string} [type] - An optional type string to append to the error message.
     * @private
     */
    private _checkFbo;
    loseContext(): void;
    internalResolve(device: any, src: any, dst: any, target: any, mask: any): void;
    resolve(device: any, target: any, color: any, depth: any): void;
}
/**
 * @import { RenderTarget } from '../render-target.js'
 * @import { WebglGraphicsDevice } from './webgl-graphics-device.js'
 */
/**
 * A private class representing a pair of framebuffers, when MSAA is used.
 *
 * @ignore
 */
declare class FramebufferPair {
    /**
     * @param {WebGLFramebuffer} msaaFB - Multi-sampled rendering framebuffer.
     * @param {WebGLFramebuffer} resolveFB - Single-sampled resolve framebuffer.
     */
    constructor(msaaFB: WebGLFramebuffer, resolveFB: WebGLFramebuffer);
    /**
     * Multi-sampled rendering framebuffer.
     *
     * @type {WebGLFramebuffer|null}
     */
    msaaFB: WebGLFramebuffer | null;
    /**
     * Single-sampled resolve framebuffer.
     *
     * @type {WebGLFramebuffer|null}
     */
    resolveFB: WebGLFramebuffer | null;
    /**
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     */
    destroy(gl: WebGLRenderingContext): void;
}
export {};
