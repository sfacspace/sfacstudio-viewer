/**
 * Creates a graphics device.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element.
 * @param {object} options - Graphics device options.
 * @param {string[]} [options.deviceTypes] - An array of DEVICETYPE_*** constants, defining the
 * order in which the devices are attempted to get created. Defaults to an empty array. If the
 * specified array does not contain {@link DEVICETYPE_WEBGL2}, it is internally added to its end.
 * Typically, you'd only specify {@link DEVICETYPE_WEBGPU}, or leave it empty.
 * @param {boolean} [options.antialias] - Boolean that indicates whether or not to perform
 * anti-aliasing if possible. Defaults to true.
 * @param {string} [options.displayFormat] - The display format of the canvas. Defaults to
 * {@link DISPLAYFORMAT_LDR}. Can be:
 *
 * - {@link DISPLAYFORMAT_LDR}
 * - {@link DISPLAYFORMAT_LDR_SRGB}
 * - {@link DISPLAYFORMAT_HDR}
 *
 * @param {boolean} [options.depth] - Boolean that indicates that the drawing buffer is
 * requested to have a depth buffer of at least 16 bits. Defaults to true.
 * @param {boolean} [options.stencil] - Boolean that indicates that the drawing buffer is
 * requested to have a stencil buffer of at least 8 bits. Defaults to true.
 * @param {string} [options.glslangUrl] - The URL to the glslang script. Required only if
 * user-defined shaders or shader chunk overrides are specified in GLSL and need to be transpiled to
 * WGSL for use with the {@link DEVICETYPE_WEBGPU} device type. This is not required if only the
 * engine's built-in shaders are used, as those are provided directly in WGSL. Not used for
 * {@link DEVICETYPE_WEBGL2} device type creation.
 * @param {string} [options.twgslUrl] - An url to twgsl script, required if glslangUrl was specified.
 * @param {boolean} [options.xrCompatible] - Boolean that hints to the user agent to use a
 * compatible graphics adapter for an immersive XR device.
 * @param {'default'|'high-performance'|'low-power'} [options.powerPreference] - A hint indicating
 * what configuration of GPU would be selected. Possible values are:
 *
 * - 'default': Let the user agent decide which GPU configuration is most suitable. This is the
 * default value.
 * - 'high-performance': Prioritizes rendering performance over power consumption.
 * - 'low-power': Prioritizes power saving over rendering performance.
 *
 * Defaults to 'default'.
 * @returns {Promise} - Promise object representing the created graphics device.
 * @category Graphics
 */
export function createGraphicsDevice(canvas: HTMLCanvasElement, options?: {
    deviceTypes?: string[];
    antialias?: boolean;
    displayFormat?: string;
    depth?: boolean;
    stencil?: boolean;
    glslangUrl?: string;
    twgslUrl?: string;
    xrCompatible?: boolean;
    powerPreference?: "default" | "high-performance" | "low-power";
}): Promise<any>;
