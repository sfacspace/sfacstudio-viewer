/**
 * Handles mouse and touch events for {@link ElementComponent}s. When input events occur on an
 * ElementComponent this fires the appropriate events on the ElementComponent.
 *
 * @category User Interface
 */
export class ElementInput {
    static buildHitCorners(element: any, screenOrWorldCorners: any, scale: any): any;
    static calculateScaleToScreen(element: any): Vec3;
    static calculateScaleToWorld(element: any): Vec3;
    /**
     * Create a new ElementInput instance.
     *
     * @param {Element} domElement - The DOM element.
     * @param {object} [options] - Optional arguments.
     * @param {boolean} [options.useMouse] - Whether to allow mouse input. Defaults to true.
     * @param {boolean} [options.useTouch] - Whether to allow touch input. Defaults to true.
     * @param {boolean} [options.useXr] - Whether to allow XR input sources. Defaults to true.
     */
    constructor(domElement: Element, options?: {
        useMouse?: boolean;
        useTouch?: boolean;
        useXr?: boolean;
    });
    _app: any;
    _attached: boolean;
    _target: Element;
    _enabled: boolean;
    _lastX: number;
    _lastY: number;
    _upHandler: any;
    _downHandler: any;
    _moveHandler: any;
    _wheelHandler: any;
    _touchstartHandler: any;
    _touchendHandler: any;
    _touchcancelHandler: any;
    _touchmoveHandler: any;
    _sortHandler: any;
    _elements: any[];
    _hoveredElement: any;
    _pressedElement: any;
    _touchedElements: {};
    _touchesForWhichTouchLeaveHasFired: {};
    _selectedElements: {};
    _selectedPressedElements: {};
    _useMouse: boolean;
    _useTouch: boolean;
    _useXr: boolean;
    _selectEventsAttached: boolean;
    _clickedEntities: {};
    set enabled(value: boolean);
    get enabled(): boolean;
    set app(value: any);
    get app(): any;
    /**
     * Attach mouse and touch events to a DOM element.
     *
     * @param {Element} domElement - The DOM element.
     */
    attach(domElement: Element): void;
    attachSelectEvents(): void;
    /**
     * Remove mouse and touch events from the DOM element that it is attached to.
     */
    detach(): void;
    /**
     * Add a {@link ElementComponent} to the internal list of ElementComponents that are being
     * checked for input.
     *
     * @param {ElementComponent} element - The
     * ElementComponent.
     */
    addElement(element: ElementComponent): void;
    /**
     * Remove a {@link ElementComponent} from the internal list of ElementComponents that are being
     * checked for input.
     *
     * @param {ElementComponent} element - The
     * ElementComponent.
     */
    removeElement(element: ElementComponent): void;
    _handleUp(event: any): void;
    _handleDown(event: any): void;
    _handleMove(event: any): void;
    _handleWheel(event: any): void;
    _determineTouchedElements(event: any): {};
    _handleTouchStart(event: any): void;
    _handleTouchEnd(event: any): void;
    _handleTouchMove(event: any): void;
    _onElementMouseEvent(eventType: any, event: any): void;
    _onXrStart(): void;
    _onXrEnd(): void;
    _onXrUpdate(): void;
    _onXrInputRemove(inputSource: any): void;
    _onSelectStart(inputSource: any, event: any): void;
    _onSelectEnd(inputSource: any, event: any): void;
    _onElementSelectEvent(eventType: any, inputSource: any, event: any): void;
    _fireEvent(name: any, evt: any): void;
    _calcMouseCoords(event: any): void;
    _sortElements(a: any, b: any): any;
    _getTargetElementByCoords(camera: any, x: any, y: any): any;
    _getTargetElementByRay(ray: any, camera: any): any;
    _getTargetElement(camera: any, rayScreen: any, ray3d: any): any;
    _calculateRayScreen(x: any, y: any, camera: any, ray: any): boolean;
    _calculateRay3d(x: any, y: any, camera: any, ray: any): boolean;
    _checkElement(ray: any, element: any, screen: any): number;
}
/**
 * Represents an input event fired on a {@link ElementComponent}. When an event is raised on an
 * ElementComponent it bubbles up to its parent ElementComponents unless we call stopPropagation().
 *
 * @category User Interface
 */
