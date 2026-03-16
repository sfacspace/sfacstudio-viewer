/**
 * A render pass used to render local clustered shadows. This is done inside a single render pass,
 * as all shadows are part of a single render target atlas.
 *
 * @ignore
 */
export class RenderPassShadowLocalClustered extends RenderPass {
    constructor(device: any, shadowRenderer: any, shadowRendererLocal: any);
    shadowRenderer: any;
    shadowRendererLocal: any;
    update(localLights: any): void;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
