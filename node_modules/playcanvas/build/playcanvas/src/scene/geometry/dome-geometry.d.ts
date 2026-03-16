/**
 * A procedural dome-shaped geometry.
 *
 * Typically, you would:
 *
 * 1. Create a DomeGeometry instance.
 * 2. Generate a {@link Mesh} from the geometry.
 * 3. Create a {@link MeshInstance} referencing the mesh.
 * 4. Create an {@link Entity} with a {@link RenderComponent} and assign the {@link MeshInstance} to it.
 * 5. Add the entity to the {@link Scene}.
 *
 * ```javascript
 * // Create a mesh instance
 * const geometry = new pc.DomeGeometry();
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
export class DomeGeometry extends SphereGeometry {
    /**
     * Create a new DomeGeometry instance.
     *
     * By default, the constructor creates a dome with a radius of 0.5, 16 latitude bands and 16
     * longitude bands. The dome is created with UVs in the range of 0 to 1.
     *
     * @param {object} [opts] - Options object.
     * @param {number} [opts.latitudeBands] - The number of divisions along the latitudinal axis of
     * the sphere. Defaults to 16.
     * @param {number} [opts.longitudeBands] - The number of divisions along the longitudinal axis of
     * the sphere. Defaults to 16.
     * @example
     * const geometry = new pc.DomeGeometry({
     *     latitudeBands: 32,
     *     longitudeBands: 32
     * });
     */
    constructor(opts?: {
        latitudeBands?: number;
        longitudeBands?: number;
    });
}
import { SphereGeometry } from './sphere-geometry.js';