export class ElementInputEvent {
    /**
     * Create a new ElementInputEvent instance.
     *
     * @param {MouseEvent|TouchEvent} event - MouseEvent or TouchEvent that was originally raised.
     * @param {ElementComponent} element - The ElementComponent that this event was originally
     * raised on.
     * @param {CameraComponent} camera - The CameraComponent that this event was originally raised
     * via.
     */
    constructor(event: MouseEvent | TouchEvent, element: ElementComponent, camera: CameraComponent);
    /**
     * MouseEvent or TouchEvent that was originally raised.
     *
     * @type {MouseEvent|TouchEvent}
     */
    event: MouseEvent | TouchEvent;
    /**
     * The ElementComponent that this event was originally raised on.
     *
     * @type {ElementComponent}
     */
    element: ElementComponent;
    /**
     * The CameraComponent that this event was originally raised via.
     *
     * @type {CameraComponent}
     */
    camera: CameraComponent;
    _stopPropagation: boolean;
    /**
     * Stop propagation of the event to parent {@link ElementComponent}s. This also stops
     * propagation of the event to other event listeners of the original DOM Event.
     */
    stopPropagation(): void;
}
/**
 * Represents a Mouse event fired on a {@link ElementComponent}.
 *
 * @category User Interface
 */
export class ElementMouseEvent extends ElementInputEvent {
    /**
     * Create an instance of an ElementMouseEvent.
     *
     * @param {MouseEvent} event - The MouseEvent that
     * was originally raised.
     * @param {ElementComponent} element - The
     * ElementComponent that this event was originally raised on.
     * @param {CameraComponent} camera - The
     * CameraComponent that this event was originally raised via.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @param {number} lastX - The last x coordinate.
     * @param {number} lastY - The last y coordinate.
     */
    constructor(event: MouseEvent, element: ElementComponent, camera: CameraComponent, x: number, y: number, lastX: number, lastY: number);
    x: number;
    y: number;
    /**
     * Whether the ctrl key was pressed.
     *
     * @type {boolean}
     */
    ctrlKey: boolean;
    /**
     * Whether the alt key was pressed.
     *
     * @type {boolean}
     */
    altKey: boolean;
    /**
     * Whether the shift key was pressed.
     *
     * @type {boolean}
     */
    shiftKey: boolean;
    /**
     * Whether the meta key was pressed.
     *
     * @type {boolean}
     */
    metaKey: boolean;
    /**
     * The mouse button.
     *
     * @type {number}
     */
    button: number;
    /**
     * The amount of horizontal movement of the cursor.
     *
     * @type {number}
     */
    dx: number;
    /**
     * The amount of vertical movement of the cursor.
     *
     * @type {number}
     */
    dy: number;
    /**
     * The amount of the wheel movement.
     *
     * @type {number}
     */
    wheelDelta: number;
}
/**
 * Represents a XRInputSourceEvent fired on a {@link ElementComponent}.
 *
 * @category User Interface
 */
export class ElementSelectEvent extends ElementInputEvent {
    /**
     * Create an instance of a ElementSelectEvent.
     *
     * @param {XRInputSourceEvent} event - The XRInputSourceEvent that was originally raised.
     * @param {ElementComponent} element - The
     * ElementComponent that this event was originally raised on.
     * @param {CameraComponent} camera - The
     * CameraComponent that this event was originally raised via.
     * @param {XrInputSource} inputSource - The XR input source
     * that this event was originally raised from.
     */
    constructor(event: XRInputSourceEvent, element: ElementComponent, camera: CameraComponent, inputSource: XrInputSource);
    /**
     * The XR input source that this event was originally raised from.
     *
     * @type {XrInputSource}
     */
    inputSource: XrInputSource;
}
/**
 * Represents a TouchEvent fired on a {@link ElementComponent}.
 *
 * @category User Interface
 */
export class ElementTouchEvent extends ElementInputEvent {
    /**
     * Create an instance of an ElementTouchEvent.
     *
     * @param {TouchEvent} event - The TouchEvent that was originally raised.
     * @param {ElementComponent} element - The
     * ElementComponent that this event was originally raised on.
     * @param {CameraComponent} camera - The
     * CameraComponent that this event was originally raised via.
     * @param {number} x - The x coordinate of the touch that triggered the event.
     * @param {number} y - The y coordinate of the touch that triggered the event.
     * @param {Touch} touch - The touch object that triggered the event.
     */
    constructor(event: TouchEvent, element: ElementComponent, camera: CameraComponent, x: number, y: number, touch: Touch);
    /**
     * The Touch objects representing all current points of contact with the surface,
     * regardless of target or changed status.
     *
     * @type {Touch[]}
     */
    touches: Touch[];
    /**
     * The Touch objects representing individual points of contact whose states changed between
     * the previous touch event and this one.
     *
     * @type {Touch[]}
     */
    changedTouches: Touch[];
    x: number;
    y: number;
    /**
     * The touch object that triggered the event.
     *
     * @type {Touch}
     */
    touch: Touch;
}
import type { ElementComponent } from '../components/element/component.js';
import { Vec3 } from '../../core/math/vec3.js';
import type { MouseEvent } from '../../platform/input/mouse-event.js';
import type { TouchEvent } from '../../platform/input/touch-event.js';
import type { CameraComponent } from '../components/camera/component.js';
import type { XrInputSource } from '../xr/xr-input-source.js';
import type { Touch } from '../../platform/input/touch-event.js';
