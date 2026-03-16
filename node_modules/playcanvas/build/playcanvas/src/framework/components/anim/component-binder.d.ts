export class AnimComponentBinder extends DefaultAnimBinder {
    static _packFloat(values: any): any;
    static _packBoolean(values: any): boolean;
    static _packVec2(values: any): Vec2;
    static _packVec3(values: any): Vec3;
    static _packVec4(values: any): Vec4;
    static _packColor(values: any): Color;
    static _packQuat(values: any): Quat;
    constructor(animComponent: any, graph: any, layerName: any, mask: any, layerIndex: any);
    animComponent: any;
    layerName: any;
    layerIndex: any;
    _getEntityFromHierarchy(entityHierarchy: any): any;
    _resolvePath(object: any, path: any, resolveLeaf: any): any;
    _setter(object: any, path: any, packFunc: any): ((values: any) => void) | {
        set: (values: any) => void;
        get: () => any;
    };
    _createAnimTargetForProperty(propertyComponent: any, propertyHierarchy: any, targetPath: any): AnimTarget;
    rebind(): void;
}
import { DefaultAnimBinder } from '../../anim/binder/default-anim-binder.js';
import { AnimTarget } from '../../anim/evaluator/anim-target.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { Vec3 } from '../../../core/math/vec3.js';
import { Vec4 } from '../../../core/math/vec4.js';
import { Color } from '../../../core/math/color.js';
import { Quat } from '../../../core/math/quat.js';
