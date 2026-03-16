/**
 * Implementation of {@link AnimBinder} for animating a skeleton in the graph-node hierarchy.
 *
 * @ignore
 */
export class DefaultAnimBinder {
    static createAnimTarget(func: any, type: any, valueCount: any, node: any, propertyPath: any, componentType: any): AnimTarget;
    constructor(graph: any);
    graph: any;
    _mask: any;
    nodes: {};
    targetCache: {};
    visitedFallbackGraphPaths: {};
    nodeCounts: {};
    activeNodes: any[];
    handlers: {
        localPosition: (node: any) => AnimTarget;
        localRotation: (node: any) => AnimTarget;
        localScale: (node: any) => AnimTarget;
        weight: (node: any, weightName: any) => AnimTarget;
        materialTexture: (node: any, textureName: any) => AnimTarget;
    };
    _isPathInMask: (path: any, checkMaskValue: any) => boolean;
    _isPathActive(path: any): boolean;
    findNode(path: any): any;
    resolve(path: any): any;
    unresolve(path: any): void;
    update(deltaTime: any): void;
    assignMask(mask: any): boolean;
}
import { AnimTarget } from '../evaluator/anim-target.js';
