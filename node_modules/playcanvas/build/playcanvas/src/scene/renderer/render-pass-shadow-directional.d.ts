/**
 * A render pass used to render directional shadows.
 *
 * @ignore
 */
export class RenderPassShadowDirectional extends RenderPass {
    constructor(device: any, shadowRenderer: any, light: any, camera: any, allCascadesRendering: any);
    shadowRenderer: any;
    light: any;
    camera: any;
    allCascadesRendering: any;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
