/**
 * @import { Mesh } from './mesh.js'
 */
/**
 * A `Render` contains an array of meshes that are referenced by a single hierarchy node in a GLB
 * scene, and are accessible using the {@link ContainerResource#renders} property. A `Render` is
 * the resource of a Render Asset. They are usually created by the GLB loader and not created by
 * hand.
 *
 * @ignore
 */
export class Render extends EventHandler {
    /**
     * Fired when the meshes are set on the render. The handler is passed the an array of
     * {@link Mesh} objects.
     *
     * @event
     * @example
     * render.on('set:meshes', (meshes) => {
     *     console.log(`Render has ${meshes.length} meshes`);
     * });
     */
    static EVENT_SETMESHES: string;
    /**
     * Meshes are reference counted, and this class owns the references and is responsible for
     * releasing the meshes when they are no longer referenced.
     *
     * @type {Array<Mesh|null>|null}
     * @private
     */
    private _meshes;
    /**
     * Sets the meshes that the render contains.
     *
     * @type {Array<Mesh|null>|null}
     */
    set meshes(value: Array<Mesh | null> | null);
    /**
     * Gets the meshes that the render contains.
     *
     * @type {Array<Mesh|null>|null}
     */
    get meshes(): Array<Mesh | null> | null;
    destroy(): void;
    /**
     * Decrement references to meshes. Destroy the ones with zero references.
     */
    decRefMeshes(): void;
    /**
     * Increments ref count on all meshes.
     */
    incRefMeshes(): void;
}
import { EventHandler } from '../core/event-handler.js';
import type { Mesh } from './mesh.js';
