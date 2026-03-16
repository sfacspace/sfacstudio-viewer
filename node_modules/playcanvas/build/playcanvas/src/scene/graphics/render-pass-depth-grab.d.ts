/**
 * A render pass implementing grab of a depth buffer, used on WebGL 2 and WebGPU devices.
 *
 * @ignore
 */
export class RenderPassDepthGrab extends RenderPass {
    constructor(device: any, camera: any);
    depthRenderTarget: any;
    camera: any;
    shouldReallocate(targetRT: any, sourceTexture: any): boolean;
    allocateRenderTarget(renderTarget: any, sourceRenderTarget: any, device: any, format: any, isDepth: any): any;
    releaseRenderTarget(rt: any): void;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
