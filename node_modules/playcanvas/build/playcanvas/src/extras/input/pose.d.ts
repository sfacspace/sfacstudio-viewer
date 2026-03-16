/**
 * Represents a pose in 3D space, including position and rotation.
 *
 * @category Input
 * @alpha
 */
export class Pose {
    /**
     * Creates a new Pose instance.
     *
     * @param {Vec3} [position] - The position of the pose.
     * @param {Vec3} [angles] - The angles of the pose in degrees.
     * @param {number} [distance] - The focus distance from the position to the pose.
     */
    constructor(position?: Vec3, angles?: Vec3, distance?: number);
    /**
     * The position of the pose.
     *
     * @type {Vec3}
     */
    position: Vec3;
    /**
     * The angles of the pose in degrees calculated from the forward vector.
     *
     * @type {Vec3}
     */
    angles: Vec3;
    /**
     * The focus distance from the position to the pose.
     *
     * @type {number}
     */
    distance: number;
    /**
     * @type {Vec2}
     */
    pitchRange: Vec2;
    /**
     * @type {Vec2}
     */
    yawRange: Vec2;
    /**
     * @type {Vec2}
     */
    xRange: Vec2;
    /**
     * @type {Vec2}
     */
    yRange: Vec2;
    /**
     * @type {Vec2}
     */
    zRange: Vec2;
    /**
     * Copies the position and rotation from another pose.
     *
     * @param {Pose} other - The pose to copy from.
     * @returns {Pose} The updated Pose instance.
     */
    copy(other: Pose): Pose;
    /**
     * Creates a clone of this pose.
     *
     * @returns {Pose} A new Pose instance with the same position, angles, and distance.
     */
    clone(): Pose;
    /**
     * Checks if this pose is approximately equal to another pose within a given epsilon.
     *
     * @param {Pose} other - The pose to compare with.
     * @param {number} [epsilon] - The tolerance for comparison.
     * @returns {boolean} True if the poses are approximately equal, false otherwise.
     */
    equalsApprox(other: Pose, epsilon?: number): boolean;
    /**
     * Lerps between two poses based on the given alpha values.
     *
     * @param {Pose} lhs - The left-hand side pose.
     * @param {Pose} rhs - The right-hand side pose.
     * @param {number} alpha1 - The alpha value for position interpolation.
     * @param {number} [alpha2] - The alpha value for angles interpolation.
     * @param {number} [alpha3] - The alpha value for distance interpolation.
     * @returns {Pose} The updated Pose instance.
     */
    lerp(lhs: Pose, rhs: Pose, alpha1: number, alpha2?: number, alpha3?: number): Pose;
    /**
     * Moves the pose by the given vector.
     *
     * @param {Vec3} offset - The vector to move by.
     * @returns {Pose} The updated Pose instance.
     */
    move(offset: Vec3): Pose;
    /**
     * Rotates the pose by the given angles in degrees.
     *
     * @param {Vec3} euler - The angles to rotate by.
     * @returns {Pose} The updated Pose instance.
     */
    rotate(euler: Vec3): Pose;
    /**
     * Sets the position and rotation of the pose.
     *
     * @param {Vec3} position - The new position.
     * @param {Vec3} angles - The new angles in degrees.
     * @param {number} distance - The new focus distance.
     * @returns {Pose} The updated Pose instance.
     */
    set(position: Vec3, angles: Vec3, distance: number): Pose;
    /**
     * Sets the pose to look in the direction of the given vector.
     *
     * @param {Vec3} from - The point from which to look.
     * @param {Vec3} to - The point to look at.
     * @returns {Pose} The updated Pose instance.
     */
    look(from: Vec3, to: Vec3): Pose;
    /**
     * Gets the focus point of the pose, which is the position plus the forward vector scaled by the distance.
     *
     * @param {Vec3} [out] - The output vector to store the focus point.
     * @returns {Vec3} The focus point of the pose.
     */
    getFocus(out?: Vec3): Vec3;
}
import { Vec3 } from '../../core/math/vec3.js';
import { Vec2 } from '../../core/math/vec2.js';
