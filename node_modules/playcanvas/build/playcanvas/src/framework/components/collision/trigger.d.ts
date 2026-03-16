/**
 * Creates a trigger object used to create internal physics objects that interact with rigid bodies
 * and trigger collision events with no collision response.
 */
export class Trigger {
    /**
     * Create a new Trigger instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @param {Component} component - The component for which the trigger will be created.
     * @param {object} data - The data for the component.
     */
    constructor(app: AppBase, component: Component, data: object);
    entity: import("../../entity.js").Entity;
    component: Component;
    app: AppBase;
    initialize(data: any): void;
    body: any;
    destroy(): void;
    _getEntityTransform(transform: any): void;
    updateTransform(): void;
    enable(): void;
    disable(): void;
}
import type { Component } from '../component.js';
import type { AppBase } from '../../app-base.js';
