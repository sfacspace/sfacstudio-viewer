/**
 * A render pass used to render local non-clustered shadows. It represents rendering to a single
 * face of shadow map, as each face is a separate render target.
 */
export class RenderPassShadowLocalNonClustered extends RenderPass {
    constructor(device: any, shadowRenderer: any, light: any, face: any, applyVsm: any);
    shadowRenderer: any;
    light: any;
    face: any;
    applyVsm: any;
    shadowCamera: any;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
