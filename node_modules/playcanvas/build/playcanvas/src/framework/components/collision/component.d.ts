/**
 * The CollisionComponent enables an {@link Entity} to act as a collision volume. Use it on its own
 * to define a trigger volume. Or use it in conjunction with a {@link RigidBodyComponent} to make a
 * collision volume that can be simulated using the physics engine.
 *
 * When an entity is configured as a trigger volume, if an entity with a dynamic or kinematic body
 * enters or leaves that trigger volume, both entities will receive trigger events.
 *
 * You should never need to use the CollisionComponent constructor directly. To add an
 * CollisionComponent to an {@link Entity}, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = pc.Entity();
 * entity.addComponent('collision'); // This defaults to 1x1x1 box-shaped trigger volume
 * ```
 *
 * To create a 0.5 radius dynamic rigid body sphere:
 *
 * ```javascript
 * const entity = pc.Entity();
 * entity.addComponent('collision', {
 *     type: 'sphere'
 * });
 * entity.addComponent('rigidbody', {
 *     type: 'dynamic'
 * });
 * ```
 *
 * Once the CollisionComponent is added to the entity, you can access it via the
 * {@link Entity#collision} property:
 *
 * ```javascript
 * entity.collision.type = 'cylinder'; // Set the collision volume to a cylinder
 *
 * console.log(entity.collision.type); // Get the collision volume type and print it
 * ```
 *
 * Relevant Engine API examples:
 *
 * - [Compound Collision](https://playcanvas.github.io/#/physics/compound-collision)
 * - [Falling Shapes](https://playcanvas.github.io/#/physics/falling-shapes)
 * - [Offset Collision](https://playcanvas.github.io/#/physics/offset-collision)
 *
 * @hideconstructor
 * @category Physics
 */
