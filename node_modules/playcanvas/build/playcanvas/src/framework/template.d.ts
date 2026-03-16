/**
 * @import { AppBase } from './app-base.js'
 * @import { Entity } from './entity.js'
 */
/**
 * Create a Template resource from raw database data.
 */
export class Template {
    /**
     * Create a new Template instance.
     *
     * @param {AppBase} app - The application.
     * @param {object} data - Asset data from the database.
     */
    constructor(app: AppBase, data: object);
    /**
     * @type {AppBase}
     * @private
     */
    private _app;
    /** @private */
    private _data;
    /**
     * @type {Entity|null}
     * @private
     */
    private _templateRoot;
    /**
     * Create an instance of this template.
     *
     * @returns {Entity} The root entity of the created instance.
     */
    instantiate(): Entity;
    /** @private */
    private _parseTemplate;
    set data(value: any);
    get data(): any;
}
import type { Entity } from './entity.js';
import type { AppBase } from './app-base.js';
