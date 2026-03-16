/**
 * Assigns the default material to device cache
 *
 * @param {GraphicsDevice} device - The graphics device used to own the material.
 * @param {StandardMaterial} material - The instance of {@link StandardMaterial}.
 */
export function setDefaultMaterial(device: GraphicsDevice, material: StandardMaterial): void;
/**
 * Returns default material, which is a material used instead of null material.
 *
 * @param {GraphicsDevice} device - The graphics device used to own the material.
 * @returns {StandardMaterial} The default instance of {@link StandardMaterial}.
 */
export function getDefaultMaterial(device: GraphicsDevice): StandardMaterial;
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { StandardMaterial } from './standard-material.js';
