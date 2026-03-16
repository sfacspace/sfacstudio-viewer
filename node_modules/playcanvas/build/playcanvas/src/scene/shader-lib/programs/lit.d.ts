export const lit: ShaderGeneratorLit;
declare class ShaderGeneratorLit extends ShaderGenerator {
    generateKey(options: any): string;
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {LitMaterialOptions} options - The options to be passed to the backend.
     * @returns {object} Returns the created shader definition.
     */
    createShaderDefinition(device: GraphicsDevice, options: LitMaterialOptions): object;
}
import { ShaderGenerator } from './shader-generator.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import type { LitMaterialOptions } from '../../materials/lit-material-options.js';
export {};
