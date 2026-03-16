/**
 * Callback used by {@link XrAnchor#persist}.
 */
export type XrAnchorPersistCallback = (err: Error | null, uuid: string | null) => void;
/**
 * Callback used by {@link XrAnchor#forget}.
 */
export type XrAnchorForgetCallback = (err: Error | null) => void;
/**
 * @import { XrAnchors } from './xr-anchors.js'
 */
/**
 * @callback XrAnchorPersistCallback
 * Callback used by {@link XrAnchor#persist}.
 * @param {Error|null} err - The Error object if failed to persist an anchor or null.
 * @param {string|null} uuid - Unique string that can be used to restore an {@link XrAnchor} in
 * another session.
 * @returns {void}
 */
/**
 * @callback XrAnchorForgetCallback
 * Callback used by {@link XrAnchor#forget}.
 * @param {Error|null} err - The Error object if failed to forget an {@link XrAnchor} or null if
 * succeeded.
 * @returns {void}
 */
/**
 * An anchor keeps track of a position and rotation that is fixed relative to the real world. This
 * allows the application to adjust the location of virtual objects placed in the scene in a way
 * that helps with maintaining the illusion that the placed objects are really present in the
 * user's environment.
 *
 * @category XR
 */
export class XrAnchor extends EventHandler {
    /**
     * Fired when an anchor is destroyed.
     *
     * @event
     * @example
     * // once anchor is destroyed
     * anchor.once('destroy', () => {
     *     // destroy its related entity
     *     entity.destroy();
     * });
     */
    static EVENT_DESTROY: string;
    /**
     * Fired when an anchor's position and/or rotation is changed.
     *
     * @event
     * @example
     * anchor.on('change', () => {
     *     // anchor has been updated
     *     entity.setPosition(anchor.getPosition());
     *     entity.setRotation(anchor.getRotation());
     * });
     */
    static EVENT_CHANGE: string;
    /**
     * Fired when an anchor has has been persisted. The handler is passed the UUID string that can
     * be used to restore this anchor.
     *
     * @event
     * @example
     * anchor.on('persist', (uuid) => {
     *     // anchor has been persisted
     * });
     */
    static EVENT_PERSIST: string;
    /**
     * Fired when an anchor has been forgotten.
     *
     * @event
     * @example
     * anchor.on('forget', () => {
     *     // anchor has been forgotten
     * });
     */
    static EVENT_FORGET: string;
    /**
     * @param {XrAnchors} anchors - Anchor manager.
     * @param {object} xrAnchor - Native XRAnchor object that is provided by WebXR API.
     * @param {string|null} uuid - ID string associated with a persistent anchor.
     * @ignore
     */
    constructor(anchors: XrAnchors, xrAnchor: object, uuid?: string | null);
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
     * @type {string|null}
     * @private
     */
    private _uuid;
    /**
     * @type {XrAnchorPersistCallback[]|null}
     * @private
     */
    private _uuidRequests;
    _anchors: XrAnchors;
    _xrAnchor: any;
    /**
     * Destroy an anchor.
     */
    destroy(): void;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * Get the world space position of an anchor.
     *
     * @returns {Vec3} The world space position of an anchor.
     */
    getPosition(): Vec3;
    /**
     * Get the world space rotation of an anchor.
     *
     * @returns {Quat} The world space rotation of an anchor.
     */
    getRotation(): Quat;
    /**
     * Persists the anchor between WebXR sessions by generating a universally unique identifier
     * (UUID) for the anchor. This UUID can be used later to restore the anchor from the underlying
     * system. Note that the underlying system may have a limit on the number of anchors that can
     * be persisted per origin.
     *
     * @param {XrAnchorPersistCallback} [callback] - Optional callback function to be called when
     * the persistent UUID has been generated or if an error occurs.
     * @example
     * // Persist the anchor and log the UUID or error
     * anchor.persist((err, uuid) => {
     *     if (err) {
     *         console.error('Failed to persist anchor:', err);
     *     } else {
     *         console.log('Anchor persisted with UUID:', uuid);
     *     }
     * });
     */
    persist(callback?: XrAnchorPersistCallback): void;
    /**
     * Removes the persistent UUID of an anchor from the underlying system. This effectively makes
     * the anchor non-persistent, so it will not be restored in future WebXR sessions.
     *
     * @param {XrAnchorForgetCallback} [callback] - Optional callback function to be called when
     * the anchor has been forgotten or if an error occurs.
     * @example
     * // Forget the anchor and log the result or error
     * anchor.forget((err) => {
     *     if (err) {
     *         console.error('Failed to forget anchor:', err);
     *     } else {
     *         console.log('Anchor has been forgotten');
     *     }
     * });
     */
    forget(callback?: XrAnchorForgetCallback): void;
    /**
     * Gets the UUID string of a persisted anchor or null if the anchor is not persisted.
     *
     * @type {null|string}
     */
    get uuid(): null | string;
    /**
     * Gets whether an anchor is persistent.
     *
     * @type {boolean}
     */
    get persistent(): boolean;
}
import { EventHandler } from '../../core/event-handler.js';
import type { XrAnchors } from './xr-anchors.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
