/**
 * Picker object used to select mesh instances from screen coordinates. It can also optionally
 * capture depth information to determine world positions of picked points.
 *
 * The picker works by rendering mesh instances to an offscreen render target with unique IDs
 * encoded as colors. When queried, it reads back the pixel data to identify which mesh instance
 * was at the specified screen coordinates. If depth picking is enabled, it also captures depth
 * values to compute world positions.
 *
 * **Main API methods:**
 * - {@link Picker#prepare} - Renders the pick buffer (call once per frame before picking)
 * - {@link Picker#getSelectionAsync} - Get mesh instances in a screen area
 * - {@link Picker#getWorldPointAsync} - Get world position at screen coordinates (requires depth)
 *
 * **Performance considerations:**
 * The picker resolution can be set lower than the screen resolution for better performance,
 * though this reduces picking precision and may miss small objects.
 *
 * @example
 * // Create a picker with depth picking enabled at quarter resolution
 * const picker = new pc.Picker(app, canvas.width * 0.25, canvas.height * 0.25, true);
 *
 * // In your update loop, prepare the picker
 * picker.resize(canvas.width * 0.25, canvas.height * 0.25);
 * picker.prepare(camera, scene);
 *
 * // Pick mesh instances in an area
 * picker.getSelectionAsync(x, y, width, height).then((meshInstances) => {
 *     meshInstances.forEach((meshInstance) => {
 *         console.log('Picked:', meshInstance.node.name);
 *     });
 * });
 *
 * // Pick world position (requires depth enabled)
 * picker.getWorldPointAsync(x, y).then((worldPoint) => {
 *     if (worldPoint) {
 *         console.log(worldPoint);
 *     }
 * });
 *
 * @see {@link http://playcanvas.github.io/#/graphics/area-picker|Area Picker Example}
 * @see {@link https://playcanvas.github.io/#gaussian-splatting/picking|Gaussian Splatting Picking Example}
 *
 * @category Graphics
 */
