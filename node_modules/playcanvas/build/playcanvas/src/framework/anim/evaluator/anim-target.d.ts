/**
 * Stores the information required by {@link AnimEvaluator} for updating a target value.
 *
 * @ignore
 */
export class AnimTarget {
    /**
     * Create a new AnimTarget instance.
     *
     * @param {(value: number[]) => void} func - This function will be called when a new animation value is output
     * by the {@link AnimEvaluator}.
     * @param {'vector'|'quaternion'} type - The type of animation data this target expects.
     * @param {number} components - The number of components on this target (this should ideally
     * match the number of components found on all attached animation curves).
     * @param {string} targetPath - The path to the target value.
     */
    constructor(func: (value: number[]) => void, type: "vector" | "quaternion", components: number, targetPath: string);
    _set: any;
    _get: any;
    _type: "quaternion" | "vector";
    _components: number;
    _targetPath: string;
    _isTransform: boolean;
    _isWeight: boolean;
    get set(): any;
    get get(): any;
    get type(): "quaternion" | "vector";
    get components(): number;
    get targetPath(): string;
    get isTransform(): boolean;
    get isWeight(): boolean;
    /**
     * Returns true if this target should use layer blending (transforms and weights).
     */
    get usesLayerBlending(): boolean;
}
