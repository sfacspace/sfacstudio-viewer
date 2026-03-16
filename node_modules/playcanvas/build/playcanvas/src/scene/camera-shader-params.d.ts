/**
 * Internal camera shader parameters, used to generate and use matching shaders.
 *
 * @ignore
 */
export class CameraShaderParams {
    /** @private */
    private _gammaCorrection;
    /** @private */
    private _toneMapping;
    /** @private */
    private _srgbRenderTarget;
    /** @private */
    private _ssaoEnabled;
    /** @private */
    private _fog;
    /** @private */
    private _sceneDepthMapLinear;
    /**
     * The hash of the rendering parameters, or undefined if the hash has not been computed yet.
     *
     * @type {number|undefined}
     * @private
     */
    private _hash;
    /**
     * Content of this class relevant to shader generation, which is supplied as defines for the
     * shader.
     *
     * @type {Map<string, string>}
     * @private
     */
    private _defines;
    _definesDirty: boolean;
    /**
     * The hash of the rendering parameters.
     *
     * @type {number}
     * @ignore
     */
    get hash(): number;
    get defines(): Map<string, string>;
    markDirty(): void;
    set fog(type: string);
    get fog(): string;
    set ssaoEnabled(value: boolean);
    get ssaoEnabled(): boolean;
    set gammaCorrection(value: number);
    get gammaCorrection(): number;
    _gammaCorrectionAssigned: boolean;
    set toneMapping(value: number);
    get toneMapping(): number;
    set srgbRenderTarget(value: boolean);
    get srgbRenderTarget(): boolean;
    set sceneDepthMapLinear(value: boolean);
    get sceneDepthMapLinear(): boolean;
    /**
     * Returns {@link GAMMA_SRGB} if the shader code needs to output gamma corrected color, otherwise
     * returns {@link GAMMA_NONE}.
     *
     * @type {number}
     * @ignore
     */
    get shaderOutputGamma(): number;
}
