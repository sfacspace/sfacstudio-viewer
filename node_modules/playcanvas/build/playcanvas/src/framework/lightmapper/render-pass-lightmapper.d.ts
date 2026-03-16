/**
 * @import { BindGroup } from '../../platform/graphics/bind-group.js'
 */
/**
 * A render pass implementing rendering of mesh instance receivers for light-mapper.
 */
export class RenderPassLightmapper extends RenderPass {
    constructor(device: any, renderer: any, camera: any, worldClusters: any, receivers: any, lightArray: any);
    /** @type {BindGroup[]} */
    viewBindGroups: BindGroup[];
    renderer: any;
    camera: any;
    worldClusters: any;
    receivers: any;
    lightArray: any;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
import type { BindGroup } from '../../platform/graphics/bind-group.js';
