/**
 * Attaches sequence frame handling to the timeline: onSequenceFrameChange → PlySequenceController.
 * Wraps timeline.stop to cleanup on stop; returns detach function.
 */

import { PlySequenceController } from './plySequenceController.js';

export function attachSequencePlayback(timeline, { viewer, fileLoader, importCache, getLoadSessionManager } = {}) {
  if (!timeline) return () => {};

  const seq = new PlySequenceController({ timeline, viewer, fileLoader, importCache, getLoadSessionManager });

  const onSequenceFrameChange = async (obj, frameIndex) => {
    await seq.onFrameChange(obj, frameIndex);
  };

  timeline.onSequenceFrameChange = onSequenceFrameChange;

  if (!timeline.__sequenceStopWrapped && typeof timeline.stop === 'function') {
    timeline.__sequenceStopWrapped = true;
    const origStop = timeline.stop.bind(timeline);
    timeline.stop = () => {
      try {
        seq.cleanupAll('sequence_playback_stop');
      } catch (e) {}
      return origStop();
    };
  }

  return () => {
    try {
      seq.cleanupAll('sequence_playback_detach');
    } catch (e) {}
    if (timeline.onSequenceFrameChange === onSequenceFrameChange) {
      timeline.onSequenceFrameChange = null;
    }
  };
}
