/**
 * A LayoutGroupComponent enables the Entity to position and scale child {@link ElementComponent}s
 * according to configurable layout rules.
 *
 * @hideconstructor
 * @category User Interface
 */
export class LayoutGroupComponent extends Component {
    /**
     * Create a new LayoutGroupComponent instance.
     *
     * @param {LayoutGroupComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: LayoutGroupComponentSystem, entity: Entity);
    /** @private */
    private _orientation;
    /** @private */
    private _reverseX;
    /** @private */
    private _reverseY;
    /** @private */
    private _alignment;
    /** @private */
    private _padding;
    /** @private */
    private _spacing;
    /** @private */
    private _widthFitting;
    /** @private */
    private _heightFitting;
    /** @private */
    private _wrap;
    /** @private */
    private _layoutCalculator;
    /**
     * Sets whether the layout should run horizontally or vertically. Can be:
     *
     * - {@link ORIENTATION_HORIZONTAL}
     * - {@link ORIENTATION_VERTICAL}
     *
     * Defaults to {@link ORIENTATION_HORIZONTAL}.
     *
     * @type {number}
     */
    set orientation(value: number);
    /**
     * Gets whether the layout should run horizontally or vertically.
     *
     * @type {number}
     */
    get orientation(): number;
    /**
     * Sets whether to reverse the order of children along the x axis. Defaults to false.
     *
     * @type {boolean}
     */
    set reverseX(value: boolean);
    /**
     * Gets whether to reverse the order of children along the x axis.
     *
     * @type {boolean}
     */
    get reverseX(): boolean;
    /**
     * Sets whether to reverse the order of children along the y axis. Defaults to true.
     *
     * @type {boolean}
     */
    set reverseY(value: boolean);
    /**
     * Gets whether to reverse the order of children along the y axis.
     *
     * @type {boolean}
     */
    get reverseY(): boolean;
    /**
     * Sets the horizontal and vertical alignment of child elements. Values range from 0 to 1 where
     * `[0, 0]` is the bottom left and `[1, 1]` is the top right. Defaults to `[0, 1]`.
     *
     * @type {Vec2}
     */
    set alignment(value: Vec2);
    /**
     * Gets the horizontal and vertical alignment of child elements.
     *
     * @type {Vec2}
     */
    get alignment(): Vec2;
    /**
     * Sets the padding to be applied inside the container before positioning any children.
     * Specified as left, bottom, right and top values. Defaults to `[0, 0, 0, 0]` (no padding).
     *
     * @type {Vec4}
     */
    set padding(value: Vec4);
    /**
     * Gets the padding to be applied inside the container before positioning any children.
     *
     * @type {Vec4}
     */
    get padding(): Vec4;
    /**
     * Sets the spacing to be applied between each child element. Defaults to `[0, 0]` (no spacing).
     *
     * @type {Vec2}
     */
    set spacing(value: Vec2);
    /**
     * Gets the spacing to be applied between each child element.
     *
     * @type {Vec2}
     */
    get spacing(): Vec2;
    /**
     * Sets the width fitting mode to be applied when positioning and scaling child elements. Can be:
     *
     * - {@link FITTING_NONE}: Child elements will be rendered at their natural size.
     * - {@link FITTING_STRETCH}: When the natural size of all child elements does not fill the width
     * of the container, children will be stretched to fit. The rules for how each child will be
     * stretched are outlined below:
     *   1. Sum the {@link LayoutChildComponent#fitWidthProportion} values of each child and normalize
     * so that all values sum to 1.
     *   2. Apply the natural width of each child.
     *   3. If there is space remaining in the container, distribute it to each child based on the
     * normalized {@link LayoutChildComponent#fitWidthProportion} values, but do not exceed the
     * {@link LayoutChildComponent#maxWidth} of each child.
     * - {@link FITTING_SHRINK}: When the natural size of all child elements overflows the width of the
     * container, children will be shrunk to fit. The rules for how each child will be stretched are
     * outlined below:
     *   1. Sum the {@link LayoutChildComponent#fitWidthProportion} values of each child and normalize
     * so that all values sum to 1.
     *   2. Apply the natural width of each child.
     *   3. If the new total width of all children exceeds the available space of the container, reduce
     * each child's width proportionally based on the normalized {@link
     * LayoutChildComponent#fitWidthProportion} values, but do not exceed the {@link
     * LayoutChildComponent#minWidth} of each child.
     * - {@link FITTING_BOTH}: Applies both STRETCH and SHRINK logic as necessary.
     *
     * Defaults to {@link FITTING_NONE}.
     *
     * @type {number}
     */
    set widthFitting(value: number);
    /**
     * Gets the width fitting mode to be applied when positioning and scaling child elements.
     *
     * @type {number}
     */
    get widthFitting(): number;
    /**
     * Sets the height fitting mode to be applied when positioning and scaling child elements.
     * Identical to {@link LayoutGroupComponent#widthFitting} but for the Y axis. Defaults to
     * {@link FITTING_NONE}.
     *
     * @type {number}
     */
    set heightFitting(value: number);
    /**
     * Gets the height fitting mode to be applied when positioning and scaling child elements.
     *
     * @type {number}
     */
    get heightFitting(): number;
    /**
     * Sets whether or not to wrap children onto a new row/column when the size of the container is
     * exceeded. Defaults to false, which means that children will be be rendered in a single row
     * (horizontal orientation) or column (vertical orientation). Note that setting wrap to true
     * makes it impossible for the {@link FITTING_BOTH} fitting mode to operate in any logical
     * manner. For this reason, when wrap is true, a {@link LayoutGroupComponent#widthFitting} or
     * {@link LayoutGroupComponent#heightFitting} mode of {@link FITTING_BOTH} will be coerced to
     * {@link FITTING_STRETCH}.
     *
     * @type {boolean}
     */
    set wrap(value: boolean);
    /**
     * Gets whether or not to wrap children onto a new row/column when the size of the container is
     * exceeded.
     *
     * @type {boolean}
     */
    get wrap(): boolean;
    _isSelfOrChild(entity: any): boolean;
    _listenForReflowEvents(target: any, onOff: any): void;
    _onElementOrLayoutComponentAdd(entity: any): void;
    _onElementOrLayoutComponentRemove(entity: any): void;
    _onChildInsert(child: any): void;
    _onChildRemove(child: any): void;
    _scheduleReflow(): void;
    reflow(): void;
    _isPerformingReflow: boolean;
    onRemove(): void;
}
import { Component } from '../component.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { Vec4 } from '../../../core/math/vec4.js';
import type { LayoutGroupComponentSystem } from './system.js';
import type { Entity } from '../../entity.js';
