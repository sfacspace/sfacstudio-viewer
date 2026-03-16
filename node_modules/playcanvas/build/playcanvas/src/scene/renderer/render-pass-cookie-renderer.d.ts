/**
 * A render pass used to render cookie textures (both 2D and Cubemap) into the texture atlas.
 *
 * @ignore
 */
export class RenderPassCookieRenderer extends RenderPass {
    static create(renderTarget: any, cubeSlotsOffsets: any): RenderPassCookieRenderer;
    constructor(device: any, cubeSlotsOffsets: any);
    /** @type {QuadRender|null} */
    _quadRenderer2D: QuadRender | null;
    /** @type {QuadRender|null} */
    _quadRendererCube: QuadRender | null;
    _filteredLights: any[];
    _forceCopy: boolean;
    /**
     * Event handle for device restored event.
     *
     * @type {EventHandle|null}
     * @private
     */
    private _evtDeviceRestored;
    _cubeSlotsOffsets: any;
    blitTextureId: any;
    invViewProjId: any;
    onDeviceRestored(): void;
    update(lights: any): void;
    filter(lights: any, filteredLights: any): void;
    initInvViewProjMatrices(): void;
    get quadRenderer2D(): QuadRender;
    get quadRendererCube(): QuadRender;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
import { QuadRender } from '../graphics/quad-render.js';
