/**
 * Export video – prepareFrame (sequence/camera) → render → postRender → captureFrame. Default 60fps.
 */
import {
  BufferTarget,
  EncodedPacket,
  EncodedVideoPacketSource,
  Mp4OutputFormat,
  Output,
  StreamTarget,
} from 'mediabunny';

const DEFAULT_WIDTH = 3840;
const DEFAULT_HEIGHT = 2160;
/** Default output video frame rate (60fps) */
const DEFAULT_OUTPUT_FRAME_RATE = 60;
/** Renders to wait after sequence load before capture (reduces overlap/tearing) */
const WAIT_RENDER_AFTER_SEQUENCE_LOAD = 10;

/**
 * @param {Object} options
 * @param {import('../core/viewer.js').PlayCanvasViewer} options.viewer
 * @param {import('../timeline/index.js').TimelineController} options.timeline
 * @param {FileSystemFileHandle|null} options.fileHandle - save target (streaming if set)
 * @param {AbortSignal} [options.signal] - abort on cancel
 * @param {(pct: number, text?: string) => void} [options.onProgress]
 * @param {number} [options.startFrame] - start frame (default 0)
 * @param {number} [options.endFrame] - end frame (default totalFrames - 1)
 * @param {number} [options.frameRate] - output fps (default 60)
 * @param {number} [options.width] - width (default 3840)
 * @param {number} [options.height] - height (default 2160)
 * @param {number} [options.bitrate] - bitrate (default width*height*frameRate*0.08)
 * @param {number} [options.outputFrameRate] - same as frameRate (compat)
 */
