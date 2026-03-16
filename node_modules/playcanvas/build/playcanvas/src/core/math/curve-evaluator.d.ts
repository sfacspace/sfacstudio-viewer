/**
 * @import { Curve } from './curve.js'
 */
/**
 * A class for evaluating a curve at a specific time.
 *
 * @ignore
 */
export class CurveEvaluator {
    /**
     * Create a new CurveEvaluator instance.
     *
     * @param {Curve} curve - The curve to evaluate.
     * @param {number} time - The initial time to evaluate the curve at. Defaults to 0.
     */
    constructor(curve: Curve, time?: number);
    /** @private */
    private _curve;
    /** @private */
    private _left;
    /** @private */
    private _right;
    /** @private */
    private _recip;
    /** @private */
    private _p0;
    /** @private */
    private _p1;
    /** @private */
    private _m0;
    /** @private */
    private _m1;
    /**
     * Evaluate the curve at the given time. Specify forceReset if the underlying curve keys have
     * changed since the last evaluation.
     *
     * @param {number} time - Time to evaluate the curve at.
     * @param {boolean} [forceReset] - Force reset of the curve.
     * @returns {number} The evaluated value.
     */
    evaluate(time: number, forceReset?: boolean): number;
    /**
     * Calculate weights for the curve interval at the given time.
     *
     * @param {number} time - Time to evaluate the curve at.
     * @private
     */
    private _reset;
    /**
     * Calculate tangents for the hermite curve.
     *
     * @param {number[][]} keys - The keys of the curve.
     * @param {number} index - The key index of the key to calculate the tangents for.
     * @private
     */
    private _calcTangents;
    /**
     * Evaluate the hermite curve at the given time.
     *
     * @param {number} p0 - The first key.
     * @param {number} p1 - The second key.
     * @param {number} m0 - The first tangent.
     * @param {number} m1 - The second tangent.
     * @param {number} t - Time to evaluate the curve at.
     * @returns {number} The value of the hermite curve at the given time.
     * @private
     */
    private _evaluateHermite;
}
import type { Curve } from './curve.js';
