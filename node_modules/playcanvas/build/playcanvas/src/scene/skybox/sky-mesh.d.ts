/**
 * @import { GraphNode } from '../graph-node.js'
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { Scene } from '../scene.js'
 * @import { Texture } from '../../platform/graphics/texture.js'
 */
/**
 * A visual representation of the sky.
 *
 * @ignore
 */
export class SkyMesh {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {Scene} scene - The scene owning the sky.
     * @param {GraphNode} node - The graph node of the sky mesh instance.
     * @param {Texture} texture - The texture of the sky.
     * @param {string} type - The type of the sky. One of the SKYTYPE_* constants.
     */
    constructor(device: GraphicsDevice, scene: Scene, node: GraphNode, texture: Texture, type: string);
    /**
     * Mesh instance representing the visuals of the sky.
     *
     * @type {MeshInstance|null}
     */
    meshInstance: MeshInstance | null;
    /**
     * @type {boolean}
     */
    _depthWrite: boolean;
    skyLayer: import("../layer.js").Layer;
    destroy(): void;
    set depthWrite(value: boolean);
    get depthWrite(): boolean;
}
import { MeshInstance } from '../mesh-instance.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { Scene } from '../scene.js';
import type { GraphNode } from '../graph-node.js';
import type { Texture } from '../../platform/graphics/texture.js';
