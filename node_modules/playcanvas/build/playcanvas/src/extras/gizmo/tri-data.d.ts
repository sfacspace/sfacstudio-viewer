/**
 * The class for holding triangle data.
 *
 * @ignore
 */
export class TriData {
    /**
     * @param {Geometry} geometry - The geometry to create the triangle data from.
     * @param {number} [priority] - The priority of the triangle data.
     */
    constructor(geometry: Geometry, priority?: number);
    /**
     * The priority of the triangle data (Used for intersection ordering):
     *   - priority = 0 - no priority
     *   - priority > 0 - higher value represents a higher priority
     * defaults to 0.
     *
     * @type {number}
     */
    _priority: number;
    /**
     * The transform of the triangles.
     *
     * @type {Mat4}
     */
    _transform: Mat4;
    /**
     * The array of triangles for the geometry.
     *
     * @type {Tri[]}
     */
    tris: Tri[];
    get transform(): Mat4;
    get priority(): number;
    /**
     * Sets the transform of the triangle data.
     *
     * @param {Vec3} [pos] - The position of the transform.
     * @param {Quat} [rot] - The rotation of the transform.
     * @param {Vec3} [scale] - The scale of the transform.
     */
    setTransform(pos?: Vec3, rot?: Quat, scale?: Vec3): void;
    /**
     * @param {Geometry} geometry - The geometry to create the triangle data from.
     */
    fromGeometry(geometry: Geometry): void;
}
import { Mat4 } from '../../core/math/mat4.js';
import { Tri } from '../../core/shape/tri.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import { Geometry } from '../../scene/geometry/geometry.js';
