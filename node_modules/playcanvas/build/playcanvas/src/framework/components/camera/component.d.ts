/**
 * Callback used by {@link CameraComponent#calculateTransform} and {@link CameraComponent#calculateProjection}.
 */
export type CalculateMatrixCallback = (transformMatrix: Mat4, view: number) => void;
/**
 * @import { CameraComponentSystem } from './system.js'
 * @import { Color } from '../../../core/math/color.js'
 * @import { Entity } from '../../entity.js'
 * @import { EventHandle } from '../../../core/event-handle.js'
 * @import { Frustum } from '../../../core/shape/frustum.js'
 * @import { LayerComposition } from '../../../scene/composition/layer-composition.js'
 * @import { Layer } from '../../../scene/layer.js'
 * @import { Mat4 } from '../../../core/math/mat4.js'
 * @import { RenderPass } from '../../../platform/graphics/render-pass.js'
 * @import { RenderTarget } from '../../../platform/graphics/render-target.js'
 * @import { FogParams } from '../../../scene/fog-params.js'
 * @import { Vec3 } from '../../../core/math/vec3.js'
 * @import { Vec4 } from '../../../core/math/vec4.js'
 * @import { XrErrorCallback } from '../../xr/xr-manager.js'
 */
/**
 * @callback CalculateMatrixCallback
 * Callback used by {@link CameraComponent#calculateTransform} and {@link CameraComponent#calculateProjection}.
 * @param {Mat4} transformMatrix - Output of the function.
 * @param {number} view - Type of view. Can be {@link VIEW_CENTER}, {@link VIEW_LEFT} or
 * {@link VIEW_RIGHT}. Left and right are only used in stereo rendering.
 * @returns {void}
 */
/**
 * The CameraComponent enables an {@link Entity} to render the scene. A scene requires at least
 * one enabled camera component to be rendered. The camera's view direction is along the negative
 * z-axis of the owner entity.
 *
 * Note that multiple camera components can be enabled simultaneously (for split-screen or
 * offscreen rendering, for example).
 *
 * You should never need to use the CameraComponent constructor directly. To add a CameraComponent
 * to an {@link Entity}, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = new pc.Entity();
 * entity.addComponent('camera', {
 *     nearClip: 1,
 *     farClip: 100,
 *     fov: 55
 * });
 * ```
 *
 * Once the CameraComponent is added to the entity, you can access it via the {@link Entity#camera}
 * property:
 *
 * ```javascript
 * entity.camera.nearClip = 2; // Set the near clip of the camera
 *
 * console.log(entity.camera.nearClip); // Get the near clip of the camera
 * ```
 *
 * @hideconstructor
 * @category Graphics
 */
