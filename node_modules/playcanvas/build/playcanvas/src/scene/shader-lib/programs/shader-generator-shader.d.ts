export const shaderGeneratorShader: ShaderGeneratorShader;
declare class ShaderGeneratorShader extends ShaderGenerator {
    generateKey(options: any): string;
    createAttributesDefinition(definitionOptions: any, options: any): void;
    createVertexDefinition(definitionOptions: any, options: any, sharedIncludes: any, wgsl: any): void;
    createFragmentDefinition(definitionOptions: any, options: any, sharedIncludes: any, wgsl: any): void;
    createShaderDefinition(device: any, options: any): any;
}
import { ShaderGenerator } from './shader-generator.js';
export {};
