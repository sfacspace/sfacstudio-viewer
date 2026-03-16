/**
 * @import { XrManager } from './xr-manager.js'
 */
/**
 * Image Tracking provides the ability to track real world images using provided image samples and
 * their estimated sizes. The underlying system will assume that the tracked image can move and
 * rotate in the real world and will try to provide transformation estimates and its tracking
 * state.
 *
 * @category XR
 */
export class XrImageTracking extends EventHandler {
    /**
     * Fired when the XR session is started, but image tracking failed to process the provided
     * images. The handler is passed the Error object.
     *
     * @event
     * @example
     * app.xr.imageTracking.on('error', (err) => {
     *     console.error(err.message);
     * });
     */
    static EVENT_ERROR: string;
    /**
     * Create a new XrImageTracking instance.
     *
     * @param {XrManager} manager - WebXR Manager.
     * @ignore
     */
    constructor(manager: XrManager);
    /**
     * @type {XrManager}
     * @private
     */
    private _manager;
    /**
     * @type {boolean}
     * @private
     */
    private _supported;
    /**
     * @type {boolean}
     * @private
     */
    private _available;
    /**
     * @type {XrTrackedImage[]}
     * @private
     */
    private _images;
    /**
     * Add an image for image tracking. A width can also be provided to help the underlying system
     * estimate the appropriate transformation. Modifying the tracked images list is only possible
     * before an AR session is started.
     *
     * @param {HTMLCanvasElement|HTMLImageElement|SVGImageElement|HTMLVideoElement|Blob|ImageData|ImageBitmap} image -
     * Image that is matching real world image as close as possible. Resolution of images should be
     * at least 300x300. High resolution does _not_ improve tracking performance. The color of the
     * image is irrelevant, so grayscale images can be used. Images with too many geometric
     * features or repeating patterns will reduce tracking stability.
     * @param {number} width - Width (in meters) of image in the real world. Providing this value
     * as close to the real value will improve tracking quality.
     * @returns {XrTrackedImage|null} Tracked image object that will contain tracking information.
     * Returns null if image tracking is not supported or if the XR manager is not active.
     * @example
     * // image of a book cover that has width of 20cm (0.2m)
     * app.xr.imageTracking.add(bookCoverImg, 0.2);
     */
    add(image: HTMLCanvasElement | HTMLImageElement | SVGImageElement | HTMLVideoElement | Blob | ImageData | ImageBitmap, width: number): XrTrackedImage | null;
    /**
     * Remove an image from image tracking.
     *
     * @param {XrTrackedImage} trackedImage - Tracked image to be removed. Modifying the tracked
     * images list is only possible before an AR session is started.
     */
    remove(trackedImage: XrTrackedImage): void;
    /** @private */
    private _onSessionStart;
    /** @private */
    private _onSessionEnd;
    /**
     * @param {Function} callback - Function to call when all images have been prepared as image
     * bitmaps.
     * @ignore
     */
    prepareImages(callback: Function): void;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * True if Image Tracking is supported.
     *
     * @type {boolean}
     */
    get supported(): boolean;
    /**
     * True if Image Tracking is available. This information is only available when the
     * XR session has started, and will be true if image tracking is supported and
     * images were provided and they have been processed successfully.
     *
     * @type {boolean}
     */
    get available(): boolean;
    /**
     * List of {@link XrTrackedImage} that contain tracking information.
     *
     * @type {XrTrackedImage[]}
     */
    get images(): XrTrackedImage[];
}
import { EventHandler } from '../../core/event-handler.js';
import { XrTrackedImage } from './xr-tracked-image.js';
import type { XrManager } from './xr-manager.js';
