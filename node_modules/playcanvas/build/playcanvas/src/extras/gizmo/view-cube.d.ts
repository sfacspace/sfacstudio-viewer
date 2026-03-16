export class ViewCube extends EventHandler {
    /**
     * Fired when the user clicks on a face of the view cube.
     *
     * @event
     * @example
     * const viewCube = new ViewCube()
     * viewCube.on(ViewCube.EVENT_CAMERAALIGN, function (face) {
     *    console.log('Camera aligned to face: ' + face);
     * });
     */
    static EVENT_CAMERAALIGN: string;
    /**
     * @param {Vec4} [anchor] - The anchor.
     */
    constructor(anchor?: Vec4);
    /**
     * @type {number}
     * @private
     */
    private _size;
    /**
     * @type {SVGSVGElement}
     * @private
     */
    private _svg;
    /**
     * @type {Element}
     * @private
     */
    private _group;
    /**
     * @type {Vec4}
     * @private
     */
    private _anchor;
    /**
     * @type {Color}
     * @private
     */
    private _colorX;
    /**
     * @type {Color}
     * @private
     */
    private _colorY;
    /**
     * @type {Color}
     * @private
     */
    private _colorZ;
    /**
     * @type {Color}
     * @private
     */
    private _colorNeg;
    /**
     * @type {number}
     * @private
     */
    private _radius;
    /**
     * @type {number}
     * @private
     */
    private _textSize;
    /**
     * @type {number}
     * @private
     */
    private _lineThickness;
    /**
     * @type {number}
     * @private
     */
    private _lineLength;
    /**
     * @type {{
     *     nx: SVGAElement,
     *     ny: SVGAElement,
     *     nz: SVGAElement,
     *     px: SVGAElement,
     *     py: SVGAElement,
     *     pz: SVGAElement,
     *     xaxis: SVGLineElement,
     *     yaxis: SVGLineElement,
     *     zaxis: SVGLineElement
     * }}
     */
    _shapes: {
        nx: SVGAElement;
        ny: SVGAElement;
        nz: SVGAElement;
        px: SVGAElement;
        py: SVGAElement;
        pz: SVGAElement;
        xaxis: SVGLineElement;
        yaxis: SVGLineElement;
        zaxis: SVGLineElement;
    };
    dom: HTMLDivElement;
    set anchor(value: Vec4);
    get anchor(): Vec4;
    /**
     * @type {Color}
     */
    set colorX(value: Color);
    get colorX(): Color;
    /**
     * @type {Color}
     */
    set colorY(value: Color);
    get colorY(): Color;
    /**
     * @type {Color}
     */
    set colorZ(value: Color);
    get colorZ(): Color;
    /**
     * @type {Color}
     */
    set colorNeg(value: Color);
    get colorNeg(): Color;
    /**
     * @type {number}
     */
    set radius(value: number);
    get radius(): number;
    /**
     * @type {number}
     */
    set textSize(value: number);
    get textSize(): number;
    /**
     * @type {number}
     */
    set lineThickness(value: number);
    get lineThickness(): number;
    /**
     * @type {number}
     */
    set lineLength(value: number);
    get lineLength(): number;
    /**
     * @private
     */
    private _resize;
    /**
     * @private
     * @param {SVGAElement} group - The group.
     * @param {number} x - The x.
     * @param {number} y - The y.
     */
    private _transform;
    /**
     * @private
     * @param {SVGLineElement} line - The line.
     * @param {number} x - The x.
     * @param {number} y - The y.
     */
    private _x2y2;
    /**
     * @private
     * @param {string} color - The color.
     * @returns {SVGLineElement} - The line.
     */
    private _line;
    /**
     * @private
     * @param {string} color - The color.
     * @param {boolean} [fill] - The fill.
     * @param {string} [text] - The text.
     * @returns {SVGAElement} - The circle.
     */
    private _circle;
    /**
     * @param {Mat4} cameraMatrix - The camera matrix.
     */
    update(cameraMatrix: Mat4): void;
    destroy(): void;
}
import { EventHandler } from '../../core/event-handler.js';
import { Vec4 } from '../../core/math/vec4.js';
import { Color } from '../../core/math/color.js';
import { Mat4 } from '../../core/math/mat4.js';
