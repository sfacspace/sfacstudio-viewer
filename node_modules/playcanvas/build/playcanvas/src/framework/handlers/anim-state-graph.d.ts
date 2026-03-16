/**
 * Resource handler used for loading {@link AnimStateGraph} resources.
 *
 * @ignore
 */
export class AnimStateGraphHandler extends ResourceHandler {
    constructor(app: any);
    load(url: any, callback: any): void;
    open(url: any, data: any): AnimStateGraph;
}
import { ResourceHandler } from './handler.js';
import { AnimStateGraph } from '../anim/state-graph/anim-state-graph.js';
