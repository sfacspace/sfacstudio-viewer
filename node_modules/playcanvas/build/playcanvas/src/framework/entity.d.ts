/**
 * The Entity is a core primitive of a PlayCanvas application. Generally speaking, any object in
 * your application will be represented by an Entity, along with a set of {@link Component}s. Each
 * component enables a particular capability. For example, the {@link RenderComponent} enables an
 * entity to render a 3D model, and the {@link ScriptComponent} enables an entity to run code that
 * implements custom behavior.
 *
 * Entity is a subclass of {@link GraphNode} which allows entities to form a tree-like hierarchy
 * (based on parent/child relationships). The root of the entity hierarchy can be queried with
 * {@link AppBase#root}. Entities inherit a 3D transform from {@link GraphNode} which allows them
 * to be positioned, rotated and scaled.
 */
export class Entity extends GraphNode {
    /**
     * Fired after the entity is destroyed.
     *
     * @event
     * @example
     * entity.on('destroy', (e) => {
     *     console.log(`Entity ${e.name} has been destroyed`);
     * });
     */
    static EVENT_DESTROY: string;
    /**
     * Create a new Entity.
     *
     * @param {string} [name] - The non-unique name of the entity, default is "Untitled".
     * @param {AppBase} [app] - The application the entity belongs to, default is the current
     * application.
     * @example
     * const entity = new pc.Entity();
     *
     * // Add a Component to the Entity
     * entity.addComponent('camera', {
     *     fov: 45,
     *     nearClip: 1,
     *     farClip: 10000
     * });
     *
     * // Add the Entity into the scene graph
     * app.root.addChild(entity);
     *
     * // Move the entity
     * entity.translate(10, 0, 0);
     *
     * // Or translate it by setting its position directly
     * const p = entity.getPosition();
     * entity.setPosition(p.x + 10, p.y, p.z);
     *
     * // Change the entity's rotation in local space
     * const e = entity.getLocalEulerAngles();
     * entity.setLocalEulerAngles(e.x, e.y + 90, e.z);
     *
     * // Or use rotateLocal
     * entity.rotateLocal(0, 90, 0);
     */
    constructor(name?: string, app?: AppBase);
    /**
     * Gets the {@link AnimComponent} attached to this entity.
     *
     * @type {AnimComponent|undefined}
     * @readonly
     */
    readonly anim: AnimComponent | undefined;
    /**
     * Gets the {@link AnimationComponent} attached to this entity.
     *
     * @type {AnimationComponent|undefined}
     * @readonly
     */
    readonly animation: AnimationComponent | undefined;
    /**
     * Gets the {@link AudioListenerComponent} attached to this entity.
     *
     * @type {AudioListenerComponent|undefined}
     * @readonly
     */
    readonly audiolistener: AudioListenerComponent | undefined;
    /**
     * Gets the {@link ButtonComponent} attached to this entity.
     *
     * @type {ButtonComponent|undefined}
     * @readonly
     */
    readonly button: ButtonComponent | undefined;
    /**
     * Gets the {@link CameraComponent} attached to this entity.
     *
     * @type {CameraComponent|undefined}
     * @readonly
     */
    readonly camera: CameraComponent | undefined;
    /**
     * Gets the {@link CollisionComponent} attached to this entity.
     *
     * @type {CollisionComponent|undefined}
     * @readonly
     */
    readonly collision: CollisionComponent | undefined;
    /**
     * Gets the {@link ElementComponent} attached to this entity.
     *
     * @type {ElementComponent|undefined}
     * @readonly
     */
    readonly element: ElementComponent | undefined;
    /**
     * Gets the {@link GSplatComponent} attached to this entity.
     *
     * @type {GSplatComponent|undefined}
     * @readonly
     */
    readonly gsplat: GSplatComponent | undefined;
    /**
     * Gets the {@link LayoutChildComponent} attached to this entity.
     *
     * @type {LayoutChildComponent|undefined}
     * @readonly
     */
    readonly layoutchild: LayoutChildComponent | undefined;
    /**
     * Gets the {@link LayoutGroupComponent} attached to this entity.
     *
     * @type {LayoutGroupComponent|undefined}
     * @readonly
     */
    readonly layoutgroup: LayoutGroupComponent | undefined;
    /**
     * Gets the {@link LightComponent} attached to this entity.
     *
     * @type {LightComponent|undefined}
     * @readonly
     */
    readonly light: LightComponent | undefined;
    /**
     * Gets the {@link ModelComponent} attached to this entity.
     *
     * @type {ModelComponent|undefined}
     * @readonly
     */
    readonly model: ModelComponent | undefined;
    /**
     * Gets the {@link ParticleSystemComponent} attached to this entity.
     *
     * @type {ParticleSystemComponent|undefined}
     * @readonly
     */
    readonly particlesystem: ParticleSystemComponent | undefined;
    /**
     * Gets the {@link RenderComponent} attached to this entity.
     *
     * @type {RenderComponent|undefined}
     * @readonly
     */
    readonly render: RenderComponent | undefined;
    /**
     * Gets the {@link RigidBodyComponent} attached to this entity.
     *
     * @type {RigidBodyComponent|undefined}
     * @readonly
     */
    readonly rigidbody: RigidBodyComponent | undefined;
    /**
     * Gets the {@link ScreenComponent} attached to this entity.
     *
     * @type {ScreenComponent|undefined}
     * @readonly
     */
    readonly screen: ScreenComponent | undefined;
    /**
     * Gets the {@link ScriptComponent} attached to this entity.
     *
     * @type {ScriptComponent|undefined}
     * @readonly
     */
    readonly script: ScriptComponent | undefined;
    /**
     * Gets the {@link ScrollbarComponent} attached to this entity.
     *
     * @type {ScrollbarComponent|undefined}
     * @readonly
     */
    readonly scrollbar: ScrollbarComponent | undefined;
    /**
     * Gets the {@link ScrollViewComponent} attached to this entity.
     *
     * @type {ScrollViewComponent|undefined}
     * @readonly
     */
    readonly scrollview: ScrollViewComponent | undefined;
    /**
     * Gets the {@link SoundComponent} attached to this entity.
     *
     * @type {SoundComponent|undefined}
     * @readonly
     */
    readonly sound: SoundComponent | undefined;
    /**
     * Gets the {@link SpriteComponent} attached to this entity.
     *
     * @type {SpriteComponent|undefined}
     * @readonly
     */
    readonly sprite: SpriteComponent | undefined;
    /**
     * Component storage.
     *
     * @type {Object<string, Component>}
     * @ignore
     */
    c: {
        [x: string]: Component;
    };
    /**
     * @type {AppBase}
     * @private
     */
    private _app;
    /**
     * Used by component systems to speed up destruction.
     *
     * @type {boolean}
     * @ignore
     */
    _destroying: boolean;
    /**
     * @type {string|null}
     * @private
     */
    private _guid;
    /**
     * Used to differentiate between the entities of a template root instance, which have it set to
     * true, and the cloned instance entities (set to false).
     *
     * @type {boolean}
     * @ignore
     */
    _template: boolean;
    /**
     * Create a new component and add it to the entity. Use this to add functionality to the entity
     * like rendering a model, playing sounds and so on.
     *
     * @param {string} type - The name of the component to add. Valid strings are:
     *
     * - "anim" - see {@link AnimComponent}
     * - "animation" - see {@link AnimationComponent}
     * - "audiolistener" - see {@link AudioListenerComponent}
     * - "button" - see {@link ButtonComponent}
     * - "camera" - see {@link CameraComponent}
     * - "collision" - see {@link CollisionComponent}
     * - "element" - see {@link ElementComponent}
     * - "gsplat" - see {@link GSplatComponent}
     * - "layoutchild" - see {@link LayoutChildComponent}
     * - "layoutgroup" - see {@link LayoutGroupComponent}
     * - "light" - see {@link LightComponent}
     * - "model" - see {@link ModelComponent}
     * - "particlesystem" - see {@link ParticleSystemComponent}
     * - "render" - see {@link RenderComponent}
     * - "rigidbody" - see {@link RigidBodyComponent}
     * - "screen" - see {@link ScreenComponent}
     * - "script" - see {@link ScriptComponent}
     * - "scrollbar" - see {@link ScrollbarComponent}
     * - "scrollview" - see {@link ScrollViewComponent}
     * - "sound" - see {@link SoundComponent}
     * - "sprite" - see {@link SpriteComponent}
     *
     * @param {object} [data] - The initialization data for the specific component type. Refer to
     * each specific component's API reference page for details on valid values for this parameter.
     * @returns {Component|null} The new Component that was attached to the entity or null if there
     * was an error.
     * @example
     * const entity = new pc.Entity();
     *
     * // Add a light component with default properties
     * entity.addComponent("light");
     *
     * // Add a camera component with some specified properties
     * entity.addComponent("camera", {
     *     fov: 45,
     *     clearColor: new pc.Color(1, 0, 0)
     * });
     */
    addComponent(type: string, data?: object): Component | null;
    /**
     * Remove a component from the Entity.
     *
     * @param {string} type - The name of the Component type.
     * @example
     * const entity = new pc.Entity();
     * entity.addComponent("light"); // add new light component
     *
     * entity.removeComponent("light"); // remove light component
     */
    removeComponent(type: string): void;
    /**
     * Search the entity and all of its descendants for the first component of specified type.
     *
     * @param {string} type - The name of the component type to retrieve.
     * @returns {Component} A component of specified type, if the entity or any of its descendants
     * has one. Returns undefined otherwise.
     * @example
     * // Get the first found light component in the hierarchy tree that starts with this entity
     * const light = entity.findComponent("light");
     */
    findComponent(type: string): Component;
    /**
     * Search the entity and all of its descendants for all components of specified type.
     *
     * @param {string} type - The name of the component type to retrieve.
     * @returns {Component[]} All components of specified type in the entity or any of its
     * descendants. Returns empty array if none found.
     * @example
     * // Get all light components in the hierarchy tree that starts with this entity
     * const lights = entity.findComponents("light");
     */
    findComponents(type: string): Component[];
    /**
     * Search the entity and all of its descendants for the first script instance of specified type.
     *
     * @param {string|typeof ScriptType} nameOrType - The name or type of {@link ScriptType}.
     * @returns {ScriptType|undefined} A script instance of specified type, if the entity or any of
     * its descendants has one. Returns undefined otherwise.
     * @example
     * // Get the first found "playerController" instance in the hierarchy tree that starts with this entity
     * const controller = entity.findScript("playerController");
     */
    findScript(nameOrType: string | typeof ScriptType): ScriptType | undefined;
    /**
     * Search the entity and all of its descendants for all script instances of specified type.
     *
     * @param {string|typeof ScriptType} nameOrType - The name or type of {@link ScriptType}.
     * @returns {ScriptType[]} All script instances of specified type in the entity or any of its
     * descendants. Returns empty array if none found.
     * @example
     * // Get all "playerController" instances in the hierarchy tree that starts with this entity
     * const controllers = entity.findScripts("playerController");
     */
    findScripts(nameOrType: string | typeof ScriptType): ScriptType[];
    /**
     * Get the GUID value for this Entity.
     *
     * @returns {string} The GUID of the Entity.
     * @ignore
     */
    getGuid(): string;
    /**
     * Set the GUID value for this Entity. Note that it is unlikely that you should need to change
     * the GUID value of an Entity at run-time. Doing so will corrupt the graph this Entity is in.
     *
     * @param {string} guid - The GUID to assign to the Entity.
     * @ignore
     */
    setGuid(guid: string): void;
    /** @private */
    private _onHierarchyStatePostChanged;
    /**
     * Find a descendant of this entity with the GUID.
     *
     * @param {string} guid - The GUID to search for.
     * @returns {Entity|null} The entity with the matching GUID or null if no entity is found.
     */
    findByGuid(guid: string): Entity | null;
    /**
     * Create a deep copy of the Entity. Duplicate the full Entity hierarchy, with all Components
     * and all descendants. Note, this Entity is not in the hierarchy and must be added manually.
     *
     * @returns {this} A new Entity which is a deep copy of the original.
     * @example
     * const e = this.entity.clone();
     *
     * // Add clone as a sibling to the original
     * this.entity.parent.addChild(e);
     */
    clone(): this;
    _getSortedComponents(): Component[];
    /**
     * @param {Object<string, Entity>} duplicatedIdsMap - A map of original entity GUIDs to cloned
     * entities.
     * @returns {this} A new Entity which is a deep copy of the original.
     * @private
     */
    private _cloneRecursively;
}
import { GraphNode } from '../scene/graph-node.js';
import type { AnimComponent } from './components/anim/component.js';
import type { AnimationComponent } from './components/animation/component.js';
import type { AudioListenerComponent } from './components/audio-listener/component.js';
import type { ButtonComponent } from './components/button/component.js';
import type { CameraComponent } from './components/camera/component.js';
import type { CollisionComponent } from './components/collision/component.js';
import type { ElementComponent } from './components/element/component.js';
import type { GSplatComponent } from './components/gsplat/component.js';
import type { LayoutChildComponent } from './components/layout-child/component.js';
import type { LayoutGroupComponent } from './components/layout-group/component.js';
import type { LightComponent } from './components/light/component.js';
import type { ModelComponent } from './components/model/component.js';
import type { ParticleSystemComponent } from './components/particle-system/component.js';
import type { RenderComponent } from './components/render/component.js';
import type { RigidBodyComponent } from './components/rigid-body/component.js';
import type { ScreenComponent } from './components/screen/component.js';
import type { ScriptComponent } from './components/script/component.js';
import type { ScrollbarComponent } from './components/scrollbar/component.js';
import type { ScrollViewComponent } from './components/scroll-view/component.js';
import type { SoundComponent } from './components/sound/component.js';
import type { SpriteComponent } from './components/sprite/component.js';
import type { Component } from './components/component.js';
import type { ScriptType } from './script/script-type.js';
import type { AppBase } from './app-base.js';
