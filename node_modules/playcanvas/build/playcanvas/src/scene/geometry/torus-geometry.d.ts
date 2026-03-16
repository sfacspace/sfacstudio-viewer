/**
 * A procedural torus-shaped geometry.
 *
 * Typically, you would:
 *
 * 1. Create a TorusGeometry instance.
 * 2. Generate a {@link Mesh} from the geometry.
 * 3. Create a {@link MeshInstance} referencing the mesh.
 * 4. Create an {@link Entity} with a {@link RenderComponent} and assign the {@link MeshInstance} to it.
 * 5. Add the entity to the {@link Scene}.
 *
 * ```javascript
 * // Create a mesh instance
 * const geometry = new pc.TorusGeometry();
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
export class TorusGeometry extends Geometry {
    /**
     * Create a new TorusGeometry instance.
     *
     * By default, the constructor creates a torus in the XZ-plane with a tube radius of 0.2, a ring
     * radius of 0.3, 30 segments and 20 sides. The torus is created with UVs in the range of 0 to 1.
     *
     * @param {object} [opts] - Options object.
     * @param {number} [opts.tubeRadius] - The radius of the tube forming the body of the torus.
     * Defaults to 0.2.
     * @param {number} [opts.ringRadius] - The radius from the centre of the torus to the centre of the
     * tube. Defaults to 0.3.
     * @param {number} [opts.sectorAngle] - The sector angle in degrees of the ring of the torus.
     * Defaults to 2 * Math.PI.
     * @param {number} [opts.segments] - The number of radial divisions forming cross-sections of the
     * torus ring. Defaults to 20.
     * @param {number} [opts.sides] - The number of divisions around the tubular body of the torus ring.
     * Defaults to 30.
     * @param {boolean} [opts.calculateTangents] - Generate tangent information. Defaults to false.
     * @example
     * const geometry = new pc.TorusGeometry({
     *     tubeRadius: 1,
     *     ringRadius: 2,
     *     sectorAngle: 360,
     *     segments: 30,
     *     sides: 20
     * });
     */
    constructor(opts?: {
        tubeRadius?: number;
        ringRadius?: number;
        sectorAngle?: number;
        segments?: number;
        sides?: number;
        calculateTangents?: boolean;
    });
}
import { Geometry } from './geometry.js';
