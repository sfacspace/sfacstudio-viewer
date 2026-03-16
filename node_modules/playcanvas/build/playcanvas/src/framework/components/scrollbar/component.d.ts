/**
 * @import { EventHandle } from '../../../core/event-handle.js'
 * @import { Entity } from '../../entity.js'
 * @import { ScrollbarComponentData } from './data.js'
 * @import { ScrollbarComponentSystem } from './system.js'
 */
/**
 * A ScrollbarComponent enables a group of entities to behave like a draggable scrollbar.
 *
 * @hideconstructor
 * @category User Interface
 */
export class ScrollbarComponent extends Component {
    /**
     * Fired whenever the scroll value changes. The handler is passed a number representing the
     * current scroll value.
     *
     * @event
     * @example
     * entity.scrollbar.on('set:value', (value) => {
     *     console.log(`Scroll value is now ${value}`);
     * });
     */
    static EVENT_SETVALUE: string;
    /**
     * Create a new ScrollbarComponent.
     *
     * @param {ScrollbarComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: ScrollbarComponentSystem, entity: Entity);
    /**
     * @type {Entity|null}
     * @private
     */
    private _handleEntity;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtHandleEntityElementAdd;
    /**
     * @type {EventHandle[]}
     * @private
     */
    private _evtHandleEntityChanges;
    /**
     * @type {ScrollbarComponentData}
     * @ignore
     */
    get data(): ScrollbarComponentData;
    /**
     * Sets whether the scrollbar moves horizontally or vertically. Can be:
     *
     * - {@link ORIENTATION_HORIZONTAL}: The scrollbar animates in the horizontal axis.
     * - {@link ORIENTATION_VERTICAL}: The scrollbar animates in the vertical axis.
     *
     * Defaults to {@link ORIENTATION_HORIZONTAL}.
     *
     * @type {number}
     */
    set orientation(arg: number);
    /**
     * Gets whether the scrollbar moves horizontally or vertically.
     *
     * @type {number}
     */
    get orientation(): number;
    /**
     * Sets the current position value of the scrollbar, in the range 0 to 1. Defaults to 0.
     *
     * @type {number}
     */
    set value(arg: number);
    /**
     * Gets the current position value of the scrollbar.
     *
     * @type {number}
     */
    get value(): number;
    /**
     * Sets the size of the handle relative to the size of the track, in the range 0 to 1. For a
     * vertical scrollbar, a value of 1 means that the handle will take up the full height of the
     * track.
     *
     * @type {number}
     */
    set handleSize(arg: number);
    /**
     * Gets the size of the handle relative to the size of the track.
     *
     * @type {number}
     */
    get handleSize(): number;
    /**
     * Sets the entity to be used as the scrollbar handle. This entity must have a
     * {@link ScrollbarComponent}.
     *
     * @type {Entity|string|null}
     */
    set handleEntity(arg: Entity | null);
    /**
     * Gets the entity to be used as the scrollbar handle.
     *
     * @type {Entity|null}
     */
    get handleEntity(): Entity | null;
    /** @ignore */
    _setValue(name: any, value: any): void;
    /**
     * @param {string} onOrOff - 'on' or 'off'.
     * @private
     */
    private _toggleLifecycleListeners;
    _handleEntitySubscribe(): void;
    _handleEntityUnsubscribe(): void;
    _handleEntityElementSubscribe(): void;
    _handleEntityElementUnsubscribe(): void;
    _onHandleElementGain(): void;
    _handleDragHelper: ElementDragHelper;
    _onHandleElementLose(): void;
    _onHandleDrag(position: any): void;
    _onSetValue(name: any, oldValue: any, newValue: any): void;
    _onSetHandleSize(name: any, oldValue: any, newValue: any): void;
    _onSetHandleAlignment(): void;
    _onSetOrientation(name: any, oldValue: any, newValue: any): void;
    _updateHandlePositionAndSize(): void;
    _handlePositionToScrollValue(handlePosition: any): number;
    _scrollValueToHandlePosition(value: any): number;
    _getUsableTrackLength(): number;
    _getTrackLength(): number;
    _getHandleLength(): number;
    _getHandlePosition(): number;
    _getSign(): 1 | -1;
    _getAxis(): "x" | "y";
    _getDimension(): "height" | "width";
    _getOppositeDimension(): "height" | "width";
    _destroyDragHelper(): void;
    _setHandleDraggingEnabled(enabled: any): void;
    onRemove(): void;
    resolveDuplicatedEntityReferenceProperties(oldScrollbar: any, duplicatedIdsMap: any): void;
}
import { Component } from '../component.js';
import type { ScrollbarComponentData } from './data.js';
import type { Entity } from '../../entity.js';
import { ElementDragHelper } from '../element/element-drag-helper.js';
import type { ScrollbarComponentSystem } from './system.js';
