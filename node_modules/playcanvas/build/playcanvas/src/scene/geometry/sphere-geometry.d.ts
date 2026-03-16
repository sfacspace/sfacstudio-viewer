/**
 * A procedural sphere-shaped geometry.
 *
 * Typically, you would:
 *
 * 1. Create a SphereGeometry instance.
 * 2. Generate a {@link Mesh} from the geometry.
 * 3. Create a {@link MeshInstance} referencing the mesh.
 * 4. Create an {@link Entity} with a {@link RenderComponent} and assign the {@link MeshInstance} to it.
 * 5. Add the entity to the {@link Scene}.
 *
 * ```javascript
 * // Create a mesh instance
 * const geometry = new pc.SphereGeometry();
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
export class SphereGeometry extends Geometry {
    /**
     * Create a new SphereGeometry instance.
     *
     * By default, the constructor creates a sphere centered on the object space origin with a radius
     * of 0.5 and 16 segments in both longitude and latitude. The sphere is created with UVs in the
     * range of 0 to 1.
     *
     * @param {object} [opts] - Options object.
     * @param {number} [opts.radius] - The radius of the sphere. Defaults to 0.5.
     * @param {number} [opts.latitudeBands] - The number of divisions along the latitudinal axis of
     * the sphere. Defaults to 16.
     * @param {number} [opts.longitudeBands] - The number of divisions along the longitudinal axis of
     * the sphere. Defaults to 16.
     * @param {boolean} [opts.calculateTangents] - Generate tangent information. Defaults to false.
     * @example
     * const geometry = new pc.SphereGeometry({
     *     radius: 1,
     *     latitudeBands: 32,
     *     longitudeBands: 32
     * });
     */
    constructor(opts?: {
        radius?: number;
        latitudeBands?: number;
        longitudeBands?: number;
        calculateTangents?: boolean;
    });
}
import { Geometry } from './geometry.js';
