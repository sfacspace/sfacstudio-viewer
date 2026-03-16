/**
 * @ignore
 */
export class GSplatWorkBuffer {
    constructor(device: any);
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    /** @type {number} */
    id: number;
    /** @type {number} */
    colorTextureFormat: number;
    /** @type {Texture} */
    colorTexture: Texture;
    /** @type {Texture} */
    splatTexture0: Texture;
    /** @type {Texture} */
    splatTexture1: Texture;
    /** @type {RenderTarget} */
    renderTarget: RenderTarget;
    /** @type {RenderTarget} */
    colorRenderTarget: RenderTarget;
    /** @type {Texture} */
    orderTexture: Texture;
    /** @type {StorageBuffer} */
    orderBuffer: StorageBuffer;
    /** @type {number} */
    _textureSize: number;
    /** @type {UploadStream} */
    uploadStream: UploadStream;
    /** @type {GSplatWorkBufferRenderPass} */
    renderPass: GSplatWorkBufferRenderPass;
    /** @type {GSplatWorkBufferRenderPass} */
    colorRenderPass: GSplatWorkBufferRenderPass;
    destroy(): void;
    get textureSize(): number;
    setOrderData(data: any): void;
    createTexture(name: any, format: any, w: any, h: any): Texture;
    /**
     * @param {number} textureSize - The texture size to resize to.
     */
    resize(textureSize: number): void;
    /**
     * Render given splats to the work buffer.
     *
     * @param {GSplatInfo[]} splats - The splats to render.
     * @param {GraphNode} cameraNode - The camera node.
     * @param {number[][]|undefined} colorsByLod - Array of RGB colors per LOD. Index by lodIndex; if a
     * shorter array is provided, index 0 will be reused as fallback.
     */
    render(splats: GSplatInfo[], cameraNode: GraphNode, colorsByLod: number[][] | undefined): void;
    /**
     * Render only the color data to the work buffer (not geometry/covariance).
     *
     * @param {GSplatInfo[]} splats - The splats to render.
     * @param {GraphNode} cameraNode - The camera node.
     * @param {number[][]|undefined} colorsByLod - Array of RGB colors per LOD. Index by lodIndex; if a
     * shorter array is provided, index 0 will be reused as fallback.
     */
    renderColor(splats: GSplatInfo[], cameraNode: GraphNode, colorsByLod: number[][] | undefined): void;
}
/**
 * @import { GSplatInfo } from "./gsplat-info.js"
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { GraphNode } from '../graph-node.js';
 * @import { ShaderMaterial } from '../materials/shader-material.js'
 */
/**
 * A helper class to cache quad renders for work buffer rendering.
 *
 * @ignore
 */
export class WorkBufferRenderInfo {
    constructor(device: any, key: any, material: any, colorTextureFormat: any, colorOnly: any);
    /** @type {ShaderMaterial} */
    material: ShaderMaterial;
    /** @type {QuadRender} */
    quadRender: QuadRender;
    device: any;
    destroy(): void;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import { Texture } from '../../platform/graphics/texture.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
import { StorageBuffer } from '../../platform/graphics/storage-buffer.js';
import { UploadStream } from '../../platform/graphics/upload-stream.js';
import { GSplatWorkBufferRenderPass } from './gsplat-work-buffer-render-pass.js';
import type { GSplatInfo } from "./gsplat-info.js";
import type { GraphNode } from '../graph-node.js';
import type { ShaderMaterial } from '../materials/shader-material.js';
import { QuadRender } from '../graphics/quad-render.js';
