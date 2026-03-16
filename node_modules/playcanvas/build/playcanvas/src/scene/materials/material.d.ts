/**
 * - The description of the parameters used by the
 * Material#getShaderVariant function.
 */
export type ShaderVariantParams = {
    /**
     * - The graphics device.
     */
    device: GraphicsDevice;
    /**
     * - The scene.
     */
    scene: Scene;
    /**
     * - The object definitions.
     */
    objDefs: number;
    /**
     * - The camera shader parameters.
     */
    cameraShaderParams: CameraShaderParams;
    /**
     * - The shader pass.
     */
    pass: number;
    /**
     * - The sorted lights.
     */
    sortedLights: Light[][];
    /**
     * - The view uniform format.
     */
    viewUniformFormat: UniformBufferFormat | undefined;
    /**
     * - The view bind group format.
     */
    viewBindGroupFormat: BindGroupFormat | undefined;
    /**
     * - The vertex format.
     */
    vertexFormat: VertexFormat;
};
/**
 * @typedef {object} ShaderVariantParams - The description of the parameters used by the
 * Material#getShaderVariant function.
 * @property {GraphicsDevice} device - The graphics device.
 * @property {Scene} scene - The scene.
 * @property {number} objDefs - The object definitions.
 * @property {CameraShaderParams} cameraShaderParams - The camera shader parameters.
 * @property {number} pass - The shader pass.
 * @property {Light[][]} sortedLights - The sorted lights.
 * @property {UniformBufferFormat|undefined} viewUniformFormat - The view uniform format.
 * @property {BindGroupFormat|undefined} viewBindGroupFormat - The view bind group format.
 * @property {VertexFormat} vertexFormat - The vertex format.
 * @ignore
 */
/**
 * A material determines how a particular {@link MeshInstance} is rendered, and specifies
 * render state including uniforms, textures, defines, and other properties.
 *
 * This is a base class and cannot be instantiated and used directly. Only subclasses such
 * as {@link ShaderMaterial} and {@link StandardMaterial} can be used to define materials
 * for rendering.
 *
 * @category Graphics
 */
