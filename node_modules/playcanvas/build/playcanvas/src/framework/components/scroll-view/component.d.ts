/**
 * A ScrollViewComponent enables a group of entities to behave like a masked scrolling area, with
 * optional horizontal and vertical scroll bars.
 *
 * @hideconstructor
 * @category User Interface
 */
export class ScrollViewComponent extends Component {
    /**
     * Fired whenever the scroll position changes. The handler is passed a {@link Vec2} containing
     * the horizontal and vertical scroll values in the range 0..1.
     *
     * @event
     * @example
     * entity.scrollview.on('set:scroll', (scroll) => {
     *     console.log(`Horizontal scroll position: ${scroll.x}`);
     *     console.log(`Vertical scroll position: ${scroll.y}`);
     * });
     */
    static EVENT_SETSCROLL: string;
    /**
     * Create a new ScrollViewComponent.
     *
     * @param {ScrollViewComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: ScrollViewComponentSystem, entity: Entity);
    /**
     * @type {Entity|null}
     * @private
     */
    private _viewportEntity;
    /**
     * @type {Entity|null}
     * @private
     */
    private _contentEntity;
    /**
     * @type {Entity|null}
     * @private
     */
    private _horizontalScrollbarEntity;
    /**
     * @type {Entity|null}
     * @private
     */
    private _verticalScrollbarEntity;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtElementRemove;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtViewportElementRemove;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtViewportResize;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtContentEntityElementAdd;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtContentElementRemove;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtContentResize;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtHorizontalScrollbarAdd;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtHorizontalScrollbarRemove;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtHorizontalScrollbarValue;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtVerticalScrollbarAdd;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtVerticalScrollbarRemove;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtVerticalScrollbarValue;
    _scrollbarUpdateFlags: {};
    _scrollbarEntities: {};
    _prevContentSizes: {};
    _scroll: Vec2;
    _velocity: Vec3;
    _dragStartPosition: Vec3;
    _disabledContentInput: boolean;
    _disabledContentInputEntities: any[];
    /**
     * @type {ScrollViewComponentData}
     * @ignore
     */
    get data(): ScrollViewComponentData;
    /**
     * Sets whether horizontal scrolling is enabled.
     *
     * @type {boolean}
     */
    set horizontal(arg: boolean);
    /**
     * Gets whether horizontal scrolling is enabled.
     *
     * @type {boolean}
     */
    get horizontal(): boolean;
    /**
     * Sets whether vertical scrolling is enabled.
     *
     * @type {boolean}
     */
    set vertical(arg: boolean);
    /**
     * Gets whether vertical scrolling is enabled.
     *
     * @type {boolean}
     */
    get vertical(): boolean;
    /**
     * Sets the scroll mode of the scroll viewer. Specifies how the scroll view should behave when
     * the user scrolls past the end of the content. Modes are defined as follows:
     *
     * - {@link SCROLL_MODE_CLAMP}: Content does not scroll any further than its bounds.
     * - {@link SCROLL_MODE_BOUNCE}: Content scrolls past its bounds and then gently bounces back.
     * - {@link SCROLL_MODE_INFINITE}: Content can scroll forever.
     *
     * @type {number}
     */
    set scrollMode(arg: number);
    /**
     * Gets the scroll mode of the scroll viewer.
     *
     * @type {number}
     */
    get scrollMode(): number;
    /**
     * Sets how far the content should move before bouncing back.
     *
     * @type {number}
     */
    set bounceAmount(arg: number);
    /**
     * Gets how far the content should move before bouncing back.
     *
     * @type {number}
     */
    get bounceAmount(): number;
    /**
     * Sets how freely the content should move if thrown, i.e. By flicking on a phone or by
     * flinging the scroll wheel on a mouse. A value of 1 means that content will stop immediately;
     * 0 means that content will continue moving forever (or until the bounds of the content are
     * reached, depending on the scrollMode).
     *
     * @type {number}
     */
    set friction(arg: number);
    /**
     * Gets how freely the content should move if thrown.
     *
     * @type {number}
     */
    get friction(): number;
    set dragThreshold(arg: number);
    get dragThreshold(): number;
    /**
     * Sets whether to use mouse wheel for scrolling (horizontally and vertically).
     *
     * @type {boolean}
     */
    set useMouseWheel(arg: boolean);
    /**
     * Gets whether to use mouse wheel for scrolling (horizontally and vertically).
     *
     * @type {boolean}
     */
    get useMouseWheel(): boolean;
    /**
     * Sets the mouse wheel horizontal and vertical sensitivity. Only used if useMouseWheel is set.
     * Setting a direction to 0 will disable mouse wheel scrolling in that direction. 1 is a
     * default sensitivity that is considered to feel good. The values can be set higher or lower
     * than 1 to tune the sensitivity. Defaults to [1, 1].
     *
     * @type {Vec2}
     */
    set mouseWheelSensitivity(arg: Vec2);
    /**
     * Gets the mouse wheel horizontal and vertical sensitivity.
     *
     * @type {Vec2}
     */
    get mouseWheelSensitivity(): Vec2;
    /**
     * Sets whether the horizontal scrollbar should be visible all the time, or only visible when
     * the content exceeds the size of the viewport.
     *
     * @type {number}
     */
    set horizontalScrollbarVisibility(arg: number);
    /**
     * Gets whether the horizontal scrollbar should be visible all the time, or only visible when
     * the content exceeds the size of the viewport.
     *
     * @type {number}
     */
    get horizontalScrollbarVisibility(): number;
    /**
     * Sets whether the vertical scrollbar should be visible all the time, or only visible when the
     * content exceeds the size of the viewport.
     *
     * @type {number}
     */
    set verticalScrollbarVisibility(arg: number);
    /**
     * Gets whether the vertical scrollbar should be visible all the time, or only visible when the
     * content exceeds the size of the viewport.
     *
     * @type {number}
     */
    get verticalScrollbarVisibility(): number;
    /**
     * Sets the entity to be used as the masked viewport area, within which the content will scroll.
     * This entity must have an ElementGroup component.
     *
     * @type {Entity|string|null}
     */
    set viewportEntity(arg: Entity | null);
    /**
     * Gets the entity to be used as the masked viewport area, within which the content will scroll.
     *
     * @type {Entity|null}
     */
    get viewportEntity(): Entity | null;
    /**
     * Sets the entity which contains the scrolling content itself. This entity must have an
     * {@link ElementComponent}.
     *
     * @type {Entity|string|null}
     */
    set contentEntity(arg: Entity | null);
    /**
     * Gets the entity which contains the scrolling content itself.
     *
     * @type {Entity|null}
     */
    get contentEntity(): Entity | null;
    /**
     * Sets the entity to be used as the horizontal scrollbar. This entity must have a
     * {@link ScrollbarComponent}.
     *
     * @type {Entity|string|null}
     */
    set horizontalScrollbarEntity(arg: Entity | null);
    /**
     * Gets the entity to be used as the horizontal scrollbar.
     *
     * @type {Entity|null}
     */
    get horizontalScrollbarEntity(): Entity | null;
    /**
     * Sets the entity to be used as the vertical scrollbar. This entity must have a
     * {@link ScrollbarComponent}.
     *
     * @type {Entity|string|null}
     */
    set verticalScrollbarEntity(arg: Entity | null);
    /**
     * Gets the entity to be used as the vertical scrollbar.
     *
     * @type {Entity|null}
     */
    get verticalScrollbarEntity(): Entity | null;
    /**
     * Sets the scroll value.
     *
     * @type {Vec2}
     */
    set scroll(value: Vec2);
    /**
     * Gets the scroll value.
     *
     * @type {Vec2}
     */
    get scroll(): Vec2;
    /** @ignore */
    _setValue(name: any, value: any): void;
    /**
     * @param {string} onOrOff - 'on' or 'off'.
     * @private
     */
    private _toggleLifecycleListeners;
    /**
     * @param {string} onOrOff - 'on' or 'off'.
     * @private
     */
    private _toggleElementListeners;
    _hasElementListeners: boolean;
    _onElementComponentAdd(entity: any): void;
    _onElementComponentRemove(entity: any): void;
    _viewportEntitySubscribe(): void;
    _evtViewportEntityElementAdd: EventHandle;
    _viewportEntityUnsubscribe(): void;
    _viewportEntityElementSubscribe(): void;
    _viewportEntityElementUnsubscribe(): void;
    _onViewportElementGain(): void;
    _onViewportElementLose(): void;
    _contentEntitySubscribe(): void;
    _contentEntityUnsubscribe(): void;
    _contentEntityElementSubscribe(): void;
    _contentEntityElementUnsubscribe(): void;
    _onContentElementGain(): void;
    _contentDragHelper: ElementDragHelper;
    _onContentElementLose(): void;
    _onContentDragStart(): void;
    _onContentDragEnd(): void;
    _prevContentDragPosition: any;
    _onContentDragMove(position: any): void;
    _wasDragged: boolean;
    _horizontalScrollbarEntitySubscribe(): void;
    _verticalScrollbarEntitySubscribe(): void;
    _horizontalScrollbarEntityUnsubscribe(): void;
    _verticalScrollbarEntityUnsubscribe(): void;
    _onSetHorizontalScrollbarValue(scrollValueX: any): void;
    _onSetVerticalScrollbarValue(scrollValueY: any): void;
    _onHorizontalScrollbarGain(): void;
    _onVerticalScrollbarGain(): void;
    _onHorizontalScrollbarLose(): void;
    _onVerticalScrollbarLose(): void;
    _onSetHorizontalScrollingEnabled(): void;
    _onSetVerticalScrollingEnabled(): void;
    _onSetScroll(x: any, y: any, resetVelocity: any): void;
    _updateAxis(scrollValue: any, axis: any, orientation: any): boolean;
    _determineNewScrollValue(scrollValue: any, axis: any, orientation: any): any;
    _syncAll(): void;
    _syncContentPosition(orientation: any): void;
    _syncScrollbarPosition(orientation: any): void;
    _syncScrollbarEnabledState(orientation: any): void;
    _contentIsLargerThanViewport(orientation: any): boolean;
    _contentPositionToScrollValue(contentPosition: any): Vec2;
    _getMaxOffset(orientation: any, contentSize: any): number;
    _getMaxScrollValue(orientation: any): 0 | 1;
    _getScrollbarHandleSize(axis: any, orientation: any): number;
    _getViewportSize(orientation: any): any;
    _getContentSize(orientation: any): any;
    _getSize(orientation: any, entity: any): any;
    _getScrollingEnabled(orientation: any): boolean;
    _getScrollbarVisibility(orientation: any): number;
    _getSign(orientation: any): 1 | -1;
    _getAxis(orientation: any): "x" | "y";
    _getCalculatedDimension(orientation: any): "calculatedWidth" | "calculatedHeight";
    _destroyDragHelper(): void;
    onUpdate(): void;
    _updateVelocity(): void;
    _hasOvershoot(axis: any, orientation: any): boolean;
    _toOvershoot(scrollValue: any, orientation: any): any;
    _setVelocityFromOvershoot(scrollValue: any, axis: any, orientation: any): void;
    _setVelocityFromContentPositionDelta(position: any): void;
    _setScrollFromContentPosition(position: any): void;
    _applyScrollValueTension(scrollValue: any): any;
    _isDragging(): boolean;
    _setScrollbarComponentsEnabled(enabled: any): void;
    _setContentDraggingEnabled(enabled: any): void;
    _onMouseWheel(event: any): void;
    _enableContentInput(): void;
    _disableContentInput(): void;
    onRemove(): void;
    resolveDuplicatedEntityReferenceProperties(oldScrollView: any, duplicatedIdsMap: any): void;
}
import { Component } from '../component.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { Vec3 } from '../../../core/math/vec3.js';
import type { ScrollViewComponentData } from './data.js';
import type { Entity } from '../../entity.js';
import type { EventHandle } from '../../../core/event-handle.js';
import { ElementDragHelper } from '../element/element-drag-helper.js';
import type { ScrollViewComponentSystem } from './system.js';
