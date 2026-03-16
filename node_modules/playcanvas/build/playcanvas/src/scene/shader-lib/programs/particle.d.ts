export const particle: ShaderGeneratorParticle;
declare class ShaderGeneratorParticle extends ShaderGenerator {
    generateKey(options: any): string;
    createVertexDefines(options: any, attributes: any): Map<any, any>;
    createFragmentDefines(options: any): Map<any, any>;
    createShaderDefinition(device: any, options: any): any;
}
import { ShaderGenerator } from './shader-generator.js';
export {};