export class CollisionComponent extends Component {
    /**
     * Fired when a contact occurs between two rigid bodies. The handler is passed a
     * {@link ContactResult} object which contains details of the contact between the two rigid
     * bodies.
     *
     * @event
     * @example
     * entity.collision.on('contact', (result) => {
     *    console.log(`Contact between ${entity.name} and ${result.other.name}`);
     * });
     */
    static EVENT_CONTACT: string;
    /**
     * Fired when two rigid bodies start touching. The handler is passed the {@link ContactResult}
     * object which contains details of the contact between the two rigid bodies.
     *
     * @event
     * @example
     * entity.collision.on('collisionstart', (result) => {
     *    console.log(`${entity.name} started touching ${result.other.name}`);
     * });
     */
    static EVENT_COLLISIONSTART: string;
    /**
     * Fired when two rigid bodies stop touching. The handler is passed an {@link Entity} that
     * represents the other rigid body involved in the collision.
     *
     * @event
     * @example
     * entity.collision.on('collisionend', (other) => {
     *     console.log(`${entity.name} stopped touching ${other.name}`);
     * });
     */
    static EVENT_COLLISIONEND: string;
    /**
     * Fired when a rigid body enters a trigger volume. The handler is passed an {@link Entity}
     * representing the rigid body that entered this collision volume.
     *
     * @event
     * @example
     * entity.collision.on('triggerenter', (other) => {
     *     console.log(`${other.name} entered trigger volume ${entity.name}`);
     * });
     */
    static EVENT_TRIGGERENTER: string;
    /**
     * Fired when a rigid body exits a trigger volume. The handler is passed an {@link Entity}
     * representing the rigid body that exited this collision volume.
     *
     * @event
     * @example
     * entity.collision.on('triggerleave', (other) => {
     *     console.log(`${other.name} exited trigger volume ${entity.name}`);
     * });
     */
    static EVENT_TRIGGERLEAVE: string;
    /**
     * Create a new CollisionComponent.
     *
     * @param {CollisionComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: CollisionComponentSystem, entity: Entity);
    /** @private */
    private _compoundParent;
    /** @private */
    private _hasOffset;
    /**
     * @type {CollisionComponentData}
     * @ignore
     */
    get data(): CollisionComponentData;
    /**
     * Sets the type of the collision volume. Can be:
     *
     * - "box": A box-shaped collision volume.
     * - "capsule": A capsule-shaped collision volume.
     * - "compound": A compound shape. Any descendant entities with a collision component of type
     * box, capsule, cone, cylinder or sphere will be combined into a single, rigid shape.
     * - "cone": A cone-shaped collision volume.
     * - "cylinder": A cylinder-shaped collision volume.
     * - "mesh": A collision volume that uses a model asset as its shape.
     * - "sphere": A sphere-shaped collision volume.
     *
     * Defaults to "box".
     *
     * @type {string}
     */
    set type(arg: string);
    /**
     * Gets the type of the collision volume.
     *
     * @type {string}
     */
    get type(): string;
    /**
     * Sets the half-extents of the box-shaped collision volume in the x, y and z axes. Defaults to
     * `[0.5, 0.5, 0.5]`.
     *
     * @type {Vec3}
     */
    set halfExtents(arg: Vec3);
    /**
     * Gets the half-extents of the box-shaped collision volume in the x, y and z axes.
     *
     * @type {Vec3}
     */
    get halfExtents(): Vec3;
    /**
     * Sets the positional offset of the collision shape from the Entity position along the local
     * axes. Defaults to `[0, 0, 0]`.
     *
     * @type {Vec3}
     */
    set linearOffset(arg: Vec3);
    /**
     * Gets the positional offset of the collision shape from the Entity position along the local
     * axes.
     *
     * @type {Vec3}
     */
    get linearOffset(): Vec3;
    /**
     * Sets the rotational offset of the collision shape from the Entity rotation in local space.
     * Defaults to identity.
     *
     * @type {Quat}
     */
    set angularOffset(arg: Quat);
    /**
     * Gets the rotational offset of the collision shape from the Entity rotation in local space.
     *
     * @type {Quat}
     */
    get angularOffset(): Quat;
    /**
     * Sets the radius of the sphere, capsule, cylinder or cone-shaped collision volumes.
     * Defaults to 0.5.
     *
     * @type {number}
     */
    set radius(arg: number);
    /**
     * Gets the radius of the sphere, capsule, cylinder or cone-shaped collision volumes.
     *
     * @type {number}
     */
    get radius(): number;
    /**
     * Sets the local space axis with which the capsule, cylinder or cone-shaped collision volume's
     * length is aligned. 0 for X, 1 for Y and 2 for Z. Defaults to 1 (Y-axis).
     *
     * @type {number}
     */
    set axis(arg: number);
    /**
     * Gets the local space axis with which the capsule, cylinder or cone-shaped collision volume's
     * length is aligned.
     *
     * @type {number}
     */
    get axis(): number;
    /**
     * Sets the total height of the capsule, cylinder or cone-shaped collision volume from tip to
     * tip. Defaults to 2.
     *
     * @type {number}
     */
    set height(arg: number);
    /**
     * Gets the total height of the capsule, cylinder or cone-shaped collision volume from tip to
     * tip.
     *
     * @type {number}
     */
    get height(): number;
    /**
     * Sets the asset or asset id for the model of the mesh collision volume. Defaults to null.
     *
     * @type {Asset|number|null}
     */
    set asset(arg: Asset | number | null);
    /**
     * Gets the asset or asset id for the model of the mesh collision volume.
     *
     * @type {Asset|number|null}
     */
    get asset(): Asset | number | null;
    /**
     * Sets the render asset or asset id of the mesh collision volume. Defaults to null.
     * If not set then the asset property will be checked instead.
     *
     * @type {Asset|number|null}
     */
    set renderAsset(arg: Asset | number | null);
    /**
     * Gets the render asset id of the mesh collision volume.
     *
     * @type {Asset|number|null}
     */
    get renderAsset(): Asset | number | null;
    /**
     * Sets whether the collision mesh should be treated as a convex hull. When false, the mesh can
     * only be used with a static body. When true, the mesh can be used with a static, dynamic or
     * kinematic body. Defaults to `false`.
     *
     * @type {boolean}
     */
    set convexHull(arg: boolean);
    /**
     * Gets whether the collision mesh should be treated as a convex hull.
     *
     * @type {boolean}
     */
    get convexHull(): boolean;
    set shape(arg: any);
    get shape(): any;
    /**
     * Sets the model that is added to the scene graph for the mesh collision volume.
     *
     * @type {Model | null}
     */
    set model(arg: Model | null);
    /**
     * Gets the model that is added to the scene graph for the mesh collision volume.
     *
     * @type {Model | null}
     */
    get model(): Model | null;
    set render(arg: any);
    get render(): any;
    /**
     * Sets whether checking for duplicate vertices should be enabled when creating collision meshes.
     *
     * @type {boolean}
     */
    set checkVertexDuplicates(arg: boolean);
    /**
     * Gets whether checking for duplicate vertices should be enabled when creating collision meshes.
     *
     * @type {boolean}
     */
    get checkVertexDuplicates(): boolean;
    /** @ignore */
    _setValue(name: any, value: any): void;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetType;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetHalfExtents;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetOffset;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetRadius;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetHeight;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetAxis;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetAsset;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetRenderAsset;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetModel;
    /**
     * @param {string} name - Property name.
     * @param {*} oldValue - Previous value of the property.
     * @param {*} newValue - New value of the property.
     * @private
     */
    private onSetRender;
    /**
     * @param {Asset} asset - Asset that was removed.
     * @private
     */
    private onAssetRemoved;
    /**
     * @param {Asset} asset - Asset that was removed.
     * @private
     */
    private onRenderAssetRemoved;
    /**
     * @param {*} shape - Ammo shape.
     * @returns {number|null} The shape's index in the child array of the compound shape.
     * @private
     */
    private getCompoundChildShapeIndex;
    /**
     * @param {GraphNode} parent - The parent node.
     * @private
     */
    private _onInsert;
    /** @private */
    private _updateCompound;
    /**
     * Returns the world position for the collision shape, taking into account of any offsets.
     *
     * @returns {Vec3} The world position for the collision shape.
     */
    getShapePosition(): Vec3;
    /**
     * Returns the world rotation for the collision shape, taking into account of any offsets.
     *
     * @returns {Quat} The world rotation for the collision.
     */
    getShapeRotation(): Quat;
    /** @private */
    private onBeforeRemove;
}
import { Component } from '../component.js';
import type { CollisionComponentData } from './data.js';
import { Vec3 } from '../../../core/math/vec3.js';
import { Quat } from '../../../core/math/quat.js';
import { Asset } from '../../asset/asset.js';
import type { Model } from '../../../scene/model.js';
import type { CollisionComponentSystem } from './system.js';
import type { Entity } from '../../entity.js';
