/**
 * A LayoutChildComponent enables the Entity to control the sizing applied to it by its parent
 * {@link LayoutGroupComponent}.
 *
 * @hideconstructor
 * @category User Interface
 */
export class LayoutChildComponent extends Component {
    /** @private */
    private _minWidth;
    /** @private */
    private _minHeight;
    /**
     * @type {number|null}
     * @private
     */
    private _maxWidth;
    /**
     * @type {number|null}
     * @private
     */
    private _maxHeight;
    /** @private */
    private _fitWidthProportion;
    /** @private */
    private _fitHeightProportion;
    /** @private */
    private _excludeFromLayout;
    /**
     * Sets the minimum width the element should be rendered at.
     *
     * @type {number}
     */
    set minWidth(value: number);
    /**
     * Gets the minimum width the element should be rendered at.
     *
     * @type {number}
     */
    get minWidth(): number;
    /**
     * Sets the minimum height the element should be rendered at.
     *
     * @type {number}
     */
    set minHeight(value: number);
    /**
     * Gets the minimum height the element should be rendered at.
     *
     * @type {number}
     */
    get minHeight(): number;
    /**
     * Sets the maximum width the element should be rendered at.
     *
     * @type {number|null}
     */
    set maxWidth(value: number | null);
    /**
     * Gets the maximum width the element should be rendered at.
     *
     * @type {number|null}
     */
    get maxWidth(): number | null;
    /**
     * Sets the maximum height the element should be rendered at.
     *
     * @type {number|null}
     */
    set maxHeight(value: number | null);
    /**
     * Gets the maximum height the element should be rendered at.
     *
     * @type {number|null}
     */
    get maxHeight(): number | null;
    /**
     * Sets the amount of additional horizontal space that the element should take up, if necessary to
     * satisfy a Stretch/Shrink fitting calculation. This is specified as a proportion, taking into
     * account the proportion values of other siblings.
     *
     * @type {number}
     */
    set fitWidthProportion(value: number);
    /**
     * Gets the amount of additional horizontal space that the element should take up, if necessary to
     * satisfy a Stretch/Shrink fitting calculation.
     *
     * @type {number}
     */
    get fitWidthProportion(): number;
    /**
     * Sets the amount of additional vertical space that the element should take up, if necessary to
     * satisfy a Stretch/Shrink fitting calculation. This is specified as a proportion, taking into
     * account the proportion values of other siblings.
     *
     * @type {number}
     */
    set fitHeightProportion(value: number);
    /**
     * Gets the amount of additional vertical space that the element should take up, if necessary to
     * satisfy a Stretch/Shrink fitting calculation.
     *
     * @type {number}
     */
    get fitHeightProportion(): number;
    /**
     * Sets whether the child will be excluded from all layout calculations.
     *
     * @type {boolean}
     */
    set excludeFromLayout(value: boolean);
    /**
     * Gets whether the child will be excluded from all layout calculations.
     *
     * @type {boolean}
     */
    get excludeFromLayout(): boolean;
}
import { Component } from '../component.js';