export async function exportVideo(options = {}) {
  const {
    viewer,
    timeline,
    fileHandle,
    signal,
    onProgress,
    startFrame: startFrameOption,
    endFrame: endFrameOption,
    frameRate: frameRateOption,
    outputFrameRate: outputFrameRateOption,
    width: widthOption,
    height: heightOption,
    bitrate: bitrateOption,
  } = options;
  const frameRateOpt = frameRateOption ?? outputFrameRateOption;

  if (!viewer?.app || !viewer?.canvas || !timeline) {
    throw new Error('viewer.app, viewer.canvas, timeline required.');
  }

  const app = viewer.app;
  const canvas = viewer.canvas;
  const device = app.graphicsDevice ?? null;
  const gl = app.graphicsDevice?.gl ?? canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL context unavailable.');
  }

  const animFrameRate = Math.max(1, Math.min(60, parseInt(timeline.fps, 10) || 30));
  const totalFrames = Math.max(1, parseInt(timeline.totalFrames, 10) || 90);
  const startFrame = startFrameOption ?? 0;
  const endFrame = endFrameOption ?? totalFrames - 1;
  const frameRate = Math.max(1, Math.min(120, Math.round(Number(frameRateOpt ?? DEFAULT_OUTPUT_FRAME_RATE)) || DEFAULT_OUTPUT_FRAME_RATE));
  const width = Math.max(1, Math.min(7680, Number(widthOption ?? DEFAULT_WIDTH) || DEFAULT_WIDTH));
  const height = Math.max(1, Math.min(4320, Number(heightOption ?? DEFAULT_HEIGHT) || DEFAULT_HEIGHT));
  const duration = (endFrame - startFrame) / animFrameRate;
  const bitrate = Number(bitrateOption) > 0
    ? Number(bitrateOption)
    : Math.max(72_000_000, (width * height * frameRate * 0.08) | 0);

  const objects = timeline._objects;
  const hasSequence = objects?.objects?.some((o) => o?.isSequence && o?.files?.length) ?? false;

  const prevFrustumsVisible = timeline._keyframes?.frustumsVisible ?? true;
  timeline._keyframes?.setFrustumsVisible?.(false);

  let target;
  let writable = null;
  if (fileHandle) {
    try {
      writable = await fileHandle.createWritable({ keepExistingData: false });
      target = new StreamTarget(writable);
    } catch (e) {
      if (e?.name === 'AbortError') return;
      target = new BufferTarget();
    }
  } else {
    target = new BufferTarget();
  }

  // StreamTarget: fastStart false to avoid memory spike. BufferTarget: fastStart 'in-memory' for web playback.
  const useStreaming = target instanceof StreamTarget;
  const outputFormat = new Mp4OutputFormat({
    fastStart: useStreaming ? false : 'in-memory',
  });
  const output = new Output({ format: outputFormat, target });
  const codecType = 'avc';
  const codec = height >= 1080 ? 'avc1.640033' : 'avc1.420028';
  const videoSource = new EncodedVideoPacketSource(codecType);
  output.addVideoTrack(videoSource, { rotation: 0, frameRate });
  await output.start();

  let encoderError = null;
  const encoder = new VideoEncoder({
    output: async (chunk, meta) => {
      const packet = EncodedPacket.fromEncodedChunk(chunk);
      await videoSource.add(packet, meta);
    },
    error: (e) => { encoderError = e; },
  });
  encoder.configure({ codec, width, height, bitrate });

  const prevWidth = canvas.width;
  const prevHeight = canvas.height;
  const prevMaxPixelRatio = device?.maxPixelRatio ?? 1;

  canvas.width = width;
  canvas.height = height;
  if (device) {
    device.maxPixelRatio = 1;
    device.resizeCanvas(width, height);
  }
  if (typeof app.resizeCanvas === 'function') {
    app.resizeCanvas(width, height);
  }
  if (device && (device.width !== width || device.height !== height)) {
    device.resizeCanvas(width, height);
  }

  const data = new Uint8Array(width * height * 4);
  const line = new Uint8Array(width * 4);

  /** Wait one frame after render (same as render.ts postRender) */
  function postRender() {
    return new Promise((resolve) => {
      app.once('postrender', () => resolve());
    });
  }

  /** Yield one frame for browser/GPU to flush */
  function yieldFrame() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => { resolve(); });
    });
  }

  /**
   * Prepare frame: set time, wait for sequence load, sync camera (same as render.ts prepareFrame).
   * @param {number} animationTimeSec - animation time in seconds
   */
  async function prepareFrame(animationTimeSec) {
    if (typeof timeline.setFrameAsyncByTime === 'function') {
      await timeline.setFrameAsyncByTime(animationTimeSec);
      return;
    }
    if (hasSequence && objects) {
      objects._collectSequencePromises = true;
    }
    timeline._playback?.setTime?.(animationTimeSec);
    if (hasSequence && objects && Array.isArray(objects._sequencePromises) && objects._sequencePromises.length > 0) {
      await Promise.all(objects._sequencePromises);
    }
    if (objects) {
      objects._collectSequencePromises = false;
    }
    timeline._playback?.setTime?.(animationTimeSec);
  }

  /**
   * Read current frame and pass to encoder (same flow as render.ts captureFrame).
   * @param {number} frameTime - frame time in seconds for VideoFrame timestamp/duration
   */
  async function captureFrame(frameTime) {
    if (typeof gl.finish === 'function') gl.finish();
    else if (typeof gl.flush === 'function') gl.flush();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

    for (let y = 0; y < height / 2; y++) {
      const top = y * width * 4;
      const bottom = (height - y - 1) * width * 4;
      line.set(data.subarray(top, top + width * 4));
      data.copyWithin(top, bottom, bottom + width * 4);
      data.set(line, bottom);
    }

    const frameData = new Uint8Array(data.length);
    frameData.set(data);

    const videoFrame = new VideoFrame(frameData, {
      format: 'RGBA',
      codedWidth: width,
      codedHeight: height,
      timestamp: Math.floor(1e6 * frameTime),
      duration: Math.floor(1e6 / frameRate),
    });

    while (encoder.encodeQueueSize > 5) {
      await new Promise((r) => setTimeout(r, 1));
    }
    if (encoderError) {
      videoFrame.close();
      throw encoderError;
    }
    encoder.encode(videoFrame);
    videoFrame.close();
  }

  const startTimeSec = startFrame / animFrameRate;

  try {
    for (let frameTime = 0; frameTime <= duration; frameTime += 1.0 / frameRate) {
      if (signal?.aborted) break;

      await prepareFrame(startTimeSec + frameTime);

      // Sequence: yield after frame switch so GPU/engine can update
      if (hasSequence) {
        await yieldFrame();
      }

      const renderCount = hasSequence ? WAIT_RENDER_AFTER_SEQUENCE_LOAD : 1;
      for (let r = 0; r < renderCount; r++) {
        if (typeof app.render === 'function') {
          app.render();
        } else {
          requestAnimationFrame(() => {});
        }
        await postRender();
      }

      // Sequence: capture after last render is fully reflected (reduces tearing)
      if (hasSequence) {
        await yieldFrame();
      }

      await captureFrame(frameTime);

      const progress = duration > 0 ? Math.min(100, Math.round(100 * frameTime / duration)) : 100;
      onProgress?.(progress, `Exporting video... ${progress}%`);
    }

    await encoder.flush();
    await output.finalize();
    encoder.close();

    if (signal?.aborted && writable) {
      try { await writable.abort(); } catch (_) {}
    } else if (writable) {
      try { await writable.close(); } catch (_) {}
    } else if (target.buffer) {
      const blob = new Blob([target.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'withVision_export.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } finally {
    timeline._keyframes?.setFrustumsVisible?.(prevFrustumsVisible);
    canvas.width = prevWidth;
    canvas.height = prevHeight;
    if (device) device.maxPixelRatio = prevMaxPixelRatio;
    if (typeof viewer.resize === 'function') viewer.resize();
  }
}
