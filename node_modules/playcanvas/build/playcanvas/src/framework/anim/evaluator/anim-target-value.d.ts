/**
 * @import { AnimComponent } from '../../components/anim/component.js'
 */
/**
 * Used to store and update the value of an animation target. This combines the values of multiple
 * layer targets into a single value.
 */
export class AnimTargetValue {
    static TYPE_QUAT: string;
    static TYPE_VEC3: string;
    static q1: Quat;
    static q2: Quat;
    static q3: Quat;
    static quatArr: number[];
    static vecArr: number[];
    static IDENTITY_QUAT_ARR: number[];
    /**
     * Create a new AnimTargetValue instance.
     *
     * @param {AnimComponent} component - The anim component this target value is associated with.
     * @param {string} type - The type of value stored, either quat or vec3.
     */
    constructor(component: AnimComponent, type: string);
    _component: AnimComponent;
    mask: Int8Array<ArrayBuffer>;
    weights: Float32Array<ArrayBuffer>;
    totalWeight: number;
    counter: number;
    layerCounter: number;
    valueType: string;
    dirty: boolean;
    value: number[];
    baseValue: any;
    setter: any;
    get _normalizeWeights(): boolean;
    getWeight(index: any): number;
    _layerBlendType(index: any): string;
    setMask(index: any, value: any): void;
    updateWeights(): void;
    updateValue(index: any, value: any): void;
    unbind(): void;
}
import type { AnimComponent } from '../../components/anim/component.js';
import { Quat } from '../../../core/math/quat.js';
