/**
 * @ignore
 */
export class MeshLine {
    /**
     * @param {AppBase} app - The application instance
     * @param {Layer} layer - The layer to draw the guideline on
     * @param {object} [args] - The arguments object
     * @param {number} [args.thickness] - The thickness of the line
     */
    constructor(app: AppBase, layer: Layer, args?: {
        thickness?: number;
    });
    /**
     * @type {number}
     * @private
     */
    private _thickness;
    /**
     * @type {ShaderMaterial}
     * @private
     */
    private _material;
    /**
     * @type {Entity}
     */
    entity: Entity;
    /**
     * @type {number}
     */
    set thickness(value: number);
    /**
     * @type {number}
     */
    get thickness(): number;
    /**
     * Draw a line from one point to another with a specific color.
     *
     * @param {Vec3} from - The starting point of the line.
     * @param {Vec3} to - The ending point of the line.
     * @param {number} scale - The scale of the line.
     * @param {Color} color - The color of the line.
     */
    draw(from: Vec3, to: Vec3, scale: number, color: Color): void;
    destroy(): void;
}
import { Entity } from '../../framework/entity.js';
import { Vec3 } from '../../core/math/vec3.js';
import type { Color } from '../../core/math/color.js';
import type { AppBase } from '../../framework/app-base.js';
import type { Layer } from '../../scene/layer.js';
