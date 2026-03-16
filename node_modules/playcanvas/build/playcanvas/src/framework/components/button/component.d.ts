/**
 * A ButtonComponent enables a group of entities to behave like a button, with different visual
 * states for hover and press interactions.
 *
 * @hideconstructor
 * @category User Interface
 */
export class ButtonComponent extends Component {
    /**
     * Fired when the mouse is pressed while the cursor is on the component. The handler is passed
     * a {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.button.on('mousedown', (event) => {
     *     console.log(`Mouse down on entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSEDOWN: string;
    /**
     * Fired when the mouse is released while the cursor is on the component. The handler is passed
     * a {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.button.on('mouseup', (event) => {
     *     console.log(`Mouse up on entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSEUP: string;
    /**
     * Fired when the mouse cursor enters the component. The handler is passed a
     * {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.button.on('mouseenter', (event) => {
     *     console.log(`Mouse entered entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSEENTER: string;
    /**
     * Fired when the mouse cursor leaves the component. The handler is passed a
     * {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.button.on('mouseleave', (event) => {
     *     console.log(`Mouse left entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSELEAVE: string;
    /**
     * Fired when the mouse is pressed and released on the component or when a touch starts and ends on
     * the component. The handler is passed a {@link ElementMouseEvent} or {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.button.on('click', (event) => {
     *     console.log(`Clicked entity ${entity.name}`);
     * });
     */
    static EVENT_CLICK: string;
    /**
     * Fired when a touch starts on the component. The handler is passed a {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.button.on('touchstart', (event) => {
     *     console.log(`Touch started on entity ${entity.name}`);
     * });
     */
    static EVENT_TOUCHSTART: string;
    /**
     * Fired when a touch ends on the component. The handler is passed a {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.button.on('touchend', (event) => {
     *     console.log(`Touch ended on entity ${entity.name}`);
     * });
     */
    static EVENT_TOUCHEND: string;
    /**
     * Fired when a touch is canceled on the component. The handler is passed a
     * {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.button.on('touchcancel', (event) => {
     *     console.log(`Touch canceled on entity ${entity.name}`);
     * });
     */
    static EVENT_TOUCHCANCEL: string;
    /**
     * Fired when a touch leaves the component. The handler is passed a {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.button.on('touchleave', (event) => {
     *     console.log(`Touch left entity ${entity.name}`);
     * });
     */
    static EVENT_TOUCHLEAVE: string;
    /**
     * Fired when a xr select starts on the component. The handler is passed a
     * {@link ElementSelectEvent}.
     *
     * @event
     * @example
     * entity.button.on('selectstart', (event) => {
     *     console.log(`Select started on entity ${entity.name}`);
     * });
     */
    static EVENT_SELECTSTART: string;
    /**
     * Fired when a xr select ends on the component. The handler is passed a
     * {@link ElementSelectEvent}.
     *
     * @event
     * @example
     * entity.button.on('selectend', (event) => {
     *     console.log(`Select ended on entity ${entity.name}`);
     * });
     */
    static EVENT_SELECTEND: string;
    /**
     * Fired when a xr select now hovering over the component. The handler is passed a
     * {@link ElementSelectEvent}.
     *
     * @event
     * @example
     * entity.button.on('selectenter', (event) => {
     *     console.log(`Select entered entity ${entity.name}`);
     * });
     */
    static EVENT_SELECTENTER: string;
    /**
     * Fired when a xr select not hovering over the component. The handler is passed a
     * {@link ElementSelectEvent}.
     *
     * @event
     * @example
     * entity.button.on('selectleave', (event) => {
     *     console.log(`Select left entity ${entity.name}`);
     * });
     */
    static EVENT_SELECTLEAVE: string;
    /**
     * Fired when the button changes state to be hovered.
     *
     * @event
     * @example
     * entity.button.on('hoverstart', () => {
     *     console.log(`Entity ${entity.name} hovered`);
     * });
     */
    static EVENT_HOVERSTART: string;
    /**
     * Fired when the button changes state to be not hovered.
     *
     * @event
     * @example
     * entity.button.on('hoverend', () => {
     *     console.log(`Entity ${entity.name} unhovered`);
     * });
     */
    static EVENT_HOVEREND: string;
    /**
     * Fired when the button changes state to be pressed.
     *
     * @event
     * @example
     * entity.button.on('pressedstart', () => {
     *     console.log(`Entity ${entity.name} pressed`);
     * });
     */
    static EVENT_PRESSEDSTART: string;
    /**
     * Fired when the button changes state to be not pressed.
     *
     * @event
     * @example
     * entity.button.on('pressedend', () => {
     *     console.log(`Entity ${entity.name} unpressed`);
     * });
     */
    static EVENT_PRESSEDEND: string;
    /**
     * Create a new ButtonComponent instance.
     *
     * @param {ButtonComponentSystem} system - The ComponentSystem that created this component.
     * @param {Entity} entity - The entity that this component is attached to.
     */
    constructor(system: ButtonComponentSystem, entity: Entity);
    /** @private */
    private _visualState;
    /** @private */
    private _isHovering;
    /** @private */
    private _hoveringCounter;
    /** @private */
    private _isPressed;
    /** @private */
    private _defaultTint;
    /** @private */
    private _defaultSpriteAsset;
    /** @private */
    private _defaultSpriteFrame;
    /**
     * @type {Entity|null}
     * @private
     */
    private _imageEntity;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtElementAdd;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtImageEntityElementAdd;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtImageEntityElementRemove;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtImageEntityElementColor;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtImageEntityElementOpacity;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtImageEntityElementSpriteAsset;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtImageEntityElementSpriteFrame;
    /**
     * @type {ButtonComponentData}
     * @ignore
     */
    get data(): ButtonComponentData;
    /**
     * Sets the button's active state. If set to false, the button will be visible but will not
     * respond to hover or touch interactions. Defaults to true.
     *
     * @type {boolean}
     */
    set active(arg: boolean);
    /**
     * Gets the button's active state.
     *
     * @type {boolean}
     */
    get active(): boolean;
    /**
     * Sets the entity to be used as the button background. The entity must have an
     * {@link ElementComponent} configured as an image element.
     *
     * @type {Entity|string|null}
     */
    set imageEntity(arg: Entity | null);
    /**
     * Gets the entity to be used as the button background.
     *
     * @type {Entity|null}
     */
    get imageEntity(): Entity | null;
    /**
     * Sets the padding to be used in hit-test calculations. Can be used to expand the bounding box
     * so that the button is easier to tap. Defaults to `[0, 0, 0, 0]`.
     *
     * @type {Vec4}
     */
    set hitPadding(arg: Vec4);
    /**
     * Gets the padding to be used in hit-test calculations.
     *
     * @type {Vec4}
     */
    get hitPadding(): Vec4;
    /**
     * Sets the button transition mode. This controls how the button responds when the user hovers
     * over it/presses it. Can be:
     *
     * - {@link BUTTON_TRANSITION_MODE_TINT}
     * - {@link BUTTON_TRANSITION_MODE_SPRITE_CHANGE}
     *
     * Defaults to {@link BUTTON_TRANSITION_MODE_TINT}.
     *
     * @type {number}
     */
    set transitionMode(arg: number);
    /**
     * Gets the button transition mode.
     *
     * @type {number}
     */
    get transitionMode(): number;
    /**
     * Sets the tint color to be used on the button image when the user hovers over it. Defaults to
     * `[0.75, 0.75, 0.75]`.
     *
     * @type {Color}
     */
    set hoverTint(arg: Color);
    /**
     * Gets the tint color to be used on the button image when the user hovers over it.
     *
     * @type {Color}
     */
    get hoverTint(): Color;
    /**
     * Sets the tint color to be used on the button image when the user presses it. Defaults to
     * `[0.5, 0.5, 0.5]`.
     *
     * @type {Color}
     */
    set pressedTint(arg: Color);
    /**
     * Gets the tint color to be used on the button image when the user presses it.
     *
     * @type {Color}
     */
    get pressedTint(): Color;
    /**
     * Sets the tint color to be used on the button image when the button is not interactive.
     * Defaults to `[0.25, 0.25, 0.25]`.
     *
     * @type {Color}
     */
    set inactiveTint(arg: Color);
    /**
     * Gets the tint color to be used on the button image when the button is not interactive.
     *
     * @type {Color}
     */
    get inactiveTint(): Color;
    /**
     * Sets the duration to be used when fading between tints, in milliseconds. Defaults to 0.
     *
     * @type {number}
     */
    set fadeDuration(arg: number);
    /**
     * Gets the duration to be used when fading between tints, in milliseconds.
     *
     * @type {number}
     */
    get fadeDuration(): number;
    /**
     * Sets the sprite to be used as the button image when the user hovers over it.
     *
     * @type {Asset}
     */
    set hoverSpriteAsset(arg: Asset);
    /**
     * Gets the sprite to be used as the button image when the user hovers over it.
     *
     * @type {Asset}
     */
    get hoverSpriteAsset(): Asset;
    /**
     * Sets the frame to be used from the hover sprite.
     *
     * @type {number}
     */
    set hoverSpriteFrame(arg: number);
    /**
     * Gets the frame to be used from the hover sprite.
     *
     * @type {number}
     */
    get hoverSpriteFrame(): number;
    /**
     * Sets the sprite to be used as the button image when the user presses it.
     *
     * @type {Asset}
     */
    set pressedSpriteAsset(arg: Asset);
    /**
     * Gets the sprite to be used as the button image when the user presses it.
     *
     * @type {Asset}
     */
    get pressedSpriteAsset(): Asset;
    /**
     * Sets the frame to be used from the pressed sprite.
     *
     * @type {number}
     */
    set pressedSpriteFrame(arg: number);
    /**
     * Gets the frame to be used from the pressed sprite.
     *
     * @type {number}
     */
    get pressedSpriteFrame(): number;
    /**
     * Sets the sprite to be used as the button image when the button is not interactive.
     *
     * @type {Asset}
     */
    set inactiveSpriteAsset(arg: Asset);
    /**
     * Gets the sprite to be used as the button image when the button is not interactive.
     *
     * @type {Asset}
     */
    get inactiveSpriteAsset(): Asset;
    /**
     * Sets the frame to be used from the inactive sprite.
     *
     * @type {number}
     */
    set inactiveSpriteFrame(arg: number);
    /**
     * Gets the frame to be used from the inactive sprite.
     *
     * @type {number}
     */
    get inactiveSpriteFrame(): number;
    /** @ignore */
    _setValue(name: any, value: any): void;
    _toggleLifecycleListeners(onOrOff: any, system: any): void;
    _onSetActive(name: any, oldValue: any, newValue: any): void;
    _onSetTransitionMode(name: any, oldValue: any, newValue: any): void;
    _onSetTransitionValue(name: any, oldValue: any, newValue: any): void;
    _imageEntitySubscribe(): void;
    _imageEntityUnsubscribe(): void;
    _imageEntityElementSubscribe(): void;
    _imageEntityElementUnsubscribe(): void;
    _onElementComponentRemove(): void;
    _onElementComponentAdd(): void;
    _onImageElementLose(): void;
    _onImageElementGain(): void;
    _toggleHitElementListeners(onOrOff: any): void;
    _hasHitElementListeners: boolean;
    _storeDefaultVisualState(): void;
    _storeDefaultColor(color: any): void;
    _storeDefaultOpacity(opacity: any): void;
    _storeDefaultSpriteAsset(spriteAsset: any): void;
    _storeDefaultSpriteFrame(spriteFrame: any): void;
    _onSetColor(color: any): void;
    _onSetOpacity(opacity: any): void;
    _onSetSpriteAsset(spriteAsset: any): void;
    _onSetSpriteFrame(spriteFrame: any): void;
    _onMouseEnter(event: any): void;
    _onMouseLeave(event: any): void;
    _onMouseDown(event: any): void;
    _onMouseUp(event: any): void;
    _onTouchStart(event: any): void;
    _onTouchEnd(event: any): void;
    _onTouchLeave(event: any): void;
    _onTouchCancel(event: any): void;
    _onSelectStart(event: any): void;
    _onSelectEnd(event: any): void;
    _onSelectEnter(event: any): void;
    _onSelectLeave(event: any): void;
    _onClick(event: any): void;
    _fireIfActive(name: any, event: any): void;
    _updateVisualState(force: any): void;
    _forceReapplyVisualState(): void;
    _resetToDefaultVisualState(transitionMode: any): void;
    _determineVisualState(): string;
    _applySprite(spriteAsset: any, spriteFrame: any): void;
    _isApplyingSprite: boolean;
    _applyTint(tintColor: any): void;
    _applyTintImmediately(tintColor: any): void;
    _isApplyingTint: boolean;
    _applyTintWithTween(tintColor: any): void;
    _tweenInfo: {
        startTime: any;
        from: Color;
        to: any;
        lerpColor: Color;
    };
    _updateTintTween(): void;
    _cancelTween(): void;
    onUpdate(): void;
    onRemove(): void;
    resolveDuplicatedEntityReferenceProperties(oldButton: any, duplicatedIdsMap: any): void;
}
import { Component } from '../component.js';
import type { ButtonComponentData } from './data.js';
import type { Entity } from '../../entity.js';
import type { Vec4 } from '../../../core/math/vec4.js';
import { Color } from '../../../core/math/color.js';
import type { Asset } from '../../../framework/asset/asset.js';
import type { ButtonComponentSystem } from './system.js';
