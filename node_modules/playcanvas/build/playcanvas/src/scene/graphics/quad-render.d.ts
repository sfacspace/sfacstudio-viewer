/**
 * An object that renders a quad using a {@link Shader}.
 *
 * Example:
 *
 * ```javascript
 * const shader = pc.ShaderUtils.createShader(app.graphicsDevice, {
 *     uniqueName: 'MyShader',
 *     attributes: { aPosition: SEMANTIC_POSITION },
 *     vertexGLSL: '// vertex shader code',
 *     fragmentGLSL: '// fragment shader code'
 * });
 * const quad = new QuadRender(shader);
 * quad.render();
 * quad.destroy();
 * ```
 *
 * @category Graphics
 */
export class QuadRender {
    /**
     * Create a new QuadRender instance.
     *
     * @param {Shader} shader - The shader to be used to render the quad.
     */
    constructor(shader: Shader);
    /**
     * @type {UniformBuffer}
     * @ignore
     */
    uniformBuffer: UniformBuffer;
    /**
     * @type {BindGroup}
     * @ignore
     */
    bindGroup: BindGroup;
    shader: Shader;
    /**
     * Destroys the resources associated with this instance.
     */
    destroy(): void;
    /**
     * Renders the quad. If the viewport is provided, the original viewport and scissor is restored
     * after the rendering.
     *
     * @param {Vec4} [viewport] - The viewport rectangle of the quad, in pixels. The viewport is
     * not changed if not provided.
     * @param {Vec4} [scissor] - The scissor rectangle of the quad, in pixels. Used only if the
     * viewport is provided.
     */
    render(viewport?: Vec4, scissor?: Vec4): void;
}
import { UniformBuffer } from '../../platform/graphics/uniform-buffer.js';
import { BindGroup } from '../../platform/graphics/bind-group.js';
import type { Shader } from '../../platform/graphics/shader.js';
import { Vec4 } from '../../core/math/vec4.js';