export class Picker {
    /**
     * Create a new Picker instance.
     *
     * @param {AppBase} app - The application managing this picker instance.
     * @param {number} width - The width of the pick buffer in pixels.
     * @param {number} height - The height of the pick buffer in pixels.
     * @param {boolean} [depth] - Whether to enable depth picking. When enabled, depth
     * information is captured alongside mesh IDs using MRT. Defaults to false.
     */
    constructor(app: AppBase, width: number, height: number, depth?: boolean);
    /**
     * @type {import('../../platform/graphics/graphics-device.js').GraphicsDevice}
     * @private
     */
    private device;
    /**
     * @type {RenderPassPicker}
     * @private
     */
    private renderPass;
    /**
     * @type {boolean}
     * @private
     */
    private depth;
    /** @type {number} */
    width: number;
    /** @type {number} */
    height: number;
    /**
     * Internal render target.
     *
     * @type {RenderTarget|null}
     * @private
     */
    private renderTarget;
    /**
     * Color buffer texture for pick IDs.
     *
     * @type {Texture|null}
     * @private
     */
    private colorBuffer;
    /**
     * Optional depth buffer texture for depth picking.
     *
     * @type {Texture|null}
     * @private
     */
    private depthBuffer;
    /**
     * Internal render target for reading the depth buffer.
     *
     * @type {RenderTarget|null}
     * @private
     */
    private renderTargetDepth;
    /**
     * Mapping table from ids to meshInstances.
     *
     * @type {Map<number, MeshInstance>}
     * @private
     */
    private mapping;
    /**
     * When the device is destroyed, this allows us to ignore async results.
     *
     * @type {boolean}
     * @private
     */
    private deviceValid;
    /**
     * Frees resources associated with this picker.
     */
    destroy(): void;
    /**
     * Return the list of mesh instances selected by the specified rectangle in the previously
     * prepared pick buffer. The rectangle using top-left coordinate system.
     *
     * Note: This function is not supported on WebGPU. Use {@link Picker#getSelectionAsync} instead.
     * Note: This function is blocks the main thread while reading pixels from GPU memory. It's
     * recommended to use {@link Picker#getSelectionAsync} instead.
     *
     * @param {number} x - The left edge of the rectangle.
     * @param {number} y - The top edge of the rectangle.
     * @param {number} [width] - The width of the rectangle. Defaults to 1.
     * @param {number} [height] - The height of the rectangle. Defaults to 1.
     * @returns {MeshInstance[]} An array of mesh instances that are in the selection.
     * @example
     * // Get the selection at the point (10,20)
     * const selection = picker.getSelection(10, 20);
     * @example
     * // Get all models in rectangle with corners at (10,20) and (20,40)
     * const selection = picker.getSelection(10, 20, 10, 20);
     */
    getSelection(x: number, y: number, width?: number, height?: number): MeshInstance[];
    /**
     * Return the list of mesh instances selected by the specified rectangle in the previously
     * prepared pick buffer. The rectangle uses top-left coordinate system.
     *
     * This method is asynchronous and does not block the execution.
     *
     * @param {number} x - The left edge of the rectangle.
     * @param {number} y - The top edge of the rectangle.
     * @param {number} [width] - The width of the rectangle. Defaults to 1.
     * @param {number} [height] - The height of the rectangle. Defaults to 1.
     * @returns {Promise<MeshInstance[]>} - Promise that resolves with an array of mesh instances
     * that are in the selection.
     * @example
     * // Get the mesh instances at the rectangle with start at (10,20) and size of (5,5)
     * picker.getSelectionAsync(10, 20, 5, 5).then((meshInstances) => {
     *    console.log(meshInstances);
     * });
     */
    getSelectionAsync(x: number, y: number, width?: number, height?: number): Promise<MeshInstance[]>;
    /**
     * Helper method to read pixels from a texture asynchronously.
     *
     * @param {Texture} texture - The texture to read from.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     * @param {RenderTarget} renderTarget - The render target to use for reading.
     * @returns {Promise<Uint8Array>} Promise resolving to the pixel data.
     * @private
     */
    private _readTexture;
    /**
     * Return the world position of the mesh instance picked at the specified screen coordinates.
     *
     * @param {number} x - The x coordinate of the pixel to pick.
     * @param {number} y - The y coordinate of the pixel to pick.
     * @returns {Promise<Vec3|null>} Promise that resolves with the world position of the picked point,
     * or null if no depth is available or nothing was picked.
     * @example
     * // Get the world position at screen coordinates (100, 50)
     * picker.getWorldPointAsync(100, 50).then((worldPoint) => {
     *     if (worldPoint) {
     *         console.log('World position:', worldPoint);
     *         // Use the world position
     *     } else {
     *         console.log('No object at this position');
     *     }
     * });
     */
    getWorldPointAsync(x: number, y: number): Promise<Vec3 | null>;
    /**
     * Return the depth value of the mesh instance picked at the specified screen coordinates.
     *
     * @param {number} x - The x coordinate of the pixel to pick.
     * @param {number} y - The y coordinate of the pixel to pick.
     * @returns {Promise<number|null>} Promise that resolves with the depth value of the picked point
     * (in 0..1 range), or null if depth picking is not enabled or no object was picked.
     * @ignore
     */
    getPointDepthAsync(x: number, y: number): Promise<number | null>;
    sanitizeRect(x: any, y: any, width: any, height: any): Vec4;
    decodePixels(pixels: any, mapping: any): any[];
    createTexture(name: any): Texture;
    allocateRenderTarget(): void;
    releaseRenderTarget(): void;
    /**
     * Primes the pick buffer with a rendering of the specified models from the point of view of
     * the supplied camera. Once the pick buffer has been prepared, {@link Picker#getSelection} can
     * be called multiple times on the same picker object. Therefore, if the models or camera do
     * not change in any way, {@link Picker#prepare} does not need to be called again.
     *
     * @param {CameraComponent} camera - The camera component used to render the scene.
     * @param {Scene} scene - The scene containing the pickable mesh instances.
     * @param {Layer[]} [layers] - Layers from which objects will be picked. If not supplied, all
     * layers of the specified camera will be used.
     */
    prepare(camera: CameraComponent, scene: Scene, layers?: Layer[]): void;
    /**
     * Sets the resolution of the pick buffer. The pick buffer resolution does not need to match
     * the resolution of the corresponding frame buffer use for general rendering of the 3D scene.
     * However, the lower the resolution of the pick buffer, the less accurate the selection
     * results returned by {@link Picker#getSelection}. On the other hand, smaller pick buffers
     * will yield greater performance, so there is a trade off.
     *
     * @param {number} width - The width of the pick buffer in pixels.
     * @param {number} height - The height of the pick buffer in pixels.
     */
    resize(width: number, height: number): void;
}
import type { MeshInstance } from '../../scene/mesh-instance.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Vec4 } from '../../core/math/vec4.js';
import { Texture } from '../../platform/graphics/texture.js';
import type { CameraComponent } from '../components/camera/component.js';
import type { Scene } from '../../scene/scene.js';
import { Layer } from '../../scene/layer.js';
import type { AppBase } from '../app-base.js';
