export type ArcShapeArgs = {
    /**
     * - The tube radius.
     */
    tubeRadius?: number;
    /**
     * - The ring radius.
     */
    ringRadius?: number;
    /**
     * - The sector angle.
     */
    sectorAngle?: number;
};
/**
 * @typedef {object} ArcShapeArgs
 * @property {number} [tubeRadius] - The tube radius.
 * @property {number} [ringRadius] - The ring radius.
 * @property {number} [sectorAngle] - The sector angle.
 */
/**
 * @ignore
 */
export class ArcShape extends Shape {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {ShapeArgs & ArcShapeArgs} args - The shape options.
     */
    constructor(device: GraphicsDevice, args?: ShapeArgs & ArcShapeArgs);
    /**
     * The internal tube radius of the arc.
     *
     * @type {number}
     * @private
     */
    private _tubeRadius;
    /**
     * The internal ring radius of the arc.
     *
     * @type {number}
     * @private
     */
    private _ringRadius;
    /**
     * The internal sector angle of the arc.
     *
     * @type {number}
     * @private
     */
    private _sectorAngle;
    /**
     * The internal intersection tolerance of the arc.
     *
     * @type {number}
     * @private
     */
    private _tolerance;
    /**
     * The internal cache for triangle data.
     *
     * @type {[TriData, TriData]}
     * @private
     */
    private _triDataCache;
    /**
     * Create the torus geometry.
     *
     * @param {number} sectorAngle - The sector angle.
     * @returns {TorusGeometry} The torus geometry.
     * @private
     */
    private _createTorusGeometry;
    /**
     * Create the torus mesh.
     *
     * @param {number} sectorAngle - The sector angle.
     * @returns {Mesh} The torus mesh.
     * @private
     */
    private _createTorusMesh;
    /**
     * Set the tube radius.
     *
     * @type {number}
     */
    set tubeRadius(value: number);
    /**
     * Get the tube radius.
     *
     * @type {number}
     */
    get tubeRadius(): number;
    /**
     * Set the ring radius.
     *
     * @type {number}
     */
    set ringRadius(value: number);
    /**
     * Get the ring radius.
     *
     * @type {number}
     */
    get ringRadius(): number;
    /**
     * Set the intersection tolerance.
     *
     * @type {number}
     */
    set tolerance(value: number);
    /**
     * Get the intersection tolerance.
     *
     * @type {number}
     */
    get tolerance(): number;
    /**
     * @param {'sector' | 'ring' | 'none'} state - The visibility state.
     */
    show(state: "sector" | "ring" | "none"): void;
}
import { Shape } from './shape.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import type { ShapeArgs } from './shape.js';
