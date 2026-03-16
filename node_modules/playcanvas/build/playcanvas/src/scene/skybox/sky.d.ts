/**
 * @import { Scene } from '../scene.js'
 */
/**
 * Implementation of the sky.
 *
 * @category Graphics
 */
export class Sky {
    /**
     * Constructs a new sky.
     *
     * @param {Scene} scene - The scene owning the sky.
     * @ignore
     */
    constructor(scene: Scene);
    /**
     * The type of the sky. One of the SKYTYPE_* constants.
     *
     * @type {string}
     * @private
     */
    private _type;
    /**
     * The center of the sky.
     *
     * @type {Vec3}
     * @private
     */
    private _center;
    /**
     * The sky mesh of the scene.
     *
     * @type {SkyMesh|null}
     * @ignore
     */
    skyMesh: SkyMesh | null;
    /**
     * @type {boolean}
     * @private
     */
    private _depthWrite;
    /**
     * A graph node with a transform used to render the sky mesh. Adjust the position, rotation and
     * scale of this node to orient the sky mesh. Ignored for {@link SKYTYPE_INFINITE}.
     *
     * @type {GraphNode}
     * @readonly
     */
    readonly node: GraphNode;
    device: import("../../index.js").GraphicsDevice;
    scene: Scene;
    /**
     * The center of the sky. Ignored for {@link SKYTYPE_INFINITE}. Typically only the y-coordinate
     * is used, representing the tripod height. Defaults to (0, 1, 0).
     *
     * @type {Vec3}
     */
    set center(value: Vec3);
    get center(): Vec3;
    centerArray: Float32Array<ArrayBuffer>;
    projectedSkydomeCenterId: import("../../index.js").ScopeId;
    applySettings(render: any): void;
    /**
     * The type of the sky. One of the SKYTYPE_* constants. Defaults to {@link SKYTYPE_INFINITE}.
     * Can be:
     *
     * - {@link SKYTYPE_INFINITE}
     * - {@link SKYTYPE_BOX}
     * - {@link SKYTYPE_DOME}
     *
     * @type {string}
     */
    set type(value: string);
    get type(): string;
    /**
     * Whether depth writing is enabled for the sky. Defaults to false.
     *
     * Writing a depth value for the skydome is supported when its type is not
     * {@link SKYTYPE_INFINITE}. When enabled, the depth is written during a prepass render pass and
     * can be utilized by subsequent passes to apply depth-based effects, such as Depth of Field.
     *
     * Note: For the skydome to be rendered during the prepass, the Sky Layer must be ordered before
     * the Depth layer, which is the final layer used in the prepass.
     *
     * @type {boolean}
     */
    set depthWrite(value: boolean);
    /**
     * Returns whether depth writing is enabled for the sky.
     *
     * @type {boolean}
     */
    get depthWrite(): boolean;
    updateSkyMesh(): void;
    resetSkyMesh(): void;
    update(): void;
}
import { SkyMesh } from './sky-mesh.js';
import { GraphNode } from '../graph-node.js';
import type { Scene } from '../scene.js';
import { Vec3 } from '../../core/math/vec3.js';
