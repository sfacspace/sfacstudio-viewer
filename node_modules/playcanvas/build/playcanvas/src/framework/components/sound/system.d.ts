/**
 * Manages creation of {@link SoundComponent}s.
 *
 * @category Sound
 */
export class SoundComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof SoundComponent;
    DataType: typeof SoundComponentData;
    schema: string[];
    /**
     * Gets / sets the sound manager.
     *
     * @type {SoundManager}
     */
    manager: SoundManager;
    /**
     * Sets the volume for the entire Sound system. All sounds will have their volume multiplied by
     * this value. Valid range is between 0 and 1. Defaults to 1.
     *
     * @type {number}
     */
    set volume(volume: number);
    /**
     * Gets the volume for the entire Sound system.
     *
     * @type {number}
     */
    get volume(): number;
    /**
     * Gets the AudioContext currently used by the sound manager. Requires Web Audio API support.
     * Returns null if the device does not support the Web Audio API.
     *
     * @type {AudioContext|null}
     */
    get context(): AudioContext | null;
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): Component;
    onUpdate(dt: any): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { SoundComponent } from './component.js';
import { SoundComponentData } from './data.js';
import type { SoundManager } from '../../../platform/sound/manager.js';
import { Component } from '../component.js';
