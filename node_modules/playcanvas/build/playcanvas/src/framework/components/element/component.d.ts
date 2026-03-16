/**
 * ElementComponents are used to construct user interfaces. The {@link ElementComponent#type}
 * property can be configured in 3 main ways: as a text element, as an image element or as a group
 * element. If the ElementComponent has a {@link ScreenComponent} ancestor in the hierarchy, it
 * will be transformed with respect to the coordinate system of the screen. If there is no
 * {@link ScreenComponent} ancestor, the ElementComponent will be transformed like any other
 * entity.
 *
 * You should never need to use the ElementComponent constructor directly. To add an
 * ElementComponent to an {@link Entity}, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = pc.Entity();
 * entity.addComponent('element'); // This defaults to a 'group' element
 * ```
 *
 * To create a simple text-based element:
 *
 * ```javascript
 * entity.addComponent('element', {
 *     anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5), // centered anchor
 *     fontAsset: fontAsset,
 *     fontSize: 128,
 *     pivot: new pc.Vec2(0.5, 0.5),            // centered pivot
 *     text: 'Hello World!',
 *     type: pc.ELEMENTTYPE_TEXT
 * });
 * ```
 *
 * Once the ElementComponent is added to the entity, you can access it via the
 * {@link Entity#element} property:
 *
 * ```javascript
 * entity.element.color = pc.Color.RED; // Set the element's color to red
 *
 * console.log(entity.element.color);   // Get the element's color and print it
 * ```
 *
 * Relevant Engine API examples:
 *
 * - [Basic text rendering](https://playcanvas.github.io/#/user-interface/text)
 * - [Auto font sizing](https://playcanvas.github.io/#/user-interface/text-auto-font-size)
 * - [Emojis](https://playcanvas.github.io/#/user-interface/text-emojis)
 * - [Text localization](https://playcanvas.github.io/#/user-interface/text-localization)
 * - [Typewriter text](https://playcanvas.github.io/#/user-interface/text-typewriter)
 *
 * @hideconstructor
 * @category User Interface
 */
