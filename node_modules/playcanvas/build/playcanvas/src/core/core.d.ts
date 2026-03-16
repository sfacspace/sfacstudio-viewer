/**
 * Merge the contents of two objects into a single object.
 *
 * @param {object} target - The target object of the merge.
 * @param {object} ex - The object that is merged with target.
 * @returns {object} The target object.
 * @example
 * const A = {
 *     a: function () {
 *         console.log(this.a);
 *     }
 * };
 * const B = {
 *     b: function () {
 *         console.log(this.b);
 *     }
 * };
 *
 * extend(A, B);
 * A.a();
 * // logs "a"
 * A.b();
 * // logs "b"
 * @ignore
 */
export function extend(target: object, ex: object): object;
/**
 * The engine revision number. This is the Git hash of the last commit made to the branch
 * from which the engine was built.
 */
export const revision: "$_CURRENT_SDK_REVISION";
/**
 * The engine version number. This is in semantic versioning format (MAJOR.MINOR.PATCH).
 */
export const version: "$_CURRENT_SDK_VERSION";
