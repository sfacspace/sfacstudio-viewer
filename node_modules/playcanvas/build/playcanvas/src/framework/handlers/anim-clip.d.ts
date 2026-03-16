/**
 * Resource handler used for loading {@link AnimClip} resources.
 *
 * @ignore
 */
export class AnimClipHandler extends ResourceHandler {
    constructor(app: any);
    load(url: any, callback: any): void;
    open(url: any, data: any): AnimTrack;
}
import { ResourceHandler } from './handler.js';
import { AnimTrack } from '../anim/evaluator/anim-track.js';
