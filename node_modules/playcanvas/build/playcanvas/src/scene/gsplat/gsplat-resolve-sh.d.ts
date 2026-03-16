export class GSplatResolveSH {
    constructor(device: any, gsplatInstance: any);
    prevDir: Vec3;
    updateMode: string;
    device: any;
    gsplatInstance: any;
    shader: import("../../index.js").Shader;
    texture: any;
    renderTarget: RenderTarget;
    renderPass: CustomRenderPass;
    quadRender: QuadRender;
    destroy(): void;
    render(camera: any, modelMat: any): void;
}
import { Vec3 } from '../../core/math/vec3.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
declare class CustomRenderPass extends RenderPass {
    /**
     * @type {() => void | null}
     */
    executeCallback: () => void | null;
}
import { QuadRender } from '../graphics/quad-render.js';
import { RenderPass } from '../../platform/graphics/render-pass.js';
export {};
