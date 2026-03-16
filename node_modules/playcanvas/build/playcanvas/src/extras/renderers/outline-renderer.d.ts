/**
 * Class responsible for rendering color outlines around objects in the scene.
 *
 * @category Graphics
 */
export class OutlineRenderer {
    /**
     * Create a new OutlineRenderer.
     *
     * @param {AppBase} app - The application.
     * @param {Layer} [renderingLayer] - A layer used internally to render the outlines. If not
     * provided, the renderer will use the 'Immediate' layer. This needs to be supplied only if the
     * 'Immediate' layer is not present in the scene.
     * @param {number} [priority] - The priority of the camera rendering the outlines. Should be
     * smaller value than the priority of the scene camera, to be updated first. Defaults to -1.
     */
    constructor(app: AppBase, renderingLayer?: Layer, priority?: number);
    app: AppBase;
    renderingLayer: Layer;
    rt: RenderTarget;
    outlineCameraEntity: Entity;
    outlineShaderPass: number;
    postRender: (cameraComponent: any) => void;
    tempRt: RenderTarget;
    blendState: BlendState;
    shaderExtend: import("../../index.js").Shader;
    shaderBlend: import("../../index.js").Shader;
    quadRenderer: QuadRender;
    whiteTex: Texture;
    /**
     * Destroy the outline renderer and its resources.
     */
    destroy(): void;
    getMeshInstances(entity: any, recursive: any): any[];
    /**
     * Add an entity to the outline renderer.
     *
     * @param {Entity} entity - The entity to add. All MeshInstance of the entity and its
     * descendants will be added.
     * @param {Color} color - The color of the outline.
     * @param {boolean} [recursive] - Whether to add MeshInstances of the entity's descendants.
     * Defaults to true.
     */
    addEntity(entity: Entity, color: Color, recursive?: boolean): void;
    /**
     * Remove an entity from the outline renderer.
     *
     * @param {Entity} entity - The entity to remove.
     * @param {boolean} [recursive] - Whether to add MeshInstances of the entity's descendants.
     * Defaults to true.
     */
    removeEntity(entity: Entity, recursive?: boolean): void;
    removeAllEntities(): void;
    blendOutlines(): void;
    onPostRender(): void;
    createRenderTarget(name: any, width: any, height: any, depth: any): RenderTarget;
    updateRenderTarget(sceneCamera: any): void;
    /**
     * Update the outline renderer. Should be called once per frame.
     *
     * @param {Entity} sceneCameraEntity - The camera used to render the scene, which is used to provide
     * the camera properties to the outline rendering camera.
     * @param {Layer} blendLayer - The layer in which the outlines should be rendered.
     * @param {boolean} blendLayerTransparent - Whether the blend layer is transparent.
     */
    frameUpdate(sceneCameraEntity: Entity, blendLayer: Layer, blendLayerTransparent: boolean): void;
}
import type { AppBase } from '../../framework/app-base.js';
import type { Layer } from "../../scene/layer.js";
import { RenderTarget } from '../../platform/graphics/render-target.js';
import { Entity } from '../../framework/entity.js';
import { BlendState } from '../../platform/graphics/blend-state.js';
import { QuadRender } from '../../scene/graphics/quad-render.js';
import { Texture } from '../../platform/graphics/texture.js';
import { Color } from '../../core/math/color.js';