export class Material {
    /**
     * The mesh instances referencing this material
     *
     * @type {MeshInstance[]}
     * @private
     */
    private meshInstances;
    /**
     * The name of the material.
     *
     * @type {string}
     */
    name: string;
    /**
     * A unique id the user can assign to the material. The engine internally does not use this for
     * anything, and the user can assign a value to this id for any purpose they like. Defaults to
     * an empty string.
     *
     * @type {string}
     */
    userId: string;
    id: number;
    /**
     * The cache of shader variants generated for this material. The key represents the unique
     * variant, the value is the shader.
     *
     * @type {Map<number, Shader>}
     * @ignore
     */
    variants: Map<number, Shader>;
    /**
     * The set of defines used to generate the shader variants.
     *
     * @type {Map<string, string>}
     * @ignore
     */
    defines: Map<string, string>;
    _definesDirty: boolean;
    parameters: {};
    /**
     * The alpha test reference value to control which fragments are written to the currently
     * active render target based on alpha value. All fragments with an alpha value of less than
     * the alphaTest reference value will be discarded. alphaTest defaults to 0 (all fragments
     * pass).
     *
     * @type {number}
     */
    alphaTest: number;
    /**
     * Enables or disables alpha to coverage (WebGL2 only). When enabled, and if hardware
     * anti-aliasing is on, limited order-independent transparency can be achieved. Quality depends
     * on the number of MSAA samples of the current render target. It can nicely soften edges of
     * otherwise sharp alpha cutouts, but isn't recommended for large area semi-transparent
     * surfaces. Note, that you don't need to enable blending to make alpha to coverage work. It
     * will work without it, just like alphaTest.
     *
     * @type {boolean}
     */
    alphaToCoverage: boolean;
    /** @ignore */
    _blendState: BlendState;
    /** @ignore */
    _depthState: DepthState;
    /**
     * Controls how triangles are culled based on their face direction with respect to the
     * viewpoint. Can be:
     *
     * - {@link CULLFACE_NONE}: Do not cull triangles based on face direction.
     * - {@link CULLFACE_BACK}: Cull the back faces of triangles (do not render triangles facing
     * away from the view point).
     * - {@link CULLFACE_FRONT}: Cull the front faces of triangles (do not render triangles facing
     * towards the view point).
     *
     * Defaults to {@link CULLFACE_BACK}.
     *
     * @type {number}
     */
    cull: number;
    /**
     * Stencil parameters for front faces (default is null).
     *
     * @type {StencilParameters|null}
     */
    stencilFront: StencilParameters | null;
    /**
     * Stencil parameters for back faces (default is null).
     *
     * @type {StencilParameters|null}
     */
    stencilBack: StencilParameters | null;
    /**
     * @type {ShaderChunks|null}
     * @private
     */
    private _shaderChunks;
    _oldChunks: {};
    _dirtyShader: boolean;
    /**
     * Returns true if the material has custom shader chunks.
     *
     * @type {boolean}
     * @ignore
     */
    get hasShaderChunks(): boolean;
    /**
     * Returns the shader chunks for the material. Those get allocated if they are not already.
     *
     * @type {ShaderChunks}
     * @ignore
     */
    get shaderChunks(): ShaderChunks;
    /**
     * Returns an object containing shader chunks for a specific shader language for the material.
     * These chunks define custom GLSL or WGSL code used to construct the final shader for the
     * material. The chunks can be also be included in shaders using the `#include "ChunkName"`
     * directive.
     *
     * On the WebGL platform:
     *  - If GLSL chunks are provided, they are used directly.
     *
     * On the WebGPU platform:
     * - If WGSL chunks are provided, they are used directly.
     * - If only GLSL chunks are provided, a GLSL shader is generated and then transpiled to WGSL,
     * which is less efficient.
     *
     * To ensure faster shader compilation, it is recommended to provide shader chunks for all
     * supported platforms.
     *
     * A simple example on how to override a shader chunk providing emissive color for both GLSL and
     * WGSL to simply return a red color:
     *
     * ```javascript
     * material.getShaderChunks(pc.SHADERLANGUAGE_GLSL).set('emissivePS', `
     *     void getEmission() {
     *         dEmission = vec3(1.0, 0.0, 1.0);
     *     }
     * `);
     *
     * material.getShaderChunks(pc.SHADERLANGUAGE_WGSL).set('emissivePS', `
     *     fn getEmission() {
     *         dEmission = vec3f(1.0, 0.0, 1.0);
     *     }
     * `);
     *
     * // call update to apply the changes
     * material.update();
     * ```
     *
     * @param {string} [shaderLanguage] - Specifies the shader language of shaders. Defaults to
     * {@link SHADERLANGUAGE_GLSL}.
     * @returns {ShaderChunkMap} - The shader chunks for the specified shader language.
     */
    getShaderChunks(shaderLanguage?: string): ShaderChunkMap;
    /**
     * Sets the version of the shader chunks.
     *
     * This should be a string containing the current engine major and minor version (e.g., '2.8'
     * for engine v2.8.1) and ensures compatibility with the current engine version. When providing
     * custom shader chunks, set this to the latest supported version. If a future engine release no
     * longer supports the specified version, a warning will be issued. In that case, update your
     * shader chunks to match the new format and set this to the latest version accordingly.
     *
     * @type {string}
     */
    set shaderChunksVersion(value: string);
    /**
     * Returns the version of the shader chunks.
     *
     * @type {string}
     */
    get shaderChunksVersion(): string;
    set chunks(value: {});
    get chunks(): {};
    /**
     * Sets the offset for the output depth buffer value. Useful for decals to prevent z-fighting.
     * Typically a small negative value (-0.1) is used to render the mesh slightly closer to the
     * camera.
     *
     * @type {number}
     */
    set depthBias(value: number);
    /**
     * Gets the offset for the output depth buffer value.
     *
     * @type {number}
     */
    get depthBias(): number;
    /**
     * Sets the offset for the output depth buffer value based on the slope of the triangle
     * relative to the camera.
     *
     * @type {number}
     */
    set slopeDepthBias(value: number);
    /**
     * Gets the offset for the output depth buffer value based on the slope of the triangle
     * relative to the camera.
     *
     * @type {number}
     */
    get slopeDepthBias(): number;
    _shaderVersion: number;
    _scene: any;
    dirty: boolean;
    /**
     * Sets whether the red channel is written to the color buffer. If true, the red component of
     * fragments generated by the shader of this material is written to the color buffer of the
     * currently active render target. If false, the red component will not be written. Defaults to
     * true.
     *
     * @type {boolean}
     */
    set redWrite(value: boolean);
    /**
     * Gets whether the red channel is written to the color buffer.
     *
     * @type {boolean}
     */
    get redWrite(): boolean;
    /**
     * Sets whether the green channel is written to the color buffer. If true, the red component of
     * fragments generated by the shader of this material is written to the color buffer of the
     * currently active render target. If false, the green component will not be written. Defaults
     * to true.
     *
     * @type {boolean}
     */
    set greenWrite(value: boolean);
    /**
     * Gets whether the green channel is written to the color buffer.
     *
     * @type {boolean}
     */
    get greenWrite(): boolean;
    /**
     * Sets whether the blue channel is written to the color buffer. If true, the red component of
     * fragments generated by the shader of this material is written to the color buffer of the
     * currently active render target. If false, the blue component will not be written. Defaults
     * to true.
     *
     * @type {boolean}
     */
    set blueWrite(value: boolean);
    /**
     * Gets whether the blue channel is written to the color buffer.
     *
     * @type {boolean}
     */
    get blueWrite(): boolean;
    /**
     * Sets whether the alpha channel is written to the color buffer. If true, the red component of
     * fragments generated by the shader of this material is written to the color buffer of the
     * currently active render target. If false, the alpha component will not be written. Defaults
     * to true.
     *
     * @type {boolean}
     */
    set alphaWrite(value: boolean);
    /**
     * Gets whether the alpha channel is written to the color buffer.
     *
     * @type {boolean}
     */
    get alphaWrite(): boolean;
    get transparent(): boolean;
    _updateTransparency(): void;
    /**
     * Sets the blend state for this material. Controls how fragment shader outputs are blended
     * when being written to the currently active render target. This overwrites blending type set
     * using {@link Material#blendType}, and offers more control over blending.
     *
     * @type {BlendState}
     */
    set blendState(value: BlendState);
    /**
     * Gets the blend state for this material.
     *
     * @type {BlendState}
     */
    get blendState(): BlendState;
    /**
     * Sets the blend mode for this material. Controls how fragment shader outputs are blended when
     * being written to the currently active render target. Can be:
     *
     * - {@link BLEND_SUBTRACTIVE}: Subtract the color of the source fragment from the destination
     * fragment and write the result to the frame buffer.
     * - {@link BLEND_ADDITIVE}: Add the color of the source fragment to the destination fragment
     * and write the result to the frame buffer.
     * - {@link BLEND_NORMAL}: Enable simple translucency for materials such as glass. This is
     * equivalent to enabling a source blend mode of {@link BLENDMODE_SRC_ALPHA} and a destination
     * blend mode of {@link BLENDMODE_ONE_MINUS_SRC_ALPHA}.
     * - {@link BLEND_NONE}: Disable blending.
     * - {@link BLEND_PREMULTIPLIED}: Similar to {@link BLEND_NORMAL} expect the source fragment is
     * assumed to have already been multiplied by the source alpha value.
     * - {@link BLEND_MULTIPLICATIVE}: Multiply the color of the source fragment by the color of the
     * destination fragment and write the result to the frame buffer.
     * - {@link BLEND_ADDITIVEALPHA}: Same as {@link BLEND_ADDITIVE} except the source RGB is
     * multiplied by the source alpha.
     * - {@link BLEND_MULTIPLICATIVE2X}: Multiplies colors and doubles the result.
     * - {@link BLEND_SCREEN}: Softer version of additive.
     * - {@link BLEND_MIN}: Minimum color.
     * - {@link BLEND_MAX}: Maximum color.
     *
     * Defaults to {@link BLEND_NONE}.
     *
     * @type {number}
     */
    set blendType(type: number);
    /**
     * Gets the blend mode for this material.
     *
     * @type {number}
     */
    get blendType(): number;
    /**
     * Sets the depth state. Note that this can also be done by using {@link Material#depthTest},
     * {@link Material#depthFunc} and {@link Material#depthWrite}.
     *
     * @type {DepthState}
     */
    set depthState(value: DepthState);
    /**
     * Gets the depth state.
     *
     * @type {DepthState}
     */
    get depthState(): DepthState;
    /**
     * Sets whether depth testing is enabled. If true, fragments generated by the shader of this
     * material are only written to the current render target if they pass the depth test. If
     * false, fragments generated by the shader of this material are written to the current render
     * target regardless of what is in the depth buffer. Defaults to true.
     *
     * @type {boolean}
     */
    set depthTest(value: boolean);
    /**
     * Gets whether depth testing is enabled.
     *
     * @type {boolean}
     */
    get depthTest(): boolean;
    /**
     * Sets the depth test function. Controls how the depth of new fragments is compared against
     * the current depth contained in the depth buffer. Can be:
     *
     * - {@link FUNC_NEVER}: don't draw
     * - {@link FUNC_LESS}: draw if new depth < depth buffer
     * - {@link FUNC_EQUAL}: draw if new depth == depth buffer
     * - {@link FUNC_LESSEQUAL}: draw if new depth <= depth buffer
     * - {@link FUNC_GREATER}: draw if new depth > depth buffer
     * - {@link FUNC_NOTEQUAL}: draw if new depth != depth buffer
     * - {@link FUNC_GREATEREQUAL}: draw if new depth >= depth buffer
     * - {@link FUNC_ALWAYS}: always draw
     *
     * Defaults to {@link FUNC_LESSEQUAL}.
     *
     * @type {number}
     */
    set depthFunc(value: number);
    /**
     * Gets the depth test function.
     *
     * @type {number}
     */
    get depthFunc(): number;
    /**
     * Sets whether depth writing is enabled. If true, fragments generated by the shader of this
     * material write a depth value to the depth buffer of the currently active render target. If
     * false, no depth value is written. Defaults to true.
     *
     * @type {boolean}
     */
    set depthWrite(value: boolean);
    /**
     * Gets whether depth writing is enabled.
     *
     * @type {boolean}
     */
    get depthWrite(): boolean;
    /**
     * Copy a material.
     *
     * @param {Material} source - The material to copy.
     * @returns {Material} The destination material.
     */
    copy(source: Material): Material;
    /**
     * Clone a material.
     *
     * @returns {this} A newly cloned material.
     */
    clone(): this;
    _updateMeshInstanceKeys(): void;
    updateUniforms(device: any, scene: any): void;
    /**
     * @param {ShaderVariantParams} params - The parameters used to generate the shader variant.
     * @ignore
     */
    getShaderVariant(params: ShaderVariantParams): void;
    /**
     * Applies any changes made to the material's properties. This method should be called after
     * modifying material properties to ensure the changes take effect.
     *
     * The method will clear cached shader variants and trigger recompilation if:
     * - Modified material properties require a different shader variant (e.g., enabling/disabling
     *   textures or other properties that affect shader generation)
     * - Material-specific shader chunks (from {@link Material#getShaderChunks}) have been modified
     * - Global shader chunks (from {@link ShaderChunks.get}) have been modified
     * - Material defines have been changed
     *
     * Note: Shaders are not compiled immediately. Instead, existing shader variants are cleared
     * and new variants will be compiled on-demand as they are needed for different render passes
     * (e.g., {@link SHADER_FORWARD}, {@link SHADER_SHADOW}).
     *
     * When global shader chunks are modified, `update()` must be called on each material that
     * should reflect those changes.
     */
    update(): void;
    clearParameters(): void;
    getParameters(): {};
    clearVariants(): void;
    /**
     * Retrieves the specified shader parameter from a material.
     *
     * @param {string} name - The name of the parameter to query.
     * @returns {object} The named parameter.
     */
    getParameter(name: string): object;
    _setParameterSimple(name: any, data: any): void;
    /**
     * Sets a shader parameter on a material.
     *
     * @param {string} name - The name of the parameter to set.
     * @param {number|number[]|ArrayBufferView|Texture|StorageBuffer} data - The value for the specified parameter.
     */
    setParameter(name: string, data: number | number[] | ArrayBufferView | Texture | StorageBuffer): void;
    /**
     * Deletes a shader parameter on a material.
     *
     * @param {string} name - The name of the parameter to delete.
     */
    deleteParameter(name: string): void;
    setParameters(device: any, names: any): void;
    /**
     * Adds or removes a define on the material. Defines can be used to enable or disable various
     * parts of the shader code.
     *
     * @param {string} name - The name of the define to set.
     * @param {string|undefined|boolean} value - The value of the define. If undefined or false, the
     * define is removed.
     *
     * A simple example on how to set a custom shader define value used by the shader processor.
     *
     * ```javascript
     * material.setDefine('MY_DEFINE', true);
     *
     * // call update to apply the changes, which will recompile the shader using the new define
     * material.update();
     * ```
     */
    setDefine(name: string, value: string | undefined | boolean): void;
    /**
     * Returns true if a define is enabled on the material, otherwise false.
     *
     * @param {string} name - The name of the define to check.
     * @returns {boolean} The value of the define.
     */
    getDefine(name: string): boolean;
    /**
     * Removes this material from the scene and possibly frees up memory from its shaders (if there
     * are no other materials using it).
     */
    destroy(): void;
    /**
     * Registers mesh instance as referencing the material.
     *
     * @param {MeshInstance} meshInstance - The mesh instance to register.
     * @ignore
     */
    addMeshInstanceRef(meshInstance: MeshInstance): void;
    /**
     * De-registers mesh instance as referencing the material.
     *
     * @param {MeshInstance} meshInstance - The mesh instance to de-register.
     * @ignore
     */
    removeMeshInstanceRef(meshInstance: MeshInstance): void;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { Scene } from '../scene.js';
import type { CameraShaderParams } from '../camera-shader-params.js';
import type { Light } from '../light.js';
import type { UniformBufferFormat } from '../../platform/graphics/uniform-buffer-format.js';
import type { BindGroupFormat } from '../../platform/graphics/bind-group-format.js';
import type { VertexFormat } from '../../platform/graphics/vertex-format.js';
import type { Shader } from '../../platform/graphics/shader.js';
import { BlendState } from '../../platform/graphics/blend-state.js';
import { DepthState } from '../../platform/graphics/depth-state.js';
import type { StencilParameters } from '../../platform/graphics/stencil-parameters.js';
import { ShaderChunks } from '../shader-lib/shader-chunks.js';
import type { ShaderChunkMap } from '../shader-lib/shader-chunk-map.js';
import type { Texture } from '../../platform/graphics/texture.js';
import type { StorageBuffer } from '../../platform/graphics/storage-buffer.js';
import type { MeshInstance } from '../mesh-instance.js';
