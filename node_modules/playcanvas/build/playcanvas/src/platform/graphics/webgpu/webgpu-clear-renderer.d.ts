/**
 * A WebGPU helper class implementing a viewport clear operation. When rendering to a texture,
 * the whole surface can be cleared using loadOp, but if only a viewport needs to be cleared, or if
 * it needs to be cleared later during the rendering, this need to be achieved by rendering a quad.
 * This class renders a full-screen quad, and expects the viewport / scissor to be set up to clip
 * it to only required area.
 *
 * @ignore
 */
export class WebgpuClearRenderer {
    constructor(device: any);
    shader: Shader;
    uniformBuffer: UniformBuffer;
    dynamicBindGroup: DynamicBindGroup;
    colorData: Float32Array<ArrayBuffer>;
    destroy(): void;
    clear(device: any, renderTarget: any, options: any, defaultOptions: any): void;
}
import { Shader } from '../shader.js';
import { UniformBuffer } from '../uniform-buffer.js';
import { DynamicBindGroup } from '../bind-group.js';
