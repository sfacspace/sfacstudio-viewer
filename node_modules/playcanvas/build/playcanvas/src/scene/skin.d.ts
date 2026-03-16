/**
 * @import { GraphicsDevice } from '../platform/graphics/graphics-device.js'
 * @import { Mat4 } from '../core/math/mat4.js'
 */
/**
 * A skin contains data about the bones in a hierarchy that drive a skinned mesh animation.
 * Specifically, the skin stores the bone name and inverse bind matrix and for each bone. Inverse
 * bind matrices are instrumental in the mathematics of vertex skinning.
 *
 * @category Graphics
 */
export class Skin {
    /**
     * Create a new Skin instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this skin.
     * @param {Mat4[]} ibp - The array of inverse bind matrices.
     * @param {string[]} boneNames - The array of bone names for the bones referenced by this skin.
     */
    constructor(graphicsDevice: GraphicsDevice, ibp: Mat4[], boneNames: string[]);
    device: GraphicsDevice;
    inverseBindPose: Mat4[];
    boneNames: string[];
}
import type { GraphicsDevice } from '../platform/graphics/graphics-device.js';
import type { Mat4 } from '../core/math/mat4.js';
