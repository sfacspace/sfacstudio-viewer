/**
 * Log tracing functionality, allowing for tracing of the internal functionality of the engine.
 * Note that the trace logging only takes place in the debug build of the engine and is stripped
 * out in other builds.
 *
 * @category Debug
 */
export class Tracing {
    /**
     * Set storing the names of enabled trace channels.
     *
     * @type {Set<string>}
     * @private
     */
    private static _traceChannels;
    /**
     * Enable call stack logging for trace calls. Defaults to false.
     *
     * @type {boolean}
     */
    static stack: boolean;
    /**
     * Enable or disable a trace channel.
     *
     * @param {string} channel - Name of the trace channel. Can be:
     *
     * - {@link TRACEID_RENDER_FRAME}
     * - {@link TRACEID_RENDER_FRAME_TIME}
     * - {@link TRACEID_RENDER_PASS}
     * - {@link TRACEID_RENDER_PASS_DETAIL}
     * - {@link TRACEID_RENDER_ACTION}
     * - {@link TRACEID_RENDER_TARGET_ALLOC}
     * - {@link TRACEID_TEXTURE_ALLOC}
     * - {@link TRACEID_SHADER_ALLOC}
     * - {@link TRACEID_SHADER_COMPILE}
     * - {@link TRACEID_VRAM_TEXTURE}
     * - {@link TRACEID_VRAM_VB}
     * - {@link TRACEID_VRAM_IB}
     * - {@link TRACEID_RENDERPIPELINE_ALLOC}
     * - {@link TRACEID_COMPUTEPIPELINE_ALLOC}
     * - {@link TRACEID_PIPELINELAYOUT_ALLOC}
     * - {@link TRACEID_TEXTURES}
     * - {@link TRACEID_ASSETS}
     * - {@link TRACEID_GPU_TIMINGS}
     *
     * @param {boolean} enabled - New enabled state for the channel.
     */
    static set(channel: string, enabled?: boolean): void;
    /**
     * Test if the trace channel is enabled.
     *
     * @param {string} channel - Name of the trace channel.
     * @returns {boolean} - True if the trace channel is enabled.
     */
    static get(channel: string): boolean;
}
