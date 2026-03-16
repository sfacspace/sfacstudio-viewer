/**
 * A procedural box-shaped geometry.
 *
 * Typically, you would:
 *
 * 1. Create a BoxGeometry instance.
 * 2. Generate a {@link Mesh} from the geometry.
 * 3. Create a {@link MeshInstance} referencing the mesh.
 * 4. Create an {@link Entity} with a {@link RenderComponent} and assign the {@link MeshInstance} to it.
 * 5. Add the entity to the {@link Scene}.
 *
 * ```javascript
 * // Create a mesh instance
 * const geometry = new pc.BoxGeometry();
 * const mesh = pc.Mesh.fromGeometry(app.graphicsDevice, geometry);
 * const material = new pc.StandardMaterial();
 * const meshInstance = new pc.MeshInstance(mesh, material);
 *
 * // Create an entity
 * const entity = new pc.Entity();
 * entity.addComponent('render', {
 *     meshInstances: [meshInstance]
 * });
 *
 * // Add the entity to the scene hierarchy
 * app.scene.root.addChild(entity);
 * ```
 *
 * @category Graphics
 */
export class BoxGeometry extends Geometry {
    /**
     * Create a new BoxGeometry instance.
     *
     * By default, the constructor creates a box centered on the object space origin with a width,
     * length and height of 1 unit and 1 segment in either axis (2 triangles per face). The box is
     * created with UVs in the range of 0 to 1 on each face.
     *
     * @param {object} [opts] - Options object.
     * @param {Vec3} [opts.halfExtents] - The half dimensions of the box in each axis. Defaults to
     * [0.5, 0.5, 0.5].
     * @param {number} [opts.widthSegments] - The number of divisions along the X axis of the box.
     * Defaults to 1.
     * @param {number} [opts.lengthSegments] - The number of divisions along the Z axis of the box.
     * Defaults to 1.
     * @param {number} [opts.heightSegments] - The number of divisions along the Y axis of the box.
     * Defaults to 1.
     * @param {boolean} [opts.calculateTangents] - Generate tangent information. Defaults to false.
     * @param {number} [opts.yOffset] - Move the box vertically by given offset in local space. Pass
     * 0.5 to generate the box with pivot point at the bottom face. Defaults to 0.
     * @example
     * const geometry = new pc.BoxGeometry({
     *     halfExtents: new pc.Vec3(1, 1, 1),
     *     widthSegments: 2,
     *     lengthSegments: 2,
     *     heightSegments: 2
     * });
     */
    constructor(opts?: {
        halfExtents?: Vec3;
        widthSegments?: number;
        lengthSegments?: number;
        heightSegments?: number;
        calculateTangents?: boolean;
        yOffset?: number;
    });
    positions: any[];
    normals: any[];
    uvs: any[];
    uvs1: any[];
    indices: any[];
}
import { Geometry } from './geometry.js';
import { Vec3 } from '../../core/math/vec3.js';
