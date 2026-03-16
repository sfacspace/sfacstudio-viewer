/**
 * Create a URI object from constituent parts.
 *
 * @param {object} options - Parts of the URI to build.
 * @param {string} [options.scheme] - The URI scheme (e.g. http).
 * @param {string} [options.authority] - The URI authority (e.g. `www.example.com`).
 * @param {string} [options.host] - Combination of scheme and authority (e.g. `http://www.example.com`).
 * @param {string} [options.path] - The URI path (e.g. /users/example).
 * @param {string} [options.hostpath] - Combination of scheme, authority and path (e.g. `http://www.example.com/users/example`).
 * @param {string} [options.query] - The query section, after the ?(e.g. `http://example.com?**key=value&another=123**`).
 * @param {string} [options.fragment] - The fragment section, after the # (e.g. `http://example.com#**fragment/data**`).
 * @returns {string} A URI string.
 * @ignore
 */
export function createURI(options: {
    scheme?: string;
    authority?: string;
    host?: string;
    path?: string;
    hostpath?: string;
    query?: string;
    fragment?: string;
}): string;
/**
 * A URI object.
 *
 * @ignore
 */
export class URI {
    /**
     * Create a new URI instance.
     *
     * @param {string} uri - URI string.
     */
    constructor(uri: string);
    /**
     * The scheme. (e.g. http).
     *
     * @type {string}
     */
    scheme: string;
    /**
     * The authority. (e.g. `www.example.com`).
     *
     * @type {string}
     */
    authority: string;
    /**
     * The path. (e.g. /users/example).
     *
     * @type {string}
     */
    path: string;
    /**
     * The query, the section after a ?. (e.g. search=value).
     *
     * @type {string}
     */
    query: string;
    /**
     * The fragment, the section after a #.
     *
     * @type {string}
     */
    fragment: string;
    /**
     * Convert URI back to string.
     *
     * @returns {string} The URI as a string.
     */
    toString(): string;
    /**
     * Returns the query parameters as an Object.
     *
     * @returns {object} The URI's query parameters converted to an Object.
     * @example
     * const s = "http://example.com?a=1&b=2&c=3";
     * const uri = new pc.URI(s);
     * const q = uri.getQuery();
     * console.log(q.a); // logs "1"
     * console.log(q.b); // logs "2"
     * console.log(q.c); // logs "3"
     */
    getQuery(): object;
    /**
     * Set the query section of the URI from a Object.
     *
     * @param {object} params - Key-Value pairs to encode into the query string.
     * @example
     * const s = "http://example.com";
     * const uri = new pc.URI(s);
     * uri.setQuery({
     *     "a": 1,
     *     "b": 2
     * });
     * console.log(uri.toString()); // logs "http://example.com?a=1&b=2
     */
    setQuery(params: object): void;
}
