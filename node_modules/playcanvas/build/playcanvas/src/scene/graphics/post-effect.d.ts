/**
 * Base class for all post effects. Post effects take a a render target as input apply effects to
 * it and then render the result to an output render target or the screen if no output is
 * specified.
 *
 * @category Graphics
 */
export class PostEffect {
    /**
     * A simple vertex shader used to render a quad, which requires 'vec2 aPosition' in the vertex
     * buffer, and generates uv coordinates vUv0 for use in the fragment shader.
     *
     * @type {string}
     */
    static quadVertexShader: string;
    /**
     * Create a new PostEffect instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device of the application.
     */
    constructor(graphicsDevice: GraphicsDevice);
    /**
     * The graphics device of the application.
     *
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * The property that should to be set to `true` (by the custom post effect) if a depth map
     * is necessary (default is false).
     *
     * @type {boolean}
     */
    needsDepthBuffer: boolean;
    /**
     * Render the post effect using the specified inputTarget to the specified outputTarget.
     *
     * @param {RenderTarget} inputTarget - The input render target.
     * @param {RenderTarget} outputTarget - The output render target. If null then this will be the
     * screen.
     * @param {Vec4} [rect] - The rect of the current camera. If not specified, it will default to
     * `[0, 0, 1, 1]`.
     */
    render(inputTarget: RenderTarget, outputTarget: RenderTarget, rect?: Vec4): void;
    /**
     * Draw a screen-space rectangle in a render target, using a specified shader.
     *
     * @param {RenderTarget|null} target - The output render target.
     * @param {Shader} shader - The shader to be used for drawing the rectangle.
     * @param {Vec4} [rect] - The normalized screen-space position (rect.x, rect.y) and size (rect.z,
     * rect.w) of the rectangle. Default is `[0, 0, 1, 1]`.
     */
    drawQuad(target: RenderTarget | null, shader: Shader, rect?: Vec4): void;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { RenderTarget } from '../../platform/graphics/render-target.js';
import { Vec4 } from '../../core/math/vec4.js';
import type { Shader } from '../../platform/graphics/shader.js';
