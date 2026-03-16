/**
 * @import { EventHandler } from './event-handler.js'
 * @import { HandleEventCallback } from './event-handler.js'
 */
/**
 * Event Handle that is created by {@link EventHandler} and can be used for easier event removal
 * and management.
 *
 * @example
 * const evt = obj.on('test', (a, b) => {
 *     console.log(a + b);
 * });
 * obj.fire('test');
 *
 * evt.off(); // easy way to remove this event
 * obj.fire('test'); // this will not trigger an event
 * @example
 * // store an array of event handles
 * let events = [];
 *
 * events.push(objA.on('testA', () => {}));
 * events.push(objB.on('testB', () => {}));
 *
 * // when needed, remove all events
 * events.forEach((evt) => {
 *     evt.off();
 * });
 * events = [];
 */
export class EventHandle {
    /**
     * @param {EventHandler} handler - source object of the event.
     * @param {string} name - Name of the event.
     * @param {HandleEventCallback} callback - Function that is called when event is fired.
     * @param {object} scope - Object that is used as `this` when event is fired.
     * @param {boolean} [once] - If this is a single event and will be removed after event is fired.
     */
    constructor(handler: EventHandler, name: string, callback: HandleEventCallback, scope: object, once?: boolean);
    /**
     * @type {EventHandler}
     * @private
     */
    private handler;
    /**
     * @type {string}
     * @ignore
     */
    name: string;
    /**
     * @type {HandleEventCallback}
     * @ignore
     */
    callback: HandleEventCallback;
    /**
     * @type {object}
     * @ignore
     */
    scope: object;
    /**
     * @type {boolean}
     * @ignore
     */
    _once: boolean;
    /**
     * True if event has been removed.
     * @type {boolean}
     * @private
     */
    private _removed;
    /**
     * Remove this event from its handler.
     */
    off(): void;
    on(name: any, callback: any, scope?: this): EventHandle;
    once(name: any, callback: any, scope?: this): EventHandle;
    /**
     * Mark if event has been removed.
     *
     * @type {boolean}
     * @ignore
     */
    set removed(value: boolean);
    /**
     * True if event has been removed.
     *
     * @type {boolean}
     * @ignore
     */
    get removed(): boolean;
    toJSON(key: any): any;
}
import type { HandleEventCallback } from './event-handler.js';
import type { EventHandler } from './event-handler.js';
