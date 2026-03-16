/**
 * @import { XrMeshDetection } from './xr-mesh-detection.js'
 */
/**
 * Detected Mesh instance that provides its transform (position, rotation), triangles (vertices,
 * indices) and its semantic label. Any of its properties can change during its lifetime.
 *
 * @category XR
 */
export class XrMesh extends EventHandler {
    /**
     * Fired when an {@link XrMesh} is removed.
     *
     * @event
     * @example
     * mesh.once('remove', () => {
     *     // mesh is no longer available
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Fired when {@link XrMesh} attributes such as vertices, indices and/or label have been
     * changed. Position and rotation can change at any time without triggering a `change` event.
     *
     * @event
     * @example
     * mesh.on('change', () => {
     *     // mesh attributes have been changed
     * });
     */
    static EVENT_CHANGE: string;
    /**
     * Create a new XrMesh instance.
     *
     * @param {XrMeshDetection} meshDetection - Mesh Detection
     * interface.
     * @param {XRMesh} xrMesh - XRMesh that is instantiated by WebXR system.
     * @ignore
     */
    constructor(meshDetection: XrMeshDetection, xrMesh: XRMesh);
    /**
     * @type {XrMeshDetection}
     * @private
     */
    private _meshDetection;
    /**
     * @type {XRMesh}
     * @private
     */
    private _xrMesh;
    /**
     * @type {number}
     * @private
     */
    private _lastChanged;
    /**
     * @type {Vec3}
     * @private
     */
    private _position;
    /**
     * @type {Quat}
     * @private
     */
    private _rotation;
    /**
     * @type {XRMesh}
     * @ignore
     */
    get xrMesh(): XRMesh;
    /**
     * Semantic Label of a mesh that is provided by underlying system. Current list includes (but
     * not limited to): https://github.com/immersive-web/semantic-labels/blob/master/labels.json
     *
     * @type {string}
     */
    get label(): string;
    /**
     * Array of mesh vertices. This array contains 3 components per vertex (`x, y, z`).
     *
     * @type {Float32Array}
     */
    get vertices(): Float32Array;
    /**
     * Array of mesh indices.
     *
     * @type {Uint32Array}
     */
    get indices(): Uint32Array;
    /** @ignore */
    destroy(): void;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * Get the world space position of a mesh.
     *
     * @returns {Vec3} The world space position of a mesh.
     */
    getPosition(): Vec3;
    /**
     * Get the world space rotation of a mesh.
     *
     * @returns {Quat} The world space rotation of a mesh.
     */
    getRotation(): Quat;
}
import { EventHandler } from '../../core/event-handler.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import type { XrMeshDetection } from './xr-mesh-detection.js';
