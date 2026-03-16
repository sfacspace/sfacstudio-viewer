/**
 * A skin instance is responsible for generating the matrix palette that is used to skin vertices
 * from object space to world space.
 *
 * @category Graphics
 */
export class SkinInstance {
    /**
     * Create a new SkinInstance instance.
     *
     * @param {Skin} skin - The skin that will provide the inverse bind pose
     * matrices to generate the final matrix palette.
     */
    constructor(skin: Skin);
    /**
     * An array of nodes representing each bone in this skin instance.
     *
     * @type {GraphNode[]}
     */
    bones: GraphNode[];
    _dirty: boolean;
    _rootBone: any;
    _skinUpdateIndex: number;
    _updateBeforeCull: boolean;
    set rootBone(rootBone: any);
    get rootBone(): any;
    init(device: any, numBones: any): void;
    boneTexture: Texture;
    matrixPalette: Uint8Array<ArrayBufferLike> | Uint16Array<ArrayBufferLike> | Uint32Array<ArrayBufferLike> | Float32Array<ArrayBufferLike>;
    destroy(): void;
    /**
     * Resolves skin bones to a hierarchy with the rootBone at its root.
     *
     * @param {Entity} rootBone - A reference to the entity to be used as the root bone.
     * @param {Entity} entity - Specifies the entity used if the bone match is not found in the
     * hierarchy - usually the entity the render component is attached to.
     * @ignore
     */
    resolve(rootBone: Entity, entity: Entity): void;
    /**
     * @param {Skin} skin - The skin.
     */
    initSkin(skin: Skin): void;
    skin: Skin;
    matrices: any[];
    uploadBones(device: any): void;
    _updateMatrices(rootNode: any, skinUpdateIndex: any): void;
    updateMatrices(rootNode: any, skinUpdateIndex: any): void;
    updateMatrixPalette(rootNode: any, skinUpdateIndex: any): void;
}
import type { GraphNode } from './graph-node.js';
import { Texture } from '../platform/graphics/texture.js';
import type { Entity } from '../framework/entity.js';
import type { Skin } from './skin.js';
