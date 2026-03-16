/**
 * @import { AnimTarget } from '../evaluator/anim-target.js'
 */
/**
 * This interface is used by {@link AnimEvaluator} to resolve unique animation target path strings
 * into instances of {@link AnimTarget}.
 *
 * @ignore
 */
export class AnimBinder {
    static joinPath(pathSegments: any, character: any): any;
    static splitPath(path: any, character: any): string[];
    /**
     * Converts a locator array into its string version.
     *
     * @param {string|string[]} entityPath - The entity location in the scene defined as an array or
     * string path.
     * @param {string} component - The component of the entity the property is located under.
     * @param {string|string[]} propertyPath - The property location in the entity defined as an array
     * or string path.
     * @returns {string} The locator encoded as a string.
     * @example
     * // returns 'spotLight/light/color.r'
     * encode(['spotLight'], 'light', ['color', 'r']);
     */
    static encode(entityPath: string | string[], component: string, propertyPath: string | string[]): string;
    /**
     * Resolve the provided target path and return an instance of {@link AnimTarget} which will
     * handle setting the value, or return null if no such target exists.
     *
     * @param {string} path - The animation curve path to resolve.
     * @returns {AnimTarget|null} - Returns the target
     * instance on success and null otherwise.
     */
    resolve(path: string): AnimTarget | null;
    /**
     * Called when the {@link AnimEvaluator} no longer has a curve driving the given key.
     *
     * @param {string} path - The animation curve path which is no longer driven.
     */
    unresolve(path: string): void;
    /**
     * Called by {@link AnimEvaluator} once a frame after animation updates are done.
     *
     * @param {number} deltaTime - Amount of time that passed in the current update.
     */
    update(deltaTime: number): void;
}
import type { AnimTarget } from '../evaluator/anim-target.js';
