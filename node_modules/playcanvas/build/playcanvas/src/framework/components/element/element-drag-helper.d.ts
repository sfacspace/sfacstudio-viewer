/**
 * Helper class that makes it easy to create Elements that can be dragged by the mouse or touch.
 *
 * @category User Interface
 */
export class ElementDragHelper extends EventHandler {
    /**
     * Fired when a new drag operation starts.
     *
     * @event
     * @example
     * elementDragHelper.on('drag:start', () => {
     *     console.log('Drag started');
     * });
     */
    static EVENT_DRAGSTART: string;
    /**
     * Fired when the current new drag operation ends.
     *
     * @event
     * @example
     * elementDragHelper.on('drag:end', () => {
     *     console.log('Drag ended');
     * });
     */
    static EVENT_DRAGEND: string;
    /**
     * Fired whenever the position of the dragged element changes. The handler is passed the
     * current {@link Vec3} position of the dragged element.
     *
     * @event
     * @example
     * elementDragHelper.on('drag:move', (position) => {
     *     console.log(`Dragged element position is ${position}`);
     * });
     */
    static EVENT_DRAGMOVE: string;
    /**
     * Create a new ElementDragHelper instance.
     *
     * @param {ElementComponent} element - The Element that should become draggable.
     * @param {string} [axis] - Optional axis to constrain to, either 'x', 'y' or null.
     */
    constructor(element: ElementComponent, axis?: string);
    _element: ElementComponent;
    _app: import("../../app-base.js").AppBase;
    _axis: string;
    _enabled: boolean;
    _dragScale: Vec3;
    _dragStartMousePosition: Vec3;
    _dragStartHandlePosition: Vec3;
    _deltaMousePosition: Vec3;
    _deltaHandlePosition: Vec3;
    _isDragging: boolean;
    /**
     * @param {'on'|'off'} onOrOff - Either 'on' or 'off'.
     * @private
     */
    private _toggleLifecycleListeners;
    /**
     * @param {'on'|'off'} onOrOff - Either 'on' or 'off'.
     * @private
     */
    private _toggleDragListeners;
    _hasDragListeners: boolean;
    _onMouseDownOrTouchStart(event: any): void;
    _dragCamera: any;
    _onMouseUpOrTouchEnd(): void;
    /**
     * This method calculates the `Vec3` intersection point of plane/ray intersection based on
     * the mouse/touch input event. If there is no intersection, it returns `null`.
     *
     * @param {ElementTouchEvent|ElementMouseEvent|ElementSelectEvent} event - The event.
     * @returns {Vec3|null} The `Vec3` intersection point of plane/ray intersection, if there
     * is an intersection, otherwise `null`
     * @private
     */
    private _screenToLocal;
    _determineInputPosition(event: any): void;
    _chooseRayOriginAndDirection(): void;
    _calculateDragScale(): void;
    /**
     * This method is linked to `_element` events: `mousemove` and `touchmove`
     *
     * @param {ElementTouchEvent} event - The event.
     * @private
     */
    private _onMove;
    destroy(): void;
    set enabled(value: boolean);
    get enabled(): boolean;
    get isDragging(): boolean;
}
import { EventHandler } from '../../../core/event-handler.js';
import { ElementComponent } from './component.js';
import { Vec3 } from '../../../core/math/vec3.js';
