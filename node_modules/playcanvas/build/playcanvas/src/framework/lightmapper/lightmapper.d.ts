/**
 * The lightmapper is used to bake scene lights into textures.
 *
 * @category Graphics
 */
export class Lightmapper {
    /**
     * Create a new Lightmapper instance.
     *
     * @param {GraphicsDevice} device - The graphics device used by the lightmapper.
     * @param {Entity} root - The root entity of the scene.
     * @param {Scene} scene - The scene to lightmap.
     * @param {ForwardRenderer} renderer - The renderer.
     * @param {AssetRegistry} assets - Registry of assets to lightmap.
     * @ignore
     */
    constructor(device: GraphicsDevice, root: Entity, scene: Scene, renderer: ForwardRenderer, assets: AssetRegistry);
    device: GraphicsDevice;
    root: Entity;
    scene: Scene;
    renderer: ForwardRenderer;
    assets: AssetRegistry;
    shadowMapCache: import("../../scene/renderer/shadow-map-cache.js").ShadowMapCache;
    _tempSet: Set<any>;
    _initCalled: boolean;
    passMaterials: any[];
    ambientAOMaterial: StandardMaterial;
    fog: string;
    ambientLight: Color;
    renderTargets: Map<any, any>;
    stats: {
        renderPasses: number;
        lightmapCount: number;
        totalRenderTime: number;
        forwardTime: number;
        fboTime: number;
        shadowMapTime: number;
        compileTime: number;
        shadersLinked: number;
    };
    destroy(): void;
    blackTex: Texture;
    camera: Camera;
    initBake(device: any): void;
    bakeHDR: boolean;
    lightmapFilters: LightmapFilters;
    constantBakeDir: any;
    materials: any[];
    lightingParams: LightingParams;
    worldClusters: WorldClusters;
    shadowLocalClusteredPass: RenderPassShadowLocalClustered;
    finishBake(bakeNodes: any): void;
    createMaterialForPass(scene: any, pass: any, addAmbient: any): StandardMaterial;
    createMaterials(device: any, scene: any, passCount: any): void;
    createTexture(size: any, name: any): Texture;
    collectModels(node: any, bakeNodes: any, allNodes: any): void;
    prepareShadowCasters(nodes: any): any[];
    updateTransforms(nodes: any): void;
    calculateLightmapSize(node: any): number;
    setLightmapping(nodes: any, value: any, passCount: any, shaderDefs: any): void;
    /**
     * Generates and applies the lightmaps.
     *
     * @param {Entity[]|null} nodes - An array of entities (with model or render components) to
     * render lightmaps for. If not supplied, the entire scene will be baked.
     * @param {number} [mode] - Baking mode. Can be:
     *
     * - {@link BAKE_COLOR}: single color lightmap
     * - {@link BAKE_COLORDIR}: single color lightmap + dominant light direction (used for
     * bump/specular)
     *
     * Only lights with bakeDir=true will be used for generating the dominant light direction.
     * Defaults to {@link BAKE_COLORDIR}.
     */
    bake(nodes: Entity[] | null, mode?: number): void;
    allocateTextures(bakeNodes: any, passCount: any): void;
    prepareLightsToBake(allLights: any, bakeLights: any): void;
    restoreLights(allLights: any): void;
    setupScene(): void;
    restoreScene(): void;
    computeNodeBounds(meshInstances: any): BoundingBox;
    computeNodesBounds(nodes: any): void;
    computeBounds(meshInstances: any): BoundingBox;
    backupMaterials(meshInstances: any): void;
    restoreMaterials(meshInstances: any): void;
    lightCameraPrepare(device: any, bakeLight: any): any;
    lightCameraPrepareAndCull(bakeLight: any, bakeNode: any, shadowCam: any, casterBounds: any): boolean;
    setupLightArray(lightArray: any, light: any): void;
    renderShadowMap(comp: any, shadowMapRendered: any, casters: any, bakeLight: any): boolean;
    postprocessTextures(device: any, bakeNodes: any, passCount: any): void;
    bakeInternal(passCount: any, bakeNodes: any, allNodes: any): void;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { Entity } from '../entity.js';
import type { Scene } from '../../scene/scene.js';
import type { ForwardRenderer } from '../../scene/renderer/forward-renderer.js';
import type { AssetRegistry } from '../asset/asset-registry.js';
import { StandardMaterial } from '../../scene/materials/standard-material.js';
import { Color } from '../../core/math/color.js';
import { Texture } from '../../platform/graphics/texture.js';
import { Camera } from '../../scene/camera.js';
import { LightmapFilters } from './lightmap-filters.js';
import { LightingParams } from '../../scene/lighting/lighting-params.js';
import { WorldClusters } from '../../scene/lighting/world-clusters.js';
import { RenderPassShadowLocalClustered } from '../../scene/renderer/render-pass-shadow-local-clustered.js';
import { BoundingBox } from '../../core/shape/bounding-box.js';
