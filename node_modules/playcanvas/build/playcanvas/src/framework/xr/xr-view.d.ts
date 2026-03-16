/**
 * @import { XrManager } from './xr-manager.js'
 */
/**
 * Represents an XR View which represents a screen (monoscopic scenario such as a mobile phone) or an eye
 * (stereoscopic scenario such as an HMD context). It provides access to the view's color and depth information
 * based on the capabilities of underlying AR system.
 *
 * @category XR
 */
export class XrView extends EventHandler {
    /**
     * Fired when the depth sensing texture been resized. The {@link XrView#depthUvMatrix} needs
     * to be updated for relevant shaders. The handler is passed the new width and height of the
     * depth texture in pixels.
     *
     * @event
     * @example
     * view.on('depth:resize', () => {
     *     material.setParameter('matrix_depth_uv', view.depthUvMatrix);
     * });
     */
    static EVENT_DEPTHRESIZE: string;
    /**
     * Create a new XrView instance.
     *
     * @param {XrManager} manager - WebXR Manager.
     * @param {XRView} xrView - XRView object that is created by WebXR API.
     * @param {number} viewsCount - Number of views available for the session.
     * @ignore
     */
    constructor(manager: XrManager, xrView: XRView, viewsCount: number);
    /**
     * @type {XrManager}
     * @private
     */
    private _manager;
    /**
     * @type {XRView}
     * @private
     */
    private _xrView;
    /**
     * @type {Float32Array}
     * @private
     */
    private _positionData;
    /**
     * @type {Vec4}
     * @private
     */
    private _viewport;
    /**
     * @type {Mat4}
     * @private
     */
    private _projMat;
    /**
     * @type {Mat4}
     * @private
     */
    private _projViewOffMat;
    /**
     * @type {Mat4}
     * @private
     */
    private _viewMat;
    /**
     * @type {Mat4}
     * @private
     */
    private _viewOffMat;
    /**
     * @type {Mat3}
     * @private
     */
    private _viewMat3;
    /**
     * @type {Mat4}
     * @private
     */
    private _viewInvMat;
    /**
     * @type {Mat4}
     * @private
     */
    private _viewInvOffMat;
    /**
     * @type {XRCamera}
     * @private
     */
    private _xrCamera;
    /**
     * @type {Texture|null}
     * @private
     */
    private _textureColor;
    /**
     * @type {Texture|null}
     * @private
     */
    private _textureDepth;
    /**
     * @type {XRDepthInformation|null}
     * @private
     */
    private _depthInfo;
    /**
     * @type {Uint8Array}
     * @private
     */
    private _emptyDepthBuffer;
    /**
     * @type {Mat4}
     * @private
     */
    private _depthMatrix;
    /**
     * Texture associated with this view's camera color. Equals to null if camera color is
     * not available or is not supported.
     *
     * @type {Texture|null}
     */
    get textureColor(): Texture | null;
    /**
     * Texture that contains packed depth information which is reconstructed using the underlying
     * AR system. This texture can be used (not limited to) for reconstructing real world
     * geometry, virtual object placement, occlusion of virtual object by the real world geometry,
     * and more.
     * The format of this texture is any of {@link PIXELFORMAT_LA8}, {@link PIXELFORMAT_DEPTH}, or
     * {@link PIXELFORMAT_R32F} based on {@link XrViews#depthPixelFormat}. It is UV transformed
     * based on the underlying AR system which can be normalized using {@link XrView#depthUvMatrix}.
     * Equals to null if camera depth is not supported.
     *
     * @type {Texture|null}
     * @example
     * // GPU path, attaching texture to material
     * material.setParameter('texture_depthSensingMap', view.textureDepth);
     * material.setParameter('matrix_depth_uv', view.depthUvMatrix.data);
     * material.setParameter('depth_to_meters', view.depthValueToMeters);
     * @example
     * // GLSL shader to unpack depth texture
     * // when depth information is provided in form of LA8
     * varying vec2 vUv0;
     *
     * uniform sampler2D texture_depthSensingMap;
     * uniform mat4 matrix_depth_uv;
     * uniform float depth_to_meters;
     *
     * void main(void) {
     *     // transform UVs using depth matrix
     *     vec2 texCoord = (matrix_depth_uv * vec4(vUv0.xy, 0.0, 1.0)).xy;
     *
     *     // get luminance alpha components from depth texture
     *     vec2 packedDepth = texture2D(texture_depthSensingMap, texCoord).ra;
     *
     *     // unpack into single value in millimeters
     *     float depth = dot(packedDepth, vec2(255.0, 256.0 * 255.0)) * depth_to_meters; // m
     *
     *     // normalize: 0m to 8m distance
     *     depth = min(depth / 8.0, 1.0); // 0..1 = 0m..8m
     *
     *     // paint scene from black to white based on distance
     *     gl_FragColor = vec4(depth, depth, depth, 1.0);
     * }
     */
    get textureDepth(): Texture | null;
    /**
     * 4x4 matrix that should be used to transform depth texture UVs to normalized UVs in a shader.
     * It is updated when the depth texture is resized. Refer to {@link EVENT_DEPTHRESIZE}.
     *
     * @type {Mat4}
     * @example
     * material.setParameter('matrix_depth_uv', view.depthUvMatrix.data);
     */
    get depthUvMatrix(): Mat4;
    /**
     * Multiply this coefficient number by raw depth value to get depth in meters.
     *
     * @type {number}
     * @example
     * material.setParameter('depth_to_meters', view.depthValueToMeters);
     */
    get depthValueToMeters(): number;
    /**
     * An eye with which this view is associated. Can be any of:
     *
     * - {@link XREYE_NONE}: None - inidcates a monoscopic view (likely mobile phone screen).
     * - {@link XREYE_LEFT}: Left - indicates left eye view.
     * - {@link XREYE_RIGHT}: Right - indicates a right eye view.
     *
     * @type {string}
     */
    get eye(): string;
    /**
     * A Vec4 (x, y, width, height) that represents a view's viewport. For a monoscopic screen,
     * it will define fullscreen view. But for stereoscopic views (left/right eye), it will define
     * a part of a whole screen that view is occupying.
     *
     * @type {Vec4}
     */
    get viewport(): Vec4;
    /**
     * @type {Mat4}
     * @ignore
     */
    get projMat(): Mat4;
    /**
     * @type {Mat4}
     * @ignore
     */
    get projViewOffMat(): Mat4;
    /**
     * @type {Mat4}
     * @ignore
     */
    get viewOffMat(): Mat4;
    /**
     * @type {Mat4}
     * @ignore
     */
    get viewInvOffMat(): Mat4;
    /**
     * @type {Mat3}
     * @ignore
     */
    get viewMat3(): Mat3;
    /**
     * @type {Float32Array}
     * @ignore
     */
    get positionData(): Float32Array;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @param {XRView} xrView - XRView from WebXR API.
     * @ignore
     */
    update(frame: XRFrame, xrView: XRView): void;
    /**
     * @private
     */
    private _updateTextureColor;
    _frameBufferSource: any;
    _frameBuffer: any;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @private
     */
    private _updateDepth;
    /**
     * @param {Mat4|null} transform - World Transform of a parents GraphNode.
     * @ignore
     */
    updateTransforms(transform: Mat4 | null): void;
    _onDeviceLost(): void;
    /**
     * Get a depth value from depth information in meters. The specified UV is in the range 0..1,
     * with the origin in the top-left corner of the depth texture.
     *
     * @param {number} u - U coordinate of pixel in depth texture, which is in range from 0.0 to
     * 1.0 (left to right).
     * @param {number} v - V coordinate of pixel in depth texture, which is in range from 0.0 to
     * 1.0 (top to bottom).
     * @returns {number|null} Depth in meters or null if depth information is currently not
     * available.
     * @example
     * const depth = view.getDepth(u, v);
     * if (depth !== null) {
     *     // depth in meters
     * }
     */
    getDepth(u: number, v: number): number | null;
    /** @ignore */
    destroy(): void;
}
import { EventHandler } from '../../core/event-handler.js';
import { Texture } from '../../platform/graphics/texture.js';
import { Mat4 } from '../../core/math/mat4.js';
import { Vec4 } from '../../core/math/vec4.js';
import { Mat3 } from '../../core/math/mat3.js';
import type { XrManager } from './xr-manager.js';