export class CameraComponent extends Component {
    /**
     * Create a new CameraComponent instance.
     *
     * @param {CameraComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: CameraComponentSystem, entity: Entity);
    /**
     * Custom function that is called when postprocessing should execute.
     *
     * @type {Function|null}
     * @ignore
     */
    onPostprocessing: Function | null;
    /**
     * A counter of requests of depth map rendering.
     *
     * @type {number}
     * @private
     */
    private _renderSceneDepthMap;
    /**
     * A counter of requests of color map rendering.
     *
     * @type {number}
     * @private
     */
    private _renderSceneColorMap;
    /** @private */
    private _sceneDepthMapRequested;
    /** @private */
    private _sceneColorMapRequested;
    /** @private */
    private _priority;
    /**
     * Layer id at which the postprocessing stops for the camera.
     *
     * @type {number}
     * @private
     */
    private _disablePostEffectsLayer;
    /** @private */
    private _camera;
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
    _postEffects: PostEffectQueue;
    /**
     * Sets the name of the shader pass the camera will use when rendering.
     *
     * In addition to existing names (see the parameter description), a new name can be specified,
     * which creates a new shader pass with the given name. The name provided can only use
     * alphanumeric characters and underscores. When a shader is compiled for the new pass, a define
     * is added to the shader. For example, if the name is 'custom_rendering', the define
     * 'CUSTOM_RENDERING_PASS' is added to the shader, allowing the shader code to conditionally
     * execute code only when that shader pass is active.
     *
     * Another instance where this approach may prove useful is when a camera needs to render a more
     * cost-effective version of shaders, such as when creating a reflection texture. To accomplish
     * this, a callback on the material that triggers during shader compilation can be used. This
     * callback can modify the shader generation options specifically for this shader pass.
     *
     * ```javascript
     * const shaderPassId = camera.setShaderPass('custom_rendering');
     *
     * material.onUpdateShader = function (options) {
     *     if (options.pass === shaderPassId) {
     *         options.litOptions.normalMapEnabled = false;
     *         options.litOptions.useSpecular = false;
     *     }
     *     return options;
     * };
     * ```
     *
     * @param {string} name - The name of the shader pass. Defaults to undefined, which is
     * equivalent to {@link SHADERPASS_FORWARD}. Can be:
     *
     * - {@link SHADERPASS_FORWARD}
     * - {@link SHADERPASS_ALBEDO}
     * - {@link SHADERPASS_OPACITY}
     * - {@link SHADERPASS_WORLDNORMAL}
     * - {@link SHADERPASS_SPECULARITY}
     * - {@link SHADERPASS_GLOSS}
     * - {@link SHADERPASS_METALNESS}
     * - {@link SHADERPASS_AO}
     * - {@link SHADERPASS_EMISSION}
     * - {@link SHADERPASS_LIGHTING}
     * - {@link SHADERPASS_UV0}
     *
     * @returns {number} The id of the shader pass.
     */
    setShaderPass(name: string): number;
    /**
     * Shader pass name.
     *
     * @returns {string|undefined} The name of the shader pass, or undefined if no shader pass is set.
     */
    getShaderPass(): string | undefined;
    /**
     * Sets the render passes the camera uses for rendering, instead of its default rendering.
     * Set this to null to return to the default behavior.
     *
     * @type {RenderPass[]|null}
     * @ignore
     */
    set renderPasses(passes: RenderPass[]);
    /**
     * Gets the render passes the camera uses for rendering, instead of its default rendering.
     *
     * @type {RenderPass[]}
     * @ignore
     */
    get renderPasses(): RenderPass[];
    get shaderParams(): import("../../../scene/camera-shader-params.js").CameraShaderParams;
    /**
     * Sets the gamma correction to apply when rendering the scene. Can be:
     *
     * - {@link GAMMA_NONE}
     * - {@link GAMMA_SRGB}
     *
     * Defaults to {@link GAMMA_SRGB}.
     *
     * @type {number}
     */
    set gammaCorrection(value: number);
    /**
     * Gets the gamma correction used when rendering the scene.
     *
     * @type {number}
     */
    get gammaCorrection(): number;
    /**
     * Sets the tonemapping transform to apply to the rendered color buffer. Can be:
     *
     * - {@link TONEMAP_LINEAR}
     * - {@link TONEMAP_FILMIC}
     * - {@link TONEMAP_HEJL}
     * - {@link TONEMAP_ACES}
     * - {@link TONEMAP_ACES2}
     * - {@link TONEMAP_NEUTRAL}
     *
     * Defaults to {@link TONEMAP_LINEAR}.
     *
     * @type {number}
     */
    set toneMapping(value: number);
    /**
     * Gets the tonemapping transform applied to the rendered color buffer.
     *
     * @type {number}
     */
    get toneMapping(): number;
    /**
     * Sets the fog parameters. If this is not null, the camera will use these fog parameters
     * instead of those specified on the {@link Scene#fog}.
     *
     * @type {FogParams|null}
     */
    set fog(value: FogParams | null);
    /**
     * Gets a {@link FogParams} that defines fog parameters, or null if those are not set.
     *
     * @type {FogParams|null}
     */
    get fog(): FogParams | null;
    /**
     * Sets the camera aperture in f-stops. Default is 16. Higher value means less exposure. Used
     * if {@link Scene#physicalUnits} is true.
     *
     * @type {number}
     */
    set aperture(value: number);
    /**
     * Gets the camera aperture in f-stops.
     *
     * @type {number}
     */
    get aperture(): number;
    /**
     * Sets the aspect ratio (width divided by height) of the camera. If {@link aspectRatioMode} is
     * {@link ASPECT_AUTO}, then this value will be automatically calculated every frame, and you
     * can only read it. If it's {@link ASPECT_MANUAL}, you can set the value.
     *
     * @type {number}
     */
    set aspectRatio(value: number);
    /**
     * Gets the aspect ratio (width divided by height) of the camera.
     *
     * @type {number}
     */
    get aspectRatio(): number;
    /**
     * Sets the aspect ratio mode of the camera. Can be:
     *
     * - {@link ASPECT_AUTO}: aspect ratio will be calculated from the current render
     * target's width divided by height.
     * - {@link ASPECT_MANUAL}: use the aspectRatio value.
     *
     * Defaults to {@link ASPECT_AUTO}.
     *
     * @type {number}
     */
    set aspectRatioMode(value: number);
    /**
     * Gets the aspect ratio mode of the camera.
     *
     * @type {number}
     */
    get aspectRatioMode(): number;
    /**
     * Sets the custom function to calculate the camera projection matrix manually. Can be used for
     * complex effects like doing oblique projection. Function is called using component's scope.
     *
     * Arguments:
     *
     * - {@link Mat4} transformMatrix: output of the function
     * - view: Type of view. Can be {@link VIEW_CENTER}, {@link VIEW_LEFT} or {@link VIEW_RIGHT}.
     *
     * Left and right are only used in stereo rendering.
     *
     * @type {CalculateMatrixCallback}
     */
    set calculateProjection(value: CalculateMatrixCallback);
    /**
     * Gets the custom function to calculate the camera projection matrix manually.
     *
     * @type {CalculateMatrixCallback}
     */
    get calculateProjection(): CalculateMatrixCallback;
    /**
     * Sets the custom function to calculate the camera transformation matrix manually. Can be used
     * for complex effects like reflections. Function is called using component's scope. Arguments:
     *
     * - {@link Mat4} transformMatrix: output of the function.
     * - view: Type of view. Can be {@link VIEW_CENTER}, {@link VIEW_LEFT} or {@link VIEW_RIGHT}.
     *
     * Left and right are only used in stereo rendering.
     *
     * @type {CalculateMatrixCallback}
     */
    set calculateTransform(value: CalculateMatrixCallback);
    /**
     * Gets the custom function to calculate the camera transformation matrix manually.
     *
     * @type {CalculateMatrixCallback}
     */
    get calculateTransform(): CalculateMatrixCallback;
    /**
     * Gets the camera component's underlying Camera instance.
     *
     * @type {Camera}
     * @ignore
     */
    get camera(): Camera;
    /**
     * Sets the camera component's clear color. Defaults to `[0.75, 0.75, 0.75, 1]`.
     *
     * @type {Color}
     */
    set clearColor(value: Color);
    /**
     * Gets the camera component's clear color.
     *
     * @type {Color}
     */
    get clearColor(): Color;
    /**
     * Sets whether the camera will automatically clear the color buffer before rendering. Defaults to true.
     *
     * @type {boolean}
     */
    set clearColorBuffer(value: boolean);
    /**
     * Gets whether the camera will automatically clear the color buffer before rendering.
     *
     * @type {boolean}
     */
    get clearColorBuffer(): boolean;
    /**
     * Sets the depth value to clear the depth buffer to. Defaults to 1.
     *
     * @type {number}
     */
    set clearDepth(value: number);
    /**
     * Gets the depth value to clear the depth buffer to.
     *
     * @type {number}
     */
    get clearDepth(): number;
    /**
     * Sets whether the camera will automatically clear the depth buffer before rendering. Defaults to true.
     *
     * @type {boolean}
     */
    set clearDepthBuffer(value: boolean);
    /**
     * Gets whether the camera will automatically clear the depth buffer before rendering.
     *
     * @type {boolean}
     */
    get clearDepthBuffer(): boolean;
    /**
     * Sets whether the camera will automatically clear the stencil buffer before rendering. Defaults to true.
     *
     * @type {boolean}
     */
    set clearStencilBuffer(value: boolean);
    /**
     * Gets whether the camera will automatically clear the stencil buffer before rendering.
     *
     * @type {boolean}
     */
    get clearStencilBuffer(): boolean;
    /**
     * Sets whether the camera will cull triangle faces. If true, the camera will take
     * {@link Material#cull} into account. Otherwise both front and back faces will be rendered.
     * Defaults to true.
     *
     * @type {boolean}
     */
    set cullFaces(value: boolean);
    /**
     * Gets whether the camera will cull triangle faces.
     *
     * @type {boolean}
     */
    get cullFaces(): boolean;
    /**
     * Sets the layer id of the layer on which the post-processing of the camera stops being applied
     * to. Defaults to {@link LAYERID_UI}, which causes post-processing to not be applied to UI
     * layer and any following layers for the camera. Set to `undefined` for post-processing to be
     * applied to all layers of the camera.
     *
     * @type {number}
     */
    set disablePostEffectsLayer(layer: number);
    /**
     * Gets the layer id of the layer on which the post-processing of the camera stops being applied
     * to.
     *
     * @type {number}
     */
    get disablePostEffectsLayer(): number;
    /**
     * Sets the distance from the camera after which no rendering will take place. Defaults to 1000.
     *
     * @type {number}
     */
    set farClip(value: number);
    /**
     * Gets the distance from the camera after which no rendering will take place.
     *
     * @type {number}
     */
    get farClip(): number;
    /**
     * Sets whether the camera will flip the face direction of triangles. If set to true, the
     * camera will invert front and back faces. Can be useful for reflection rendering. Defaults to
     * false.
     *
     * @type {boolean}
     */
    set flipFaces(value: boolean);
    /**
     * Gets whether the camera will flip the face direction of triangles.
     *
     * @type {boolean}
     */
    get flipFaces(): boolean;
    /**
     * Sets the field of view of the camera in degrees. Usually this is the Y-axis field of view
     * (see {@link horizontalFov}). Used for {@link PROJECTION_PERSPECTIVE} cameras only. Defaults to
     * 45.
     *
     * @type {number}
     */
    set fov(value: number);
    /**
     * Gets the field of view of the camera in degrees.
     *
     * @type {number}
     */
    get fov(): number;
    /**
     * Gets the camera's frustum shape.
     *
     * @type {Frustum}
     */
    get frustum(): Frustum;
    /**
     * Sets whether frustum culling is enabled. This controls the culling of {@link MeshInstance}s
     * against the camera frustum, i.e. if objects outside of the camera's frustum should be
     * omitted from rendering. If false, all mesh instances in the scene are rendered by the
     * camera, regardless of visibility. Defaults to false.
     *
     * @type {boolean}
     */
    set frustumCulling(value: boolean);
    /**
     * Gets whether frustum culling is enabled.
     *
     * @type {boolean}
     */
    get frustumCulling(): boolean;
    /**
     * Sets whether the camera's field of view ({@link fov}) is horizontal or vertical. Defaults to
     * false (meaning it is vertical by default).
     *
     * @type {boolean}
     */
    set horizontalFov(value: boolean);
    /**
     * Gets whether the camera's field of view ({@link fov}) is horizontal or vertical.
     *
     * @type {boolean}
     */
    get horizontalFov(): boolean;
    /**
     * Sets the array of layer IDs ({@link Layer#id}) to which this camera should belong. Don't
     * push, pop, splice or modify this array. If you want to change it, set a new one instead.
     * Defaults to [{@link LAYERID_WORLD}, {@link LAYERID_DEPTH}, {@link LAYERID_SKYBOX},
     * {@link LAYERID_UI}, {@link LAYERID_IMMEDIATE}].
     *
     * @type {number[]}
     */
    set layers(newValue: number[]);
    /**
     * Gets the array of layer IDs ({@link Layer#id}) to which this camera belongs.
     *
     * @type {number[]}
     */
    get layers(): number[];
    get layersSet(): Set<number>;
    /**
     * Sets the jitter intensity applied in the projection matrix. Used for jittered sampling by TAA.
     * A value of 1 represents a jitter in the range of `[-1, 1]` of a pixel. Smaller values result
     * in a crisper yet more aliased outcome, whereas increased values produce a smoother but blurred
     * result. Defaults to 0, representing no jitter.
     *
     * @type {number}
     */
    set jitter(value: number);
    /**
     * Gets the jitter intensity applied in the projection matrix.
     *
     * @type {number}
     */
    get jitter(): number;
    /**
     * Sets the distance from the camera before which no rendering will take place. Defaults to 0.1.
     *
     * @type {number}
     */
    set nearClip(value: number);
    /**
     * Gets the distance from the camera before which no rendering will take place.
     *
     * @type {number}
     */
    get nearClip(): number;
    /**
     * Sets the half-height of the orthographic view window (in the Y-axis). Used for
     * {@link PROJECTION_ORTHOGRAPHIC} cameras only. Defaults to 10.
     *
     * @type {number}
     */
    set orthoHeight(value: number);
    /**
     * Gets the half-height of the orthographic view window (in the Y-axis).
     *
     * @type {number}
     */
    get orthoHeight(): number;
    /**
     * Gets the post effects queue for this camera. Use this to add or remove post effects from the
     * camera.
     *
     * @type {PostEffectQueue}
     */
    get postEffects(): PostEffectQueue;
    get postEffectsEnabled(): boolean;
    /**
     * Sets the priority to control the render order of this camera. Cameras with a smaller
     * priority value are rendered first. Defaults to 0.
     *
     * @type {number}
     */
    set priority(newValue: number);
    /**
     * Gets the priority to control the render order of this camera.
     *
     * @type {number}
     */
    get priority(): number;
    /**
     * Sets the type of projection used to render the camera. Can be:
     *
     * - {@link PROJECTION_PERSPECTIVE}: A perspective projection. The camera frustum
     * resembles a truncated pyramid.
     * - {@link PROJECTION_ORTHOGRAPHIC}: An orthographic projection. The camera
     * frustum is a cuboid.
     *
     * Defaults to {@link PROJECTION_PERSPECTIVE}.
     *
     * @type {number}
     */
    set projection(value: number);
    /**
     * Gets the type of projection used to render the camera.
     *
     * @type {number}
     */
    get projection(): number;
    /**
     * Gets the camera's projection matrix.
     *
     * @type {Mat4}
     */
    get projectionMatrix(): Mat4;
    /**
     * Sets the rendering rectangle for the camera. This controls where on the screen the camera
     * will render in normalized screen coordinates. Defaults to `[0, 0, 1, 1]`.
     *
     * @type {Vec4}
     */
    set rect(value: Vec4);
    /**
     * Gets the rendering rectangle for the camera.
     *
     * @type {Vec4}
     */
    get rect(): Vec4;
    set renderSceneColorMap(value: boolean);
    get renderSceneColorMap(): boolean;
    set renderSceneDepthMap(value: boolean);
    get renderSceneDepthMap(): boolean;
    /**
     * Sets the render target to which rendering of the camera is performed. If not set, it will
     * render simply to the screen.
     *
     * @type {RenderTarget}
     */
    set renderTarget(value: RenderTarget);
    /**
     * Gets the render target to which rendering of the camera is performed.
     *
     * @type {RenderTarget}
     */
    get renderTarget(): RenderTarget;
    /**
     * Sets the scissor rectangle for the camera. This clips all pixels which are not in the
     * rectangle. The order of the values is `[x, y, width, height]`. Defaults to `[0, 0, 1, 1]`.
     *
     * @type {Vec4}
     */
    set scissorRect(value: Vec4);
    /**
     * Gets the scissor rectangle for the camera.
     *
     * @type {Vec4}
     */
    get scissorRect(): Vec4;
    /**
     * Sets the camera sensitivity in ISO. Defaults to 1000. Higher value means more exposure. Used
     * if {@link Scene#physicalUnits} is true.
     *
     * @type {number}
     */
    set sensitivity(value: number);
    /**
     * Gets the camera sensitivity in ISO.
     *
     * @type {number}
     */
    get sensitivity(): number;
    /**
     * Sets the camera shutter speed in seconds. Defaults to 1/1000s. Longer shutter means more
     * exposure. Used if {@link Scene#physicalUnits} is true.
     *
     * @type {number}
     */
    set shutter(value: number);
    /**
     * Gets the camera shutter speed in seconds.
     *
     * @type {number}
     */
    get shutter(): number;
    /**
     * Gets the camera's view matrix.
     *
     * @type {Mat4}
     */
    get viewMatrix(): Mat4;
    /**
     * Based on the value, the depth layer's enable counter is incremented or decremented.
     *
     * @param {boolean} value - True to increment the counter, false to decrement it.
     * @returns {boolean} True if the counter was incremented or decremented, false if the depth
     * layer is not present.
     * @private
     */
    private _enableDepthLayer;
    /**
     * Request the scene to generate a texture containing the scene color map. Note that this call
     * is accumulative, and for each enable request, a disable request need to be called. Note that
     * this setting is ignored when the {@link CameraComponent#renderPasses} is used.
     *
     * @param {boolean} enabled - True to request the generation, false to disable it.
     */
    requestSceneColorMap(enabled: boolean): void;
    /**
     * Request the scene to generate a texture containing the scene depth map. Note that this call
     * is accumulative, and for each enable request, a disable request need to be called. Note that
     * this setting is ignored when the {@link CameraComponent#renderPasses} is used.
     *
     * @param {boolean} enabled - True to request the generation, false to disable it.
     */
    requestSceneDepthMap(enabled: boolean): void;
    dirtyLayerCompositionCameras(): void;
    /**
     * Convert a point from 2D screen space to 3D world space.
     *
     * @param {number} screenx - X coordinate on PlayCanvas' canvas element. Should be in the range
     * 0 to `canvas.offsetWidth` of the application's canvas element.
     * @param {number} screeny - Y coordinate on PlayCanvas' canvas element. Should be in the range
     * 0 to `canvas.offsetHeight` of the application's canvas element.
     * @param {number} cameraz - The distance from the camera in world space to create the new
     * point.
     * @param {Vec3} [worldCoord] - 3D vector to receive world coordinate result.
     * @example
     * // Get the start and end points of a 3D ray fired from a screen click position
     * const start = entity.camera.screenToWorld(clickX, clickY, entity.camera.nearClip);
     * const end = entity.camera.screenToWorld(clickX, clickY, entity.camera.farClip);
     *
     * // Use the ray coordinates to perform a raycast
     * app.systems.rigidbody.raycastFirst(start, end, function (result) {
     *     console.log("Entity " + result.entity.name + " was selected");
     * });
     * @returns {Vec3} The world space coordinate.
     */
    screenToWorld(screenx: number, screeny: number, cameraz: number, worldCoord?: Vec3): Vec3;
    /**
     * Convert a point from 3D world space to 2D screen space.
     *
     * @param {Vec3} worldCoord - The world space coordinate.
     * @param {Vec3} [screenCoord] - 3D vector to receive screen coordinate result.
     * @returns {Vec3} The screen space coordinate.
     */
    worldToScreen(worldCoord: Vec3, screenCoord?: Vec3): Vec3;
    /**
     * Called before application renders the scene.
     *
     * @ignore
     */
    onAppPrerender(): void;
    /** @private */
    private addCameraToLayers;
    /** @private */
    private removeCameraFromLayers;
    /**
     * @param {LayerComposition} oldComp - Old layer composition.
     * @param {LayerComposition} newComp - New layer composition.
     * @private
     */
    private onLayersChanged;
    /**
     * @param {Layer} layer - The layer to add the camera to.
     * @private
     */
    private onLayerAdded;
    /**
     * @param {Layer} layer - The layer to remove the camera from.
     * @private
     */
    private onLayerRemoved;
    onRemove(): void;
    /**
     * Calculates aspect ratio value for a given render target.
     *
     * @param {RenderTarget|null} [rt] - Optional
     * render target. If unspecified, the backbuffer is used.
     * @returns {number} The aspect ratio of the render target (or backbuffer).
     */
    calculateAspectRatio(rt?: RenderTarget | null): number;
    /**
     * Prepare the camera for frame rendering.
     *
     * @param {RenderTarget|null} [rt] - Render
     * target to which rendering will be performed. Will affect camera's aspect ratio, if
     * aspectRatioMode is {@link ASPECT_AUTO}.
     * @ignore
     */
    frameUpdate(rt?: RenderTarget | null): void;
    /**
     * Attempt to start XR session with this camera.
     *
     * @param {string} type - The type of session. Can be one of the following:
     *
     * - {@link XRTYPE_INLINE}: Inline - always available type of session. It has limited feature
     * availability and is rendered into HTML element.
     * - {@link XRTYPE_VR}: Immersive VR - session that provides exclusive access to the VR device
     * with the best available tracking features.
     * - {@link XRTYPE_AR}: Immersive AR - session that provides exclusive access to the VR/AR
     * device that is intended to be blended with the real-world environment.
     *
     * @param {string} spaceType - Reference space type. Can be one of the following:
     *
     * - {@link XRSPACE_VIEWER}: Viewer - always supported space with some basic tracking
     * capabilities.
     * - {@link XRSPACE_LOCAL}: Local - represents a tracking space with a native origin near the
     * viewer at the time of creation. It is meant for seated or basic local XR sessions.
     * - {@link XRSPACE_LOCALFLOOR}: Local Floor - represents a tracking space with a native origin
     * at the floor in a safe position for the user to stand. The y-axis equals 0 at floor level.
     * Floor level value might be estimated by the underlying platform. It is meant for seated or
     * basic local XR sessions.
     * - {@link XRSPACE_BOUNDEDFLOOR}: Bounded Floor - represents a tracking space with its native
     * origin at the floor, where the user is expected to move within a pre-established boundary.
     * - {@link XRSPACE_UNBOUNDED}: Unbounded - represents a tracking space where the user is
     * expected to move freely around their environment, potentially long distances from their
     * starting point.
     *
     * @param {object} [options] - Object with options for XR session initialization.
     * @param {string[]} [options.optionalFeatures] - Optional features for XRSession start. It is
     * used for getting access to additional WebXR spec extensions.
     * @param {boolean} [options.imageTracking] - Set to true to attempt to enable {@link XrImageTracking}.
     * @param {boolean} [options.planeDetection] - Set to true to attempt to enable {@link XrPlaneDetection}.
     * @param {XrErrorCallback} [options.callback] - Optional callback function called once the
     * session is started. The callback has one argument Error - it is null if the XR session
     * started successfully.
     * @param {boolean} [options.anchors] - Optional boolean to attempt to enable {@link XrAnchors}.
     * @param {object} [options.depthSensing] - Optional object with parameters to attempt to enable
     * depth sensing.
     * @param {string} [options.depthSensing.usagePreference] - Optional usage preference for depth
     * sensing, can be 'cpu-optimized' or 'gpu-optimized' (XRDEPTHSENSINGUSAGE_*), defaults to
     * 'cpu-optimized'. Most preferred and supported will be chosen by the underlying depth sensing
     * system.
     * @param {string} [options.depthSensing.dataFormatPreference] - Optional data format
     * preference for depth sensing. Can be 'luminance-alpha' or 'float32' (XRDEPTHSENSINGFORMAT_*),
     * defaults to 'luminance-alpha'. Most preferred and supported will be chosen by the underlying
     * depth sensing system.
     * @example
     * // On an entity with a camera component
     * this.entity.camera.startXr(pc.XRTYPE_VR, pc.XRSPACE_LOCAL, {
     *     callback: (err) => {
     *         if (err) {
     *             // failed to start XR session
     *         } else {
     *             // in XR
     *         }
     *     }
     * });
     */
    startXr(type: string, spaceType: string, options?: {
        optionalFeatures?: string[];
        imageTracking?: boolean;
        planeDetection?: boolean;
        callback?: XrErrorCallback;
        anchors?: boolean;
        depthSensing?: {
            usagePreference?: string;
            dataFormatPreference?: string;
        };
    }): void;
    /**
     * Attempt to end XR session of this camera.
     *
     * @param {XrErrorCallback} [callback] - Optional callback function called once session is
     * ended. The callback has one argument Error - it is null if successfully ended XR session.
     * @example
     * // On an entity with a camera component
     * this.entity.camera.endXr((err) => {
     *     // not anymore in XR
     * });
     */
    endXr(callback?: XrErrorCallback): void;
    /**
     * Function to copy properties from the source CameraComponent. Properties not copied:
     * postEffects. Inherited properties not copied (all): system, entity, enabled.
     *
     * @param {CameraComponent} source - The source component.
     * @ignore
     */
    copy(source: CameraComponent): void;
}
import type { Mat4 } from '../../../core/math/mat4.js';
import { Component } from '../component.js';
import { PostEffectQueue } from './post-effect-queue.js';
import type { RenderPass } from '../../../platform/graphics/render-pass.js';
import type { FogParams } from '../../../scene/fog-params.js';
import { Camera } from '../../../scene/camera.js';
import type { Color } from '../../../core/math/color.js';
import type { Frustum } from '../../../core/shape/frustum.js';
import type { Vec4 } from '../../../core/math/vec4.js';
import type { RenderTarget } from '../../../platform/graphics/render-target.js';
import type { Vec3 } from '../../../core/math/vec3.js';
import type { XrErrorCallback } from '../../xr/xr-manager.js';
import type { CameraComponentSystem } from './system.js';
import type { Entity } from '../../entity.js';
