export class WebgpuRenderPipeline extends WebgpuPipeline {
    lookupHashes: Uint32Array<ArrayBuffer>;
    /**
     * The cache of vertex buffer layouts
     *
     * @type {WebgpuVertexBufferLayout}
     */
    vertexBufferLayout: WebgpuVertexBufferLayout;
    /**
     * The cache of render pipelines
     *
     * @type {Map<number, CacheEntry[]>}
     */
    cache: Map<number, CacheEntry[]>;
    /**
     * @param {object} primitive - The primitive.
     * @param {VertexFormat} vertexFormat0 - The first vertex format.
     * @param {VertexFormat} vertexFormat1 - The second vertex format.
     * @param {number|undefined} ibFormat - The index buffer format.
     * @param {Shader} shader - The shader.
     * @param {RenderTarget} renderTarget - The render target.
     * @param {BindGroupFormat[]} bindGroupFormats - An array of bind group formats.
     * @param {BlendState} blendState - The blend state.
     * @param {DepthState} depthState - The depth state.
     * @param {number} cullMode - The cull mode.
     * @param {boolean} stencilEnabled - Whether stencil is enabled.
     * @param {StencilParameters} stencilFront - The stencil state for front faces.
     * @param {StencilParameters} stencilBack - The stencil state for back faces.
     * @returns {GPURenderPipeline} Returns the render pipeline.
     * @private
     */
    private get;
    getBlend(blendState: any): {
        color: {
            operation: string;
            srcFactor: string;
            dstFactor: string;
        };
        alpha: {
            operation: string;
            srcFactor: string;
            dstFactor: string;
        };
    };
    /**
     * @param {DepthState} depthState - The depth state.
     * @param {RenderTarget} renderTarget - The render target.
     * @param {boolean} stencilEnabled - Whether stencil is enabled.
     * @param {StencilParameters} stencilFront - The stencil state for front faces.
     * @param {StencilParameters} stencilBack - The stencil state for back faces.
     * @param {string} primitiveTopology - The primitive topology.
     * @returns {object} Returns the depth stencil state.
     * @private
     */
    private getDepthStencil;
    create(primitiveTopology: any, ibFormat: any, shader: any, renderTarget: any, pipelineLayout: any, blendState: any, depthState: any, vertexBufferLayout: any, cullMode: any, stencilEnabled: any, stencilFront: any, stencilBack: any): any;
}
import { WebgpuPipeline } from './webgpu-pipeline.js';
import { WebgpuVertexBufferLayout } from './webgpu-vertex-buffer-layout.js';
declare class CacheEntry {
    /**
     * Render pipeline
     *
     * @type {GPURenderPipeline}
     * @private
     */
    private pipeline;
    /**
     * The full array of hashes used to lookup the pipeline, used in case of hash collision.
     *
     * @type {Uint32Array}
     */
    hashes: Uint32Array;
}
export {};
