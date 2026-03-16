/**
 * Holds stencil test settings.
 *
 * @category Graphics
 */
export class StencilParameters {
    /**
     * A default stencil state.
     *
     * @type {StencilParameters}
     * @readonly
     */
    static readonly DEFAULT: StencilParameters;
    /**
     * Create a new StencilParameters instance.
     *
     * @param {object} [options] - Options object to configure the stencil parameters.
     */
    constructor(options?: object);
    /**
     * @type {number}
     * @private
     */
    private _func;
    /**
     * @type {number}
     * @private
     */
    private _ref;
    /**
     * @type {number}
     * @private
     */
    private _fail;
    /**
     * @type {number}
     * @private
     */
    private _zfail;
    /**
     * @type {number}
     * @private
     */
    private _zpass;
    /**
     * @type {number}
     * @private
     */
    private _readMask;
    /**
     * @type {number}
     * @private
     */
    private _writeMask;
    /**
     * @type {boolean}
     * @private
     */
    private _dirty;
    /**
     * @type {number}
     * @private
     */
    private _key;
    /**
     * Sets the comparison function that decides if the pixel should be written, based on the
     * current stencil buffer value, reference value, and mask value. Can be:
     *
     * - {@link FUNC_NEVER}: never pass
     * - {@link FUNC_LESS}: pass if (ref & mask) < (stencil & mask)
     * - {@link FUNC_EQUAL}: pass if (ref & mask) == (stencil & mask)
     * - {@link FUNC_LESSEQUAL}: pass if (ref & mask) <= (stencil & mask)
     * - {@link FUNC_GREATER}: pass if (ref & mask) > (stencil & mask)
     * - {@link FUNC_NOTEQUAL}: pass if (ref & mask) != (stencil & mask)
     * - {@link FUNC_GREATEREQUAL}: pass if (ref & mask) >= (stencil & mask)
     * - {@link FUNC_ALWAYS}: always pass
     *
     * @type {number}
     */
    set func(value: number);
    /**
     * Sets the comparison function that decides if the pixel should be written.
     *
     * @type {number}
     */
    get func(): number;
    /**
     * Sets the stencil test reference value used in comparisons.
     *
     * @type {number}
     */
    set ref(value: number);
    /**
     * Gets the stencil test reference value used in comparisons.
     *
     * @type {number}
     */
    get ref(): number;
    /**
     * Sets the operation to perform if stencil test is failed. Can be:
     *
     * - {@link STENCILOP_KEEP}: don't change the stencil buffer value
     * - {@link STENCILOP_ZERO}: set value to zero
     * - {@link STENCILOP_REPLACE}: replace value with the reference value.
     * - {@link STENCILOP_INCREMENT}: increment the value
     * - {@link STENCILOP_INCREMENTWRAP}: increment the value, but wrap it to zero when it's larger
     * than a maximum representable value
     * - {@link STENCILOP_DECREMENT}: decrement the value
     * - {@link STENCILOP_DECREMENTWRAP}: decrement the value, but wrap it to a maximum
     * representable value, if the current value is 0
     * - {@link STENCILOP_INVERT}: invert the value bitwise
     *
     * @type {number}
     */
    set fail(value: number);
    /**
     * Gets the operation to perform if stencil test is failed.
     *
     * @type {number}
     */
    get fail(): number;
    /**
     * Sets the operation to perform if depth test is failed. Accepts the same values as `fail`.
     *
     * @type {number}
     */
    set zfail(value: number);
    /**
     * Gets the operation to perform if depth test is failed.
     *
     * @type {number}
     */
    get zfail(): number;
    /**
     * Sets the operation to perform if both stencil and depth test are passed. Accepts the same
     * values as `fail`.
     *
     * @type {number}
     */
    set zpass(value: number);
    /**
     * Gets the operation to perform if both stencil and depth test are passed.
     *
     * @type {number}
     */
    get zpass(): number;
    /**
     * Sets the mask applied to stencil buffer value and reference value before comparison.
     *
     * @type {number}
     */
    set readMask(value: number);
    /**
     * Gets the mask applied to stencil buffer value and reference value before comparison.
     *
     * @type {number}
     */
    get readMask(): number;
    /**
     * Sets the bit mask applied to the stencil value when written.
     *
     * @type {number}
     */
    set writeMask(value: number);
    /**
     * Gets the bit mask applied to the stencil value when written.
     *
     * @type {number}
     */
    get writeMask(): number;
    _evalKey(): void;
    get key(): number;
    /**
     * Copies the contents of a source stencil parameters to this stencil parameters.
     *
     * @param {StencilParameters} rhs - A stencil parameters to copy from.
     * @returns {StencilParameters} Self for chaining.
     */
    copy(rhs: StencilParameters): StencilParameters;
    /**
     * Clone the stencil parameters.
     *
     * @returns {StencilParameters} A cloned StencilParameters object.
     */
    clone(): StencilParameters;
}
