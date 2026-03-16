/**
 * Callback used by {@link Http#get}, {@link Http#post}, {@link Http#put}, {@link Http#del}, and
 * {@link Http#request}.
 */
export type HttpResponseCallback = (err: number | string | Error | null, response?: any) => void;
export const http: Http;
/**
 * @import { EventHandler } from '../../core/event-handler.js';
 */
/**
 * @callback HttpResponseCallback
 * Callback used by {@link Http#get}, {@link Http#post}, {@link Http#put}, {@link Http#del}, and
 * {@link Http#request}.
 * @param {number|string|Error|null} err - The error code, message, or exception in the case where
 * the request fails.
 * @param {any} [response] - The response data if no errors were encountered. Format depends on
 * response type: text, Object, ArrayBuffer, XML.
 * @returns {void}
 */
/**
 * Used to send and receive HTTP requests.
 */
export class Http {
    static ContentType: {
        AAC: string;
        BASIS: string;
        BIN: string;
        DDS: string;
        FORM_URLENCODED: string;
        GIF: string;
        GLB: string;
        JPEG: string;
        JSON: string;
        MP3: string;
        MP4: string;
        OGG: string;
        OPUS: string;
        PNG: string;
        TEXT: string;
        WAV: string;
        XML: string;
    };
    static ResponseType: {
        TEXT: string;
        ARRAY_BUFFER: string;
        BLOB: string;
        DOCUMENT: string;
        JSON: string;
    };
    static binaryExtensions: string[];
    static retryDelay: number;
    /**
     * Perform an HTTP GET request to the given url with additional options such as headers,
     * retries, credentials, etc.
     *
     * @param {string} url - The URL to make the request to.
     * @param {object} options - Additional options.
     * @param {Object<string, string>} [options.headers] - HTTP headers to add to the request.
     * @param {boolean} [options.async] - Make the request asynchronously. Defaults to true.
     * @param {boolean} [options.cache] - If false, then add a timestamp to the request to prevent caching.
     * @param {boolean} [options.withCredentials] - Send cookies with this request. Defaults to false.
     * @param {string} [options.responseType] - Override the response type.
     * @param {Document|object} [options.postdata] - Data to send in the body of the request.
     * Some content types are handled automatically. If postdata is an XML Document, it is handled. If
     * the Content-Type header is set to 'application/json' then the postdata is JSON stringified.
     * Otherwise, by default, the data is sent as form-urlencoded.
     * @param {boolean} [options.retry] - If true then if the request fails it will be retried with an exponential backoff.
     * @param {number} [options.maxRetries] - If options.retry is true this specifies the maximum number of retries. Defaults to 5.
     * @param {number} [options.maxRetryDelay] - If options.retry is true this specifies the maximum amount of time to wait between retries in milliseconds. Defaults to 5000.
     * @param {EventHandler} [options.progress] - Object to use for firing progress events.
     * @param {HttpResponseCallback} callback - The callback used when the response has returned. Passed (err, data)
     * where data is the response (format depends on response type: text, Object, ArrayBuffer, XML) and
     * err is the error code.
     * @example
     * pc.http.get("http://example.com/", {
     *     "retry": true,
     *     "maxRetries": 5
     * }, (err, response) => {
     *     console.log(response);
     * });
     * @returns {XMLHttpRequest} The request object.
     */
    get(url: string, options: {
        headers?: {
            [x: string]: string;
        };
        async?: boolean;
        cache?: boolean;
        withCredentials?: boolean;
        responseType?: string;
        postdata?: Document | object;
        retry?: boolean;
        maxRetries?: number;
        maxRetryDelay?: number;
        progress?: EventHandler;
    }, callback: HttpResponseCallback): XMLHttpRequest;
    /**
     * Perform an HTTP POST request to the given url with additional options such as headers,
     * retries, credentials, etc.
     *
     * @param {string} url - The URL to make the request to.
     * @param {object} data - Data to send in the body of the request.
     * Some content types are handled automatically. If postdata is an XML Document, it is handled.
     * If the Content-Type header is set to 'application/json' then the postdata is JSON
     * stringified. Otherwise, by default, the data is sent as form-urlencoded.
     * @param {object} options - Additional options.
     * @param {Object<string, string>} [options.headers] - HTTP headers to add to the request.
     * @param {boolean} [options.async] - Make the request asynchronously. Defaults to true.
     * @param {boolean} [options.cache] - If false, then add a timestamp to the request to prevent caching.
     * @param {boolean} [options.withCredentials] - Send cookies with this request. Defaults to false.
     * @param {string} [options.responseType] - Override the response type.
     * @param {boolean} [options.retry] - If true then if the request fails it will be retried with an exponential backoff.
     * @param {number} [options.maxRetries] - If options.retry is true this specifies the maximum
     * number of retries. Defaults to 5.
     * @param {number} [options.maxRetryDelay] - If options.retry is true this specifies the
     * maximum amount of time to wait between retries in milliseconds. Defaults to 5000.
     * @param {HttpResponseCallback} callback - The callback used when the response has returned.
     * Passed (err, data) where data is the response (format depends on response type: text,
     * Object, ArrayBuffer, XML) and err is the error code.
     * @example
     * pc.http.post("http://example.com/", {
     *     "name": "Alex"
     * }, {
     *     "retry": true,
     *     "maxRetries": 5
     * }, (err, response) => {
     *     console.log(response);
     * });
     * @returns {XMLHttpRequest} The request object.
     */
    post(url: string, data: object, options: {
        headers?: {
            [x: string]: string;
        };
        async?: boolean;
        cache?: boolean;
        withCredentials?: boolean;
        responseType?: string;
        retry?: boolean;
        maxRetries?: number;
        maxRetryDelay?: number;
    }, callback: HttpResponseCallback): XMLHttpRequest;
    /**
     * Perform an HTTP PUT request to the given url with additional options such as headers,
     * retries, credentials, etc.
     *
     * @param {string} url - The URL to make the request to.
     * @param {Document|object} data - Data to send in the body of the request. Some content types
     * are handled automatically. If postdata is an XML Document, it is handled. If the
     * Content-Type header is set to 'application/json' then the postdata is JSON stringified.
     * Otherwise, by default, the data is sent as form-urlencoded.
     * @param {object} options - Additional options.
     * @param {Object<string, string>} [options.headers] - HTTP headers to add to the request.
     * @param {boolean} [options.async] - Make the request asynchronously. Defaults to true.
     * @param {boolean} [options.cache] - If false, then add a timestamp to the request to prevent caching.
     * @param {boolean} [options.withCredentials] - Send cookies with this request. Defaults to false.
     * @param {string} [options.responseType] - Override the response type.
     * @param {boolean} [options.retry] - If true then if the request fails it will be retried with
     * an exponential backoff.
     * @param {number} [options.maxRetries] - If options.retry is true this specifies the maximum
     * number of retries. Defaults to 5.
     * @param {number} [options.maxRetryDelay] - If options.retry is true this specifies the
     * maximum amount of time to wait between retries in milliseconds. Defaults to 5000.
     * @param {HttpResponseCallback} callback - The callback used when the response has returned.
     * Passed (err, data) where data is the response (format depends on response type: text,
     * Object, ArrayBuffer, XML) and err is the error code.
     * @example
     * pc.http.put("http://example.com/", {
     *     "name": "Alex"
     * }, {
     *     "retry": true,
     *     "maxRetries": 5
     * }, (err, response) => {
     *     console.log(response);
     * });
     * @returns {XMLHttpRequest} The request object.
     */
    put(url: string, data: Document | object, options: {
        headers?: {
            [x: string]: string;
        };
        async?: boolean;
        cache?: boolean;
        withCredentials?: boolean;
        responseType?: string;
        retry?: boolean;
        maxRetries?: number;
        maxRetryDelay?: number;
    }, callback: HttpResponseCallback): XMLHttpRequest;
    /**
     * Perform an HTTP DELETE request to the given url with additional options such as headers,
     * retries, credentials, etc.
     *
     * @param {string} url - The URL to make the request to.
     * @param {object} options - Additional options.
     * @param {Object<string, string>} [options.headers] - HTTP headers to add to the request.
     * @param {boolean} [options.async] - Make the request asynchronously. Defaults to true.
     * @param {boolean} [options.cache] - If false, then add a timestamp to the request to prevent caching.
     * @param {boolean} [options.withCredentials] - Send cookies with this request. Defaults to false.
     * @param {string} [options.responseType] - Override the response type.
     * @param {Document|object} [options.postdata] - Data to send in the body of the request.
     * Some content types are handled automatically. If postdata is an XML Document, it is handled.
     * If the Content-Type header is set to 'application/json' then the postdata is JSON
     * stringified. Otherwise, by default, the data is sent as form-urlencoded.
     * @param {boolean} [options.retry] - If true then if the request fails it will be retried with
     * an exponential backoff.
     * @param {number} [options.maxRetries] - If options.retry is true this specifies the maximum
     * number of retries. Defaults to 5.
     * @param {number} [options.maxRetryDelay] - If options.retry is true this specifies the
     * maximum amount of time to wait between retries in milliseconds. Defaults to 5000.
     * @param {HttpResponseCallback} callback - The callback used when the response has returned.
     * Passed (err, data) where data is the response (format depends on response type: text,
     * Object, ArrayBuffer, XML) and err is the error code.
     * @example
     * pc.http.del("http://example.com/", {
     *     "retry": true,
     *     "maxRetries": 5
     * }, (err, response) => {
     *     console.log(response);
     * });
     * @returns {XMLHttpRequest} The request object.
     */
    del(url: string, options: {
        headers?: {
            [x: string]: string;
        };
        async?: boolean;
        cache?: boolean;
        withCredentials?: boolean;
        responseType?: string;
        postdata?: Document | object;
        retry?: boolean;
        maxRetries?: number;
        maxRetryDelay?: number;
    }, callback: HttpResponseCallback): XMLHttpRequest;
    /**
     * Make a general purpose HTTP request with additional options such as headers, retries,
     * credentials, etc.
     *
     * @param {string} method - The HTTP method "GET", "POST", "PUT", "DELETE".
     * @param {string} url - The url to make the request to.
     * @param {object} options - Additional options.
     * @param {Object<string, string>} [options.headers] - HTTP headers to add to the request.
     * @param {boolean} [options.async] - Make the request asynchronously. Defaults to true.
     * @param {boolean} [options.cache] - If false, then add a timestamp to the request to prevent caching.
     * @param {boolean} [options.withCredentials] - Send cookies with this request. Defaults to false.
     * @param {boolean} [options.retry] - If true then if the request fails it will be retried with
     * an exponential backoff.
     * @param {number} [options.maxRetries] - If options.retry is true this specifies the maximum
     * number of retries. Defaults to 5.
     * @param {number} [options.maxRetryDelay] - If options.retry is true this specifies the
     * maximum amount of time to wait between retries in milliseconds. Defaults to 5000.
     * @param {string} [options.responseType] - Override the response type.
     * @param {Document|object} [options.postdata] - Data to send in the body of the request.
     * Some content types are handled automatically. If postdata is an XML Document, it is handled.
     * If the Content-Type header is set to 'application/json' then the postdata is JSON
     * stringified. Otherwise, by default, the data is sent as form-urlencoded.
     * @param {HttpResponseCallback} callback - The callback used when the response has returned.
     * Passed (err, data) where data is the response (format depends on response type: text,
     * Object, ArrayBuffer, XML) and err is the error code.
     * @example
     * pc.http.request("get", "http://example.com/", {
     *     "retry": true,
     *     "maxRetries": 5
     * }, (err, response) => {
     *     console.log(response);
     * });
     * @returns {XMLHttpRequest} The request object.
     */
    request(method: string, url: string, options: {
        headers?: {
            [x: string]: string;
        };
        async?: boolean;
        cache?: boolean;
        withCredentials?: boolean;
        retry?: boolean;
        maxRetries?: number;
        maxRetryDelay?: number;
        responseType?: string;
        postdata?: Document | object;
    }, callback: HttpResponseCallback): XMLHttpRequest;
    _guessResponseType(url: any): string;
    _isBinaryContentType(contentType: any): boolean;
    _isBinaryResponseType(responseType: any): boolean;
    _onReadyStateChange(method: any, url: any, options: any, xhr: any): void;
    _onSuccess(method: any, url: any, options: any, xhr: any): void;
    _onError(method: any, url: any, options: any, xhr: any): void;
}
import type { EventHandler } from '../../core/event-handler.js';
