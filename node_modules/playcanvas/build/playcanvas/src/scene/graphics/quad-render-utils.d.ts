/**
 * Draws a screen-space quad using a specific shader.
 *
 * @param {GraphicsDevice} device - The graphics device used to draw the quad.
 * @param {RenderTarget|null} target - The destination render target. If undefined, target is the
 * frame buffer.
 * @param {Shader} shader - The shader used for rendering the quad. Vertex shader should contain
 * `attribute vec2 vertex_position`.
 * @param {Vec4} [rect] - The viewport rectangle of the quad, in pixels. Defaults to fullscreen:
 * `[0, 0, target.width, target.height]`.
 * @param {Vec4} [scissorRect] - The scissor rectangle of the quad, in pixels. Defaults to fullscreen:
 * `[0, 0, target.width, target.height]`.
 * @category Graphics
 */
export function drawQuadWithShader(device: GraphicsDevice, target: RenderTarget | null, shader: Shader, rect?: Vec4, scissorRect?: Vec4, ...args: any[]): void;
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { RenderTarget } from '../../platform/graphics/render-target.js';
import type { Shader } from '../../platform/graphics/shader.js';
import { Vec4 } from '../../core/math/vec4.js';
