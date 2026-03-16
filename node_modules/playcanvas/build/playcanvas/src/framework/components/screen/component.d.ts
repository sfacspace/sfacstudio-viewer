/**
 * A ScreenComponent defines a rectangular area where user interfaces can be constructed. Screens
 * can either be 2D (screen space) or 3D (world space) - see {@link screenSpace}. It is possible to
 * create an {@link Entity} hierarchy underneath an Entity with a ScreenComponent to create complex
 * user interfaces using the following components:
 *
 * - {@link ButtonComponent}
 * - {@link ElementComponent}
 * - {@link LayoutChildComponent}
 * - {@link LayoutGroupComponent}
 * - {@link ScrollbarComponent}
 * - {@link ScrollViewComponent}
 *
 * You should never need to use the ScreenComponent constructor directly. To add a ScreenComponent
 * to an {@link Entity}, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = new pc.Entity();
 * entity.addComponent('screen', {
 *     referenceResolution: new pc.Vec2(1280, 720),
 *     screenSpace: false
 * });
 * ```
 *
 * Once the ScreenComponent is added to the entity, you can access it via the {@link Entity#screen}
 * property:
 *
 * ```javascript
 * entity.screen.scaleBlend = 0.6; // Set the screen's scale blend to 0.6
 *
 * console.log(entity.screen.scaleBlend); // Get the screen's scale blend and print it
 * ```
 *
 * Relevant Engine API examples:
 *
 * - [Screen Space Screen](https://playcanvas.github.io/#/user-interface/text)
 * - [World Space Screen](https://playcanvas.github.io/#/user-interface/world-ui)
 *
 * @hideconstructor
 * @category User Interface
 */
export class ScreenComponent extends Component {
    /**
     * Create a new ScreenComponent.
     *
     * @param {ScreenComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: ScreenComponentSystem, entity: Entity);
    _resolution: Vec2;
    _referenceResolution: Vec2;
    _scaleMode: string;
    scale: number;
    _scaleBlend: number;
    _priority: number;
    _screenSpace: boolean;
    /**
     * If true, then elements inside this screen will be not be rendered when outside of the
     * screen (only valid when screenSpace is true).
     *
     * @type {boolean}
     */
    cull: boolean;
    _screenMatrix: Mat4;
    _elements: Set<any>;
    /**
     * Set the drawOrder of each child {@link ElementComponent} so that ElementComponents which are
     * last in the hierarchy are rendered on top. Draw Order sync is queued and will be updated by
     * the next update loop.
     */
    syncDrawOrder(): void;
    _recurseDrawOrderSync(e: any, i: any): any;
    _processDrawOrderSync(): void;
    _calcProjectionMatrix(): void;
    _updateScale(): void;
    _calcScale(resolution: any, referenceResolution: any): number;
    _onResize(width: any, height: any): void;
    /**
     * Sets the width and height of the ScreenComponent. When {@link screenSpace} is true, the
     * resolution will always be equal to {@link GraphicsDevice#width} by
     * {@link GraphicsDevice#height}.
     *
     * @type {Vec2}
     */
    set resolution(value: Vec2);
    /**
     * Gets the width and height of the ScreenComponent.
     *
     * @type {Vec2}
     */
    get resolution(): Vec2;
    _bindElement(element: any): void;
    _unbindElement(element: any): void;
    onRemove(): void;
    /**
     * Sets the resolution that the ScreenComponent is designed for. This is only taken into
     * account when {@link screenSpace} is true and {@link scaleMode} is {@link SCALEMODE_BLEND}.
     * If the actual resolution is different, then the ScreenComponent will be scaled according to
     * the {@link scaleBlend} value.
     *
     * @type {Vec2}
     */
    set referenceResolution(value: Vec2);
    /**
     * Gets the resolution that the ScreenComponent is designed for.
     *
     * @type {Vec2}
     */
    get referenceResolution(): Vec2;
    /**
     * Sets whether the ScreenComponent will render its child {@link ElementComponent}s in screen
     * space instead of world space. Enable this to create 2D user interfaces. Defaults to false.
     *
     * @type {boolean}
     */
    set screenSpace(value: boolean);
    /**
     * Gets whether the ScreenComponent will render its child {@link ElementComponent}s in screen
     * space instead of world space.
     *
     * @type {boolean}
     */
    get screenSpace(): boolean;
    /**
     * Sets the scale mode. Can either be {@link SCALEMODE_NONE} or {@link SCALEMODE_BLEND}. See
     * the description of {@link referenceResolution} for more information. Defaults to
     * {@link SCALEMODE_NONE}.
     *
     * @type {string}
     */
    set scaleMode(value: string);
    /**
     * Gets the scale mode.
     *
     * @type {string}
     */
    get scaleMode(): string;
    /**
     * Sets the scale blend. This is a value between 0 and 1 that is used when {@link scaleMode} is
     * equal to {@link SCALEMODE_BLEND}. Scales the ScreenComponent with width as a reference (when
     * value is 0), the height as a reference (when value is 1) or anything in between. Defaults to
     * 0.5.
     *
     * @type {number}
     */
    set scaleBlend(value: number);
    /**
     * Gets the scale blend.
     *
     * @type {number}
     */
    get scaleBlend(): number;
    /**
     * Sets the screen's render priority. Priority determines the order in which ScreenComponents
     * in the same layer are rendered. Number must be an integer between 0 and 127. Priority is set
     * into the top 8 bits of the {@link ElementComponent#drawOrder} property. Defaults to 0.
     *
     * @type {number}
     */
    set priority(value: number);
    /**
     * Gets the screen's render priority.
     *
     * @type {number}
     */
    get priority(): number;
}
import { Component } from '../component.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { Mat4 } from '../../../core/math/mat4.js';
import type { ScreenComponentSystem } from './system.js';
import { Entity } from '../../entity.js';
