export class ImageElement {
    constructor(element: any);
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtSetMeshes;
    _element: any;
    _entity: any;
    _system: any;
    /** @type {number} */
    _textureAsset: number;
    /** @type {Texture} */
    _texture: Texture;
    /** @type {number} */
    _materialAsset: number;
    /** @type {Material} */
    _material: Material;
    /** @type {number} */
    _spriteAsset: number;
    /** @type {Sprite} */
    _sprite: Sprite;
    _spriteFrame: number;
    /** @type {number} */
    _pixelsPerUnit: number;
    _targetAspectRatio: number;
    _rect: Vec4;
    _mask: boolean;
    _maskRef: number;
    _outerScale: Vec2;
    _outerScaleUniform: Float32Array<ArrayBuffer>;
    _innerOffset: Vec4;
    _innerOffsetUniform: Float32Array<ArrayBuffer>;
    _atlasRect: Vec4;
    _atlasRectUniform: Float32Array<ArrayBuffer>;
    _defaultMesh: Mesh;
    _renderable: ImageRenderable;
    _color: Color;
    _colorUniform: Float32Array<ArrayBuffer>;
    _updateAabbFunc: any;
    destroy(): void;
    set textureAsset(value: number);
    get textureAsset(): number;
    set spriteAsset(value: number);
    get spriteAsset(): number;
    set materialAsset(value: number);
    get materialAsset(): number;
    _onResolutionChange(res: any): void;
    _onParentResizeOrPivotChange(): void;
    _onScreenSpaceChange(value: any): void;
    _onScreenChange(screen: any, previous: any): void;
    _onDrawOrderChange(order: any): void;
    _hasUserMaterial(): boolean;
    _use9Slicing(): boolean;
    _updateMaterial(screenSpace: any): void;
    _createMesh(): Mesh;
    _updateMesh(mesh: any): void;
    _meshDirty: boolean;
    _updateSprite(): void;
    set mesh(value: any);
    get mesh(): any;
    refreshMesh(): void;
    _updateAabb(aabb: any): any;
    _toggleMask(): void;
    _onMaterialLoad(asset: any): void;
    set material(value: Material);
    get material(): Material;
    _onMaterialAdded(asset: any): void;
    _bindMaterialAsset(asset: any): void;
    _unbindMaterialAsset(asset: any): void;
    _onMaterialChange(): void;
    _onMaterialRemove(): void;
    _onTextureAdded(asset: any): void;
    _bindTextureAsset(asset: any): void;
    _unbindTextureAsset(asset: any): void;
    _onTextureLoad(asset: any): void;
    set texture(value: Texture);
    get texture(): Texture;
    _onTextureChange(asset: any): void;
    _onTextureRemove(asset: any): void;
    _onSpriteAssetAdded(asset: any): void;
    _bindSpriteAsset(asset: any): void;
    _unbindSpriteAsset(asset: any): void;
    _onSpriteAssetLoad(asset: any): void;
    set sprite(value: Sprite);
    get sprite(): Sprite;
    _onSpriteAssetChange(asset: any): void;
    _onSpriteAssetRemove(asset: any): void;
    _bindSprite(sprite: any): void;
    _unbindSprite(sprite: any): void;
    _onSpriteMeshesChange(): void;
    _onSpritePpuChange(): void;
    _onAtlasTextureChange(): void;
    _onTextureAtlasLoad(atlasAsset: any): void;
    onEnable(): void;
    onDisable(): void;
    _setStencil(stencilParams: any): void;
    _updateRenderableEmissive(): void;
    set color(value: Color);
    get color(): Color;
    set opacity(value: number);
    get opacity(): number;
    set rect(value: Vec4);
    get rect(): Vec4;
    _removeMaterialAssetEvents(): void;
    set spriteFrame(value: number);
    get spriteFrame(): number;
    set mask(value: boolean);
    get mask(): boolean;
    set pixelsPerUnit(value: number);
    get pixelsPerUnit(): number;
    /**
     * @type {BoundingBox | null}
     */
    get aabb(): BoundingBox | null;
}
import type { Texture } from '../../../platform/graphics/texture.js';
import type { Material } from '../../../scene/materials/material.js';
import type { Sprite } from '../../../scene/sprite.js';
import { Vec4 } from '../../../core/math/vec4.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { Mesh } from '../../../scene/mesh.js';
declare class ImageRenderable {
    constructor(entity: any, mesh: any, material: any);
    _entity: any;
    _element: any;
    model: Model;
    node: GraphNode;
    mesh: any;
    meshInstance: MeshInstance;
    _meshDirty: boolean;
    unmaskMeshInstance: MeshInstance;
    destroy(): void;
    setMesh(mesh: any): void;
    setMask(mask: any): void;
    setMaterial(material: any): void;
    setParameter(name: any, value: any): void;
    deleteParameter(name: any): void;
    setUnmaskDrawOrder(): void;
    setDrawOrder(drawOrder: any): void;
    setCull(cull: any): void;
    setScreenSpace(screenSpace: any): void;
    setLayer(layer: any): void;
    forceUpdateAabb(mask: any): void;
    setAabbFunc(fn: any): void;
}
import { Color } from '../../../core/math/color.js';
import type { BoundingBox } from '../../../core/shape/bounding-box.js';
import { Model } from '../../../scene/model.js';
import { GraphNode } from '../../../scene/graph-node.js';
import { MeshInstance } from '../../../scene/mesh-instance.js';
export {};