export class ElementComponent extends Component {
    /**
     * Fired when the mouse is pressed while the cursor is on the component. Only fired when
     * useInput is true. The handler is passed an {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.element.on('mousedown', (event) => {
     *     console.log(`Mouse down event on entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSEDOWN: string;
    /**
     * Fired when the mouse is released while the cursor is on the component. Only fired when
     * useInput is true. The handler is passed an {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.element.on('mouseup', (event) => {
     *     console.log(`Mouse up event on entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSEUP: string;
    /**
     * Fired when the mouse cursor enters the component. Only fired when useInput is true. The
     * handler is passed an {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.element.on('mouseenter', (event) => {
     *     console.log(`Mouse enter event on entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSEENTER: string;
    /**
     * Fired when the mouse cursor leaves the component. Only fired when useInput is true. The
     * handler is passed an {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.element.on('mouseleave', (event) => {
     *     console.log(`Mouse leave event on entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSELEAVE: string;
    /**
     * Fired when the mouse cursor is moved on the component. Only fired when useInput is true. The
     * handler is passed an {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.element.on('mousemove', (event) => {
     *     console.log(`Mouse move event on entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSEMOVE: string;
    /**
     * Fired when the mouse wheel is scrolled on the component. Only fired when useInput is true.
     * The handler is passed an {@link ElementMouseEvent}.
     *
     * @event
     * @example
     * entity.element.on('mousewheel', (event) => {
     *     console.log(`Mouse wheel event on entity ${entity.name}`);
     * });
     */
    static EVENT_MOUSEWHEEL: string;
    /**
     * Fired when the mouse is pressed and released on the component or when a touch starts and
     * ends on the component. Only fired when useInput is true. The handler is passed an
     * {@link ElementMouseEvent} or {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.element.on('click', (event) => {
     *     console.log(`Click event on entity ${entity.name}`);
     * });
     */
    static EVENT_CLICK: string;
    /**
     * Fired when a touch starts on the component. Only fired when useInput is true. The handler is
     * passed an {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.element.on('touchstart', (event) => {
     *     console.log(`Touch start event on entity ${entity.name}`);
     * });
     */
    static EVENT_TOUCHSTART: string;
    /**
     * Fired when a touch ends on the component. Only fired when useInput is true. The handler is
     * passed an {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.element.on('touchend', (event) => {
     *     console.log(`Touch end event on entity ${entity.name}`);
     * });
     */
    static EVENT_TOUCHEND: string;
    /**
     * Fired when a touch moves after it started touching the component. Only fired when useInput
     * is true. The handler is passed an {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.element.on('touchmove', (event) => {
     *     console.log(`Touch move event on entity ${entity.name}`);
     * });
     */
    static EVENT_TOUCHMOVE: string;
    /**
     * Fired when a touch is canceled on the component. Only fired when useInput is true. The
     * handler is passed an {@link ElementTouchEvent}.
     *
     * @event
     * @example
     * entity.element.on('touchcancel', (event) => {
     *     console.log(`Touch cancel event on entity ${entity.name}`);
     * });
     */
    static EVENT_TOUCHCANCEL: string;
    /**
     * Create a new ElementComponent instance.
     *
     * @param {ElementComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: ElementComponentSystem, entity: Entity);
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayersChanged;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerAdded;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerRemoved;
    _beingInitialized: boolean;
    _anchor: Vec4;
    _localAnchor: Vec4;
    _pivot: Vec2;
    _width: number;
    _calculatedWidth: number;
    _height: number;
    _calculatedHeight: number;
    _margin: Vec4;
    _modelTransform: Mat4;
    _screenToWorld: Mat4;
    _anchorTransform: Mat4;
    _anchorDirty: boolean;
    _parentWorldTransform: Mat4;
    _screenTransform: Mat4;
    _screenCorners: Vec3[];
    _canvasCorners: Vec2[];
    _worldCorners: Vec3[];
    _cornersDirty: boolean;
    _canvasCornersDirty: boolean;
    _worldCornersDirty: boolean;
    /**
     * The Entity with a {@link ScreenComponent} that this component belongs to. This is
     * automatically set when the component is a child of a ScreenComponent.
     *
     * @type {Entity|null}
     */
    screen: Entity | null;
    _type: string;
    _image: ImageElement;
    _text: TextElement;
    _group: any;
    _drawOrder: number;
    _fitMode: string;
    _useInput: boolean;
    _layers: number[];
    _addedModels: any[];
    _batchGroupId: number;
    _batchGroup: any;
    _offsetReadAt: number;
    _maskOffset: number;
    _maskedBy: any;
    /**
     * @type {ElementComponentData}
     * @ignore
     */
    get data(): ElementComponentData;
    /**
     * @type {number}
     * @private
     */
    private get _absLeft();
    /**
     * @type {number}
     * @private
     */
    private get _absRight();
    /**
     * @type {number}
     * @private
     */
    private get _absTop();
    /**
     * @type {number}
     * @private
     */
    private get _absBottom();
    /**
     * @type {boolean}
     * @private
     */
    private get _hasSplitAnchorsX();
    /**
     * @type {boolean}
     * @private
     */
    private get _hasSplitAnchorsY();
    /**
     * Gets the world space axis-aligned bounding box for this element component.
     *
     * @type {BoundingBox | null}
     */
    get aabb(): BoundingBox | null;
    /**
     * Sets the anchor for this element component. Specifies where the left, bottom, right and top
     * edges of the component are anchored relative to its parent. Each value ranges from 0 to 1.
     * e.g. a value of `[0, 0, 0, 0]` means that the element will be anchored to the bottom left of
     * its parent. A value of `[1, 1, 1, 1]` means it will be anchored to the top right. A split
     * anchor is when the left-right or top-bottom pairs of the anchor are not equal. In that case,
     * the component will be resized to cover that entire area. For example, a value of `[0, 0, 1, 1]`
     * will make the component resize exactly as its parent.
     *
     * @example
     * this.entity.element.anchor = new pc.Vec4(Math.random() * 0.1, 0, 1, 0);
     * @example
     * this.entity.element.anchor = [Math.random() * 0.1, 0, 1, 0];
     *
     * @type {Vec4 | number[]}
     */
    set anchor(value: Vec4 | number[]);
    /**
     * Gets the anchor for this element component.
     *
     * @type {Vec4 | number[]}
     */
    get anchor(): Vec4 | number[];
    /**
     * Sets the batch group (see {@link BatchGroup}) for this element. Default is -1 (no group).
     *
     * @type {number}
     */
    set batchGroupId(value: number);
    /**
     * Gets the batch group (see {@link BatchGroup}) for this element.
     *
     * @type {number}
     */
    get batchGroupId(): number;
    /**
     * Sets the distance from the bottom edge of the anchor. Can be used in combination with a
     * split anchor to make the component's top edge always be 'top' units away from the top.
     *
     * @type {number}
     */
    set bottom(value: number);
    /**
     * Gets the distance from the bottom edge of the anchor.
     *
     * @type {number}
     */
    get bottom(): number;
    /**
     * Sets the width at which the element will be rendered. In most cases this will be the same as
     * {@link width}. However, in some cases the engine may calculate a different width for the
     * element, such as when the element is under the control of a {@link LayoutGroupComponent}. In
     * these scenarios, `calculatedWidth` may be smaller or larger than the width that was set in
     * the editor.
     *
     * @type {number}
     */
    set calculatedWidth(value: number);
    /**
     * Gets the width at which the element will be rendered.
     *
     * @type {number}
     */
    get calculatedWidth(): number;
    /**
     * Sets the height at which the element will be rendered. In most cases this will be the same
     * as {@link height}. However, in some cases the engine may calculate a different height for
     * the element, such as when the element is under the control of a {@link LayoutGroupComponent}.
     * In these scenarios, `calculatedHeight` may be smaller or larger than the height that was set
     * in the editor.
     *
     * @type {number}
     */
    set calculatedHeight(value: number);
    /**
     * Gets the height at which the element will be rendered.
     *
     * @type {number}
     */
    get calculatedHeight(): number;
    /**
     * Gets the array of 4 {@link Vec2}s that represent the bottom left, bottom right, top right
     * and top left corners of the component in canvas pixels. Only works for screen space element
     * components.
     *
     * @type {Vec2[]}
     */
    get canvasCorners(): Vec2[];
    /**
     * Sets the draw order of the component. A higher value means that the component will be
     * rendered on top of other components.
     *
     * @type {number}
     */
    set drawOrder(value: number);
    /**
     * Gets the draw order of the component.
     *
     * @type {number}
     */
    get drawOrder(): number;
    /**
     * Sets the height of the element as set in the editor. Note that in some cases this may not
     * reflect the true height at which the element is rendered, such as when the element is under
     * the control of a {@link LayoutGroupComponent}. See {@link calculatedHeight} in order to
     * ensure you are reading the true height at which the element will be rendered.
     *
     * @type {number}
     */
    set height(value: number);
    /**
     * Gets the height of the element.
     *
     * @type {number}
     */
    get height(): number;
    /**
     * Sets the array of layer IDs ({@link Layer#id}) to which this element should belong. Don't
     * push, pop, splice or modify this array. If you want to change it, set a new one instead.
     *
     * @type {number[]}
     */
    set layers(value: number[]);
    /**
     * Gets the array of layer IDs ({@link Layer#id}) to which this element belongs.
     *
     * @type {number[]}
     */
    get layers(): number[];
    /**
     * Sets the distance from the left edge of the anchor. Can be used in combination with a split
     * anchor to make the component's left edge always be 'left' units away from the left.
     *
     * @type {number}
     */
    set left(value: number);
    /**
     * Gets the distance from the left edge of the anchor.
     *
     * @type {number}
     */
    get left(): number;
    /**
     * Sets the distance from the left, bottom, right and top edges of the anchor. For example, if
     * we are using a split anchor like `[0, 0, 1, 1]` and the margin is `[0, 0, 0, 0]` then the
     * component will be the same width and height as its parent.
     *
     * @type {Vec4}
     */
    set margin(value: Vec4);
    /**
     * Gets the distance from the left, bottom, right and top edges of the anchor.
     *
     * @type {Vec4}
     */
    get margin(): Vec4;
    /**
     * Gets the entity that is currently masking this element.
     *
     * @type {Entity}
     * @private
     */
    private get maskedBy();
    /**
     * Sets the position of the pivot of the component relative to its anchor. Each value ranges
     * from 0 to 1 where `[0, 0]` is the bottom left and `[1, 1]` is the top right.
     *
     * @example
     * this.entity.element.pivot = [Math.random() * 0.1, Math.random() * 0.1];
     * @example
     * this.entity.element.pivot = new pc.Vec2(Math.random() * 0.1, Math.random() * 0.1);
     *
     * @type {Vec2 | number[]}
     */
    set pivot(value: Vec2 | number[]);
    /**
     * Gets the position of the pivot of the component relative to its anchor.
     *
     * @type {Vec2 | number[]}
     */
    get pivot(): Vec2 | number[];
    /**
     * Sets the distance from the right edge of the anchor. Can be used in combination with a split
     * anchor to make the component's right edge always be 'right' units away from the right.
     *
     * @type {number}
     */
    set right(value: number);
    /**
     * Gets the distance from the right edge of the anchor.
     *
     * @type {number}
     */
    get right(): number;
    /**
     * Gets the array of 4 {@link Vec3}s that represent the bottom left, bottom right, top right
     * and top left corners of the component relative to its parent {@link ScreenComponent}.
     *
     * @type {Vec3[]}
     */
    get screenCorners(): Vec3[];
    /**
     * Gets the width of the text rendered by the component. Only works for
     * {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {number}
     */
    get textWidth(): number;
    /**
     * Gets the height of the text rendered by the component. Only works for
     * {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {number}
     */
    get textHeight(): number;
    /**
     * Sets the distance from the top edge of the anchor. Can be used in combination with a split
     * anchor to make the component's bottom edge always be 'bottom' units away from the bottom.
     *
     * @type {number}
     */
    set top(value: number);
    /**
     * Gets the distance from the top edge of the anchor.
     *
     * @type {number}
     */
    get top(): number;
    /**
     * Sets the type of the ElementComponent. Can be:
     *
     * - {@link ELEMENTTYPE_GROUP}: The component can be used as a layout mechanism to create
     * groups of ElementComponents e.g. panels.
     * - {@link ELEMENTTYPE_IMAGE}: The component will render an image
     * - {@link ELEMENTTYPE_TEXT}: The component will render text
     *
     * @type {string}
     */
    set type(value: string);
    /**
     * Gets the type of the ElementComponent.
     *
     * @type {string}
     */
    get type(): string;
    /**
     * Sets whether the component will receive mouse and touch input events.
     *
     * @type {boolean}
     */
    set useInput(value: boolean);
    /**
     * Gets whether the component will receive mouse and touch input events.
     *
     * @type {boolean}
     */
    get useInput(): boolean;
    /**
     * Sets the fit mode of the element. Controls how the content should be fitted and preserve the
     * aspect ratio of the source texture or sprite. Only works for {@link ELEMENTTYPE_IMAGE}
     * types. Can be:
     *
     * - {@link FITMODE_STRETCH}: Fit the content exactly to Element's bounding box.
     * - {@link FITMODE_CONTAIN}: Fit the content within the Element's bounding box while
     * preserving its Aspect Ratio.
     * - {@link FITMODE_COVER}: Fit the content to cover the entire Element's bounding box while
     * preserving its Aspect Ratio.
     *
     * @type {string}
     */
    set fitMode(value: string);
    /**
     * Gets the fit mode of the element.
     *
     * @type {string}
     */
    get fitMode(): string;
    /**
     * Sets the width of the element as set in the editor. Note that in some cases this may not
     * reflect the true width at which the element is rendered, such as when the element is under
     * the control of a {@link LayoutGroupComponent}. See {@link calculatedWidth} in order to
     * ensure you are reading the true width at which the element will be rendered.
     *
     * @type {number}
     */
    set width(value: number);
    /**
     * Gets the width of the element.
     *
     * @type {number}
     */
    get width(): number;
    /**
     * Gets the array of 4 {@link Vec3}s that represent the bottom left, bottom right, top right
     * and top left corners of the component in world space. Only works for 3D element components.
     *
     * @type {Vec3[]}
     */
    get worldCorners(): Vec3[];
    /**
     * Sets the size of the font. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {number}
     */
    set fontSize(arg: number);
    /**
     * Gets the size of the font.
     *
     * @type {number}
     */
    get fontSize(): number;
    /**
     * Sets the minimum size that the font can scale to when {@link autoFitWidth} or
     * {@link autoFitHeight} are true.
     *
     * @type {number}
     */
    set minFontSize(arg: number);
    /**
     * Gets the minimum size that the font can scale to when {@link autoFitWidth} or
     * {@link autoFitHeight} are true.
     *
     * @type {number}
     */
    get minFontSize(): number;
    /**
     * Sets the maximum size that the font can scale to when {@link autoFitWidth} or
     * {@link autoFitHeight} are true.
     *
     * @type {number}
     */
    set maxFontSize(arg: number);
    /**
     * Gets the maximum size that the font can scale to when {@link autoFitWidth} or
     * {@link autoFitHeight} are true.
     *
     * @type {number}
     */
    get maxFontSize(): number;
    /**
     * Sets the maximum number of lines that the Element can wrap to. Any leftover text will be
     * appended to the last line. Set this to null to allow unlimited lines.
     *
     * @type {number|null}
     */
    set maxLines(arg: number | null);
    /**
     * Gets the maximum number of lines that the Element can wrap to. Returns null for unlimited
     * lines.
     *
     * @type {number|null}
     */
    get maxLines(): number | null;
    /**
     * Sets whether the font size and line height will scale so that the text fits inside the width
     * of the Element. The font size will be scaled between {@link minFontSize} and
     * {@link maxFontSize}. The value of {@link autoFitWidth} will be ignored if {@link autoWidth}
     * is true.
     *
     * @type {boolean}
     */
    set autoFitWidth(arg: boolean);
    /**
     * Gets whether the font size and line height will scale so that the text fits inside the width
     * of the Element.
     *
     * @type {boolean}
     */
    get autoFitWidth(): boolean;
    /**
     * Sets whether the font size and line height will scale so that the text fits inside the
     * height of the Element. The font size will be scaled between {@link minFontSize} and
     * {@link maxFontSize}. The value of {@link autoFitHeight} will be ignored if
     * {@link autoHeight} is true.
     *
     * @type {boolean}
     */
    set autoFitHeight(arg: boolean);
    /**
     * Gets whether the font size and line height will scale so that the text fits inside the
     * height of the Element.
     *
     * @type {boolean}
     */
    get autoFitHeight(): boolean;
    /**
     * Sets the color of the image for {@link ELEMENTTYPE_IMAGE} types or the color of the text for
     * {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {Color}
     */
    set color(arg: Color);
    /**
     * Gets the color of the element.
     *
     * @type {Color}
     */
    get color(): Color;
    /**
     * Sets the font used for rendering the text. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {Font|CanvasFont}
     */
    set font(arg: Font | CanvasFont);
    /**
     * Gets the font used for rendering the text.
     *
     * @type {Font|CanvasFont}
     */
    get font(): Font | CanvasFont;
    /**
     * Sets the id of the font asset used for rendering the text. Only works for {@link ELEMENTTYPE_TEXT}
     * types.
     *
     * @type {number}
     */
    set fontAsset(arg: number);
    /**
     * Gets the id of the font asset used for rendering the text.
     *
     * @type {number}
     */
    get fontAsset(): number;
    /**
     * Sets the spacing between the letters of the text. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {number}
     */
    set spacing(arg: number);
    /**
     * Gets the spacing between the letters of the text.
     *
     * @type {number}
     */
    get spacing(): number;
    /**
     * Sets the height of each line of text. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {number}
     */
    set lineHeight(arg: number);
    /**
     * Gets the height of each line of text.
     *
     * @type {number}
     */
    get lineHeight(): number;
    /**
     * Sets whether to automatically wrap lines based on the element width. Only works for
     * {@link ELEMENTTYPE_TEXT} types, and when {@link autoWidth} is set to false.
     *
     * @type {boolean}
     */
    set wrapLines(arg: boolean);
    /**
     * Gets whether to automatically wrap lines based on the element width.
     *
     * @type {boolean}
     */
    get wrapLines(): boolean;
    set lines(arg: any[]);
    get lines(): any[];
    /**
     * Sets the horizontal and vertical alignment of the text. Values range from 0 to 1 where
     * `[0, 0]` is the bottom left and `[1, 1]` is the top right.  Only works for
     * {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {Vec2}
     */
    set alignment(arg: Vec2);
    /**
     * Gets the horizontal and vertical alignment of the text.
     *
     * @type {Vec2}
     */
    get alignment(): Vec2;
    /**
     * Sets whether to automatically set the width of the component to be the same as the
     * {@link textWidth}. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {boolean}
     */
    set autoWidth(arg: boolean);
    /**
     * Gets whether to automatically set the width of the component to be the same as the
     * {@link textWidth}.
     *
     * @type {boolean}
     */
    get autoWidth(): boolean;
    /**
     * Sets whether to automatically set the height of the component to be the same as the
     * {@link textHeight}. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {boolean}
     */
    set autoHeight(arg: boolean);
    /**
     * Gets whether to automatically set the height of the component to be the same as the
     * {@link textHeight}.
     *
     * @type {boolean}
     */
    get autoHeight(): boolean;
    /**
     * Sets whether to reorder the text for RTL languages. The reordering uses a function
     * registered by `app.systems.element.registerUnicodeConverter`.
     *
     * @type {boolean}
     */
    set rtlReorder(arg: boolean);
    /**
     * Gets whether to reorder the text for RTL languages.
     *
     * @type {boolean}
     */
    get rtlReorder(): boolean;
    /**
     * Sets whether to convert unicode characters. This uses a function registered by
     * `app.systems.element.registerUnicodeConverter`.
     *
     * @type {boolean}
     */
    set unicodeConverter(arg: boolean);
    /**
     * Gets whether to convert unicode characters.
     *
     * @type {boolean}
     */
    get unicodeConverter(): boolean;
    /**
     * Sets the text to render. Only works for {@link ELEMENTTYPE_TEXT} types. To override certain
     * text styling properties on a per-character basis, the text can optionally include markup
     * tags contained within square brackets. Supported tags are:
     *
     * 1. `color` - override the element's {@link color} property. Examples:
     *     - `[color="#ff0000"]red text[/color]`
     *     - `[color="#00ff00"]green text[/color]`
     *     - `[color="#0000ff"]blue text[/color]`
     * 2. `outline` - override the element's {@link outlineColor} and {@link outlineThickness}
     * properties. Example:
     *     - `[outline color="#ffffff" thickness="0.5"]text[/outline]`
     * 3. `shadow` - override the element's {@link shadowColor} and {@link shadowOffset}
     * properties. Examples:
     *     - `[shadow color="#ffffff" offset="0.5"]text[/shadow]`
     *     - `[shadow color="#000000" offsetX="0.1" offsetY="0.2"]text[/shadow]`
     *
     * Note that markup tags are only processed if the text element's {@link enableMarkup} property
     * is set to true.
     *
     * @type {string}
     */
    set text(arg: string);
    /**
     * Gets the text to render.
     *
     * @type {string}
     */
    get text(): string;
    /**
     * Sets the localization key to use to get the localized text from {@link Application#i18n}.
     * Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {string}
     */
    set key(arg: string);
    /**
     * Gets the localization key to use to get the localized text from {@link Application#i18n}.
     *
     * @type {string}
     */
    get key(): string;
    /**
     * Sets the texture to render. Only works for {@link ELEMENTTYPE_IMAGE} types.
     *
     * @type {Texture}
     */
    set texture(arg: Texture);
    /**
     * Gets the texture to render.
     *
     * @type {Texture}
     */
    get texture(): Texture;
    /**
     * Sets the id of the texture asset to render. Only works for {@link ELEMENTTYPE_IMAGE} types.
     *
     * @type {number}
     */
    set textureAsset(arg: number);
    /**
     * Gets the id of the texture asset to render.
     *
     * @type {number}
     */
    get textureAsset(): number;
    /**
     * Sets the material to use when rendering an image. Only works for {@link ELEMENTTYPE_IMAGE} types.
     *
     * @type {Material}
     */
    set material(arg: Material);
    /**
     * Gets the material to use when rendering an image.
     *
     * @type {Material}
     */
    get material(): Material;
    /**
     * Sets the id of the material asset to use when rendering an image. Only works for
     * {@link ELEMENTTYPE_IMAGE} types.
     *
     * @type {number}
     */
    set materialAsset(arg: number);
    /**
     * Gets the id of the material asset to use when rendering an image.
     *
     * @type {number}
     */
    get materialAsset(): number;
    /**
     * Sets the sprite to render. Only works for {@link ELEMENTTYPE_IMAGE} types which can render
     * either a texture or a sprite.
     *
     * @type {Sprite}
     */
    set sprite(arg: Sprite);
    /**
     * Gets the sprite to render.
     *
     * @type {Sprite}
     */
    get sprite(): Sprite;
    /**
     * Sets the id of the sprite asset to render. Only works for {@link ELEMENTTYPE_IMAGE} types which
     * can render either a texture or a sprite.
     *
     * @type {number}
     */
    set spriteAsset(arg: number);
    /**
     * Gets the id of the sprite asset to render.
     *
     * @type {number}
     */
    get spriteAsset(): number;
    /**
     * Sets the frame of the sprite to render. Only works for {@link ELEMENTTYPE_IMAGE} types who have a
     * sprite assigned.
     *
     * @type {number}
     */
    set spriteFrame(arg: number);
    /**
     * Gets the frame of the sprite to render.
     *
     * @type {number}
     */
    get spriteFrame(): number;
    /**
     * Sets the number of pixels that map to one PlayCanvas unit. Only works for
     * {@link ELEMENTTYPE_IMAGE} types who have a sliced sprite assigned.
     *
     * @type {number}
     */
    set pixelsPerUnit(arg: number);
    /**
     * Gets the number of pixels that map to one PlayCanvas unit.
     *
     * @type {number}
     */
    get pixelsPerUnit(): number;
    /**
     * Sets the opacity of the element. This works for both {@link ELEMENTTYPE_IMAGE} and
     * {@link ELEMENTTYPE_TEXT} element types.
     *
     * @type {number}
     */
    set opacity(arg: number);
    /**
     * Gets the opacity of the element.
     *
     * @type {number}
     */
    get opacity(): number;
    /**
     * Sets the region of the texture to use in order to render an image. Values range from 0 to 1
     * and indicate u, v, width, height. Only works for {@link ELEMENTTYPE_IMAGE} types.
     *
     * @type {Vec4}
     */
    set rect(arg: Vec4);
    /**
     * Gets the region of the texture to use in order to render an image.
     *
     * @type {Vec4}
     */
    get rect(): Vec4;
    /**
     * Sets whether the Image Element should be treated as a mask. Masks do not render into the
     * scene, but instead limit child elements to only be rendered where this element is rendered.
     *
     * @type {boolean}
     */
    set mask(arg: boolean);
    /**
     * Gets whether the Image Element should be treated as a mask.
     *
     * @type {boolean}
     */
    get mask(): boolean;
    /**
     * Sets the text outline effect color and opacity. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {Color}
     */
    set outlineColor(arg: Color);
    /**
     * Gets the text outline effect color and opacity.
     *
     * @type {Color}
     */
    get outlineColor(): Color;
    /**
     * Sets the width of the text outline effect. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {number}
     */
    set outlineThickness(arg: number);
    /**
     * Gets the width of the text outline effect.
     *
     * @type {number}
     */
    get outlineThickness(): number;
    /**
     * Sets the text shadow effect color and opacity. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {Color}
     */
    set shadowColor(arg: Color);
    /**
     * Gets the text shadow effect color and opacity.
     *
     * @type {Color}
     */
    get shadowColor(): Color;
    /**
     * Sets the text shadow effect shift amount from original text. Only works for
     * {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {number}
     */
    set shadowOffset(arg: number);
    /**
     * Gets the text shadow effect shift amount from original text.
     *
     * @type {number}
     */
    get shadowOffset(): number;
    /**
     * Sets whether markup processing is enabled for this element. Only works for
     * {@link ELEMENTTYPE_TEXT} types. Defaults to false.
     *
     * @type {boolean}
     */
    set enableMarkup(arg: boolean);
    /**
     * Gets whether markup processing is enabled for this element.
     *
     * @type {boolean}
     */
    get enableMarkup(): boolean;
    /**
     * Sets the index of the first character to render. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {number}
     */
    set rangeStart(arg: number);
    /**
     * Gets the index of the first character to render.
     *
     * @type {number}
     */
    get rangeStart(): number;
    /**
     * Sets the index of the last character to render. Only works for {@link ELEMENTTYPE_TEXT} types.
     *
     * @type {number}
     */
    set rangeEnd(arg: number);
    /**
     * Gets the index of the last character to render.
     *
     * @type {number}
     */
    get rangeEnd(): number;
    /** @ignore */
    _setValue(name: any, value: any): void;
    _patch(): void;
    _unpatch(): void;
    /**
     * Patched method for setting the position.
     *
     * @param {number|Vec3} x - The x coordinate or Vec3
     * @param {number} [y] - The y coordinate
     * @param {number} [z] - The z coordinate
     * @private
     */
    private _setPosition;
    /**
     * Patched method for setting the local position.
     *
     * @param {number|Vec3} x - The x coordinate or Vec3
     * @param {number} [y] - The y coordinate
     * @param {number} [z] - The z coordinate
     * @private
     */
    private _setLocalPosition;
    _sync(): void;
    _dirtyLocal: boolean;
    _dirtyWorld: boolean;
    _onInsert(parent: any): void;
    _dirtifyMask(): void;
    _onPrerender(): void;
    _bindScreen(screen: any): void;
    _unbindScreen(screen: any): void;
    _updateScreen(screen: any): void;
    syncMask(depth: any): void;
    _setMaskedBy(mask: any): void;
    _updateMask(currentMask: any, depth: any): void;
    _parseUpToScreen(): {
        screen: any;
        mask: any;
    };
    _onScreenResize(res: any): void;
    _onScreenSpaceChange(): void;
    _onScreenRemove(): void;
    _calculateLocalAnchors(): void;
    getOffsetPosition(x: any, y: any): Vec3;
    onLayersChanged(oldComp: any, newComp: any): void;
    onLayerAdded(layer: any): void;
    onLayerRemoved(layer: any): void;
    onRemove(): void;
    /**
     * Recalculates these properties:
     *   - `_localAnchor`
     *   - `width`
     *   - `height`
     *   - Local position is updated if anchors are split
     *
     * Assumes these properties are up to date:
     *   - `_margin`
     *
     * @param {boolean} propagateCalculatedWidth - If true, call `_setWidth` instead
     * of `_setCalculatedWidth`
     * @param {boolean} propagateCalculatedHeight - If true, call `_setHeight` instead
     * of `_setCalculatedHeight`
     * @private
     */
    private _calculateSize;
    _sizeDirty: boolean;
    /**
     * Internal set width without updating margin.
     *
     * @param {number} w - The new width.
     * @private
     */
    private _setWidth;
    /**
     * Internal set height without updating margin.
     *
     * @param {number} h - The new height.
     * @private
     */
    private _setHeight;
    /**
     * This method sets the calculated width value and optionally updates the margins.
     *
     * @param {number} value - The new calculated width.
     * @param {boolean} updateMargins - Update margins or not.
     * @private
     */
    private _setCalculatedWidth;
    /**
     * This method sets the calculated height value and optionally updates the margins.
     *
     * @param {number} value - The new calculated height.
     * @param {boolean} updateMargins - Update margins or not.
     * @private
     */
    private _setCalculatedHeight;
    _flagChildrenAsDirty(): void;
    addModelToLayers(model: any): void;
    removeModelFromLayers(model: any): void;
    getMaskOffset(): number;
    isVisibleForCamera(camera: any): boolean;
    _isScreenSpace(): boolean;
    _isScreenCulled(): boolean;
    _dirtyBatch(): void;
}
import { Component } from '../component.js';
import { Vec4 } from '../../../core/math/vec4.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { Mat4 } from '../../../core/math/mat4.js';
import { Vec3 } from '../../../core/math/vec3.js';
import { Entity } from '../../entity.js';
import { ImageElement } from './image-element.js';
import { TextElement } from './text-element.js';
import type { ElementComponentData } from './data.js';
import type { BoundingBox } from '../../../core/shape/bounding-box.js';
import type { Color } from '../../../core/math/color.js';
import type { Font } from '../../../framework/font/font.js';
import type { CanvasFont } from '../../../framework/font/canvas-font.js';
import type { Texture } from '../../../platform/graphics/texture.js';
import type { Material } from '../../../scene/materials/material.js';
import type { Sprite } from '../../../scene/sprite.js';
import type { ElementComponentSystem } from './system.js';
