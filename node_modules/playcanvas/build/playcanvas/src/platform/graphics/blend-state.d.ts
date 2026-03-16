/**
 * BlendState is a descriptor that defines how output of fragment shader is written and blended
 * into render target. A blend state can be set on a material using {@link Material#blendState},
 * or in some cases on the graphics device using {@link GraphicsDevice#setBlendState}.
 *
 * For the best performance, do not modify blend state after it has been created, but create
 * multiple blend states and assign them to the material or graphics device as needed.
 *
 * @category Graphics
 */
export class BlendState {
    /**
     * A blend state that has blending disabled and writes to all color channels.
     *
     * @type {BlendState}
     * @readonly
     */
    static readonly NOBLEND: BlendState;
    /**
     * A blend state that does not write to color channels.
     *
     * @type {BlendState}
     * @readonly
     */
    static readonly NOWRITE: BlendState;
    /**
     * A blend state that does simple translucency using alpha channel.
     *
     * @type {BlendState}
     * @readonly
     */
    static readonly ALPHABLEND: BlendState;
    /**
     * A blend state that does simple additive blending.
     *
     * @type {BlendState}
     * @readonly
     */
    static readonly ADDBLEND: BlendState;
    /**
     * Create a new BlendState instance.
     *
     * All factor parameters can take the following values:
     *
     * - {@link BLENDMODE_ZERO}
     * - {@link BLENDMODE_ONE}
     * - {@link BLENDMODE_SRC_COLOR}
     * - {@link BLENDMODE_ONE_MINUS_SRC_COLOR}
     * - {@link BLENDMODE_DST_COLOR}
     * - {@link BLENDMODE_ONE_MINUS_DST_COLOR}
     * - {@link BLENDMODE_SRC_ALPHA}
     * - {@link BLENDMODE_SRC_ALPHA_SATURATE}
     * - {@link BLENDMODE_ONE_MINUS_SRC_ALPHA}
     * - {@link BLENDMODE_DST_ALPHA}
     * - {@link BLENDMODE_ONE_MINUS_DST_ALPHA}
     * - {@link BLENDMODE_CONSTANT}
     * - {@link BLENDMODE_ONE_MINUS_CONSTANT}
     *
     * All op parameters can take the following values:
     *
     * - {@link BLENDEQUATION_ADD}
     * - {@link BLENDEQUATION_SUBTRACT}
     * - {@link BLENDEQUATION_REVERSE_SUBTRACT}
     * - {@link BLENDEQUATION_MIN}
     * - {@link BLENDEQUATION_MAX}
     *
     * @param {boolean} [blend] - Enables or disables blending. Defaults to false.
     * @param {number} [colorOp] - Configures color blending operation. Defaults to
     * {@link BLENDEQUATION_ADD}.
     * @param {number} [colorSrcFactor] - Configures source color blending factor. Defaults to
     * {@link BLENDMODE_ONE}.
     * @param {number} [colorDstFactor] - Configures destination color blending factor. Defaults to
     * {@link BLENDMODE_ZERO}.
     * @param {number} [alphaOp] - Configures alpha blending operation. Defaults to
     * {@link BLENDEQUATION_ADD}.
     * @param {number} [alphaSrcFactor] - Configures source alpha blending factor. Defaults to
     * {@link BLENDMODE_ONE}.
     * @param {number} [alphaDstFactor] - Configures destination alpha blending factor. Defaults to
     * {@link BLENDMODE_ZERO}.
     * @param {boolean} [redWrite] - True to enable writing of the red channel and false otherwise.
     * Defaults to true.
     * @param {boolean} [greenWrite] - True to enable writing of the green channel and false
     * otherwise. Defaults to true.
     * @param {boolean} [blueWrite] - True to enable writing of the blue channel and false otherwise.
     * Defaults to true.
     * @param {boolean} [alphaWrite] - True to enable writing of the alpha channel and false
     * otherwise. Defaults to true.
     */
    constructor(blend?: boolean, colorOp?: number, colorSrcFactor?: number, colorDstFactor?: number, alphaOp?: number, alphaSrcFactor?: number, alphaDstFactor?: number, redWrite?: boolean, greenWrite?: boolean, blueWrite?: boolean, alphaWrite?: boolean);
    /**
     * Bit field representing the blend state for render target 0.
     *
     * @private
     */
    private target0;
    /**
     * Sets whether blending is enabled.
     *
     * @type {boolean}
     */
    set blend(value: boolean);
    /**
     * Gets whether blending is enabled.
     *
     * @type {boolean}
     */
    get blend(): boolean;
    setColorBlend(op: any, srcFactor: any, dstFactor: any): void;
    setAlphaBlend(op: any, srcFactor: any, dstFactor: any): void;
    setColorWrite(redWrite: any, greenWrite: any, blueWrite: any, alphaWrite: any): void;
    set redWrite(value: boolean);
    get redWrite(): boolean;
    set greenWrite(value: boolean);
    get greenWrite(): boolean;
    set blueWrite(value: boolean);
    get blueWrite(): boolean;
    set alphaWrite(value: boolean);
    get alphaWrite(): boolean;
    get colorOp(): number;
    get colorSrcFactor(): number;
    get colorDstFactor(): number;
    get alphaOp(): number;
    get alphaSrcFactor(): number;
    get alphaDstFactor(): number;
    get allWrite(): number;
    /**
     * Copies the contents of a source blend state to this blend state.
     *
     * @param {BlendState} rhs - A blend state to copy from.
     * @returns {BlendState} Self for chaining.
     */
    copy(rhs: BlendState): BlendState;
    /**
     * Returns an identical copy of the specified blend state.
     *
     * @returns {this} The result of the cloning.
     */
    clone(): this;
    get key(): number;
    /**
     * Reports whether two BlendStates are equal.
     *
     * @param {BlendState} rhs - The blend state to compare to.
     * @returns {boolean} True if the blend states are equal and false otherwise.
     */
    equals(rhs: BlendState): boolean;
}
