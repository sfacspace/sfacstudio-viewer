/**
 * A procedural plane-shaped geometry.
 *
 * Typically, you would:
 *
 * 1. Create a PlaneGeometry instance.
 * 2. Generate a {@link Mesh} from the geometry.
 * 3. Create a {@link MeshInstance} referencing the mesh.
 * 4. Create an {@link Entity} with a {@link RenderComponent} and assign the {@link MeshInstance} to it.
 * 5. Add the entity to the {@link Scene}.
 *
 * ```javascript
 * // Create a mesh instance
 * const geometry = new pc.PlaneGeometry();
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
export class PlaneGeometry extends Geometry {
    /**
     * Create a new PlaneGeometry instance.
     *
     * By default, the constructor creates a plane centered on the object space origin with a width
     * and length of 1 and 5 segments in either axis (50 triangles). The normal vector of the plane is
     * aligned along the positive Y axis. The plane is created with UVs in the range of 0 to 1.
     *
     * @param {object} [opts] - Options object.
     * @param {Vec2} [opts.halfExtents] - The half dimensions of the plane in the X and Z axes.
     * Defaults to [0.5, 0.5].
     * @param {number} [opts.widthSegments] - The number of divisions along the X axis of the plane.
     * Defaults to 5.
     * @param {number} [opts.lengthSegments] - The number of divisions along the Z axis of the plane.
     * Defaults to 5.
     * @param {boolean} [opts.calculateTangents] - Generate tangent information. Defaults to false.
     * @example
     * const geometry = new pc.PlaneGeometry({
     *     halfExtents: new pc.Vec2(1, 1),
     *     widthSegments: 10,
     *     lengthSegments: 10
     * });
     */
    constructor(opts?: {
        halfExtents?: Vec2;
        widthSegments?: number;
        lengthSegments?: number;
        calculateTangents?: boolean;
    });
}
import { Geometry } from './geometry.js';
import { Vec2 } from '../../core/math/vec2.js';
