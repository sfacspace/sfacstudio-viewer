/**
 * A cache for assigning unique numerical ids to strings.
 */
export class StringIds {
    /** @type {Map<string, number>} */
    map: Map<string, number>;
    /** @type {number} */
    id: number;
    /**
     * Get the id for the given name. If the name has not been seen before, it will be assigned a new
     * id.
     *
     * @param {string} name - The name to get the id for.
     * @returns {number} The id for the given name.
     */
    get(name: string): number;
}
