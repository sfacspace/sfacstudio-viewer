/**
 * @import { AnimComponentSystem } from './anim/system.js'
 * @import { AnimationComponentSystem } from './animation/system.js'
 * @import { AudioListenerComponentSystem } from './audio-listener/system.js'
 * @import { ButtonComponentSystem } from './button/system.js'
 * @import { CameraComponentSystem } from './camera/system.js'
 * @import { CollisionComponentSystem } from './collision/system.js'
 * @import { ElementComponentSystem } from './element/system.js'
 * @import { GSplatComponentSystem } from './gsplat/system.js'
 * @import { JointComponentSystem } from './joint/system.js'
 * @import { LayoutChildComponentSystem } from './layout-child/system.js'
 * @import { LayoutGroupComponentSystem } from './layout-group/system.js'
 * @import { LightComponentSystem } from './light/system.js'
 * @import { ModelComponentSystem } from './model/system.js'
 * @import { ParticleSystemComponentSystem } from './particle-system/system.js'
 * @import { RenderComponentSystem } from './render/system.js'
 * @import { RigidBodyComponentSystem } from './rigid-body/system.js'
 * @import { ScreenComponentSystem } from './screen/system.js'
 * @import { ScriptComponentSystem } from './script/system.js'
 * @import { ScrollViewComponentSystem } from './scroll-view/system.js'
 * @import { ScrollbarComponentSystem } from './scrollbar/system.js'
 * @import { SoundComponentSystem } from './sound/system.js'
 * @import { SpriteComponentSystem } from './sprite/system.js'
 * @import { ZoneComponentSystem } from './zone/system.js'
 */
/**
 * The ComponentSystemRegistry manages the instances of an application's {@link ComponentSystem}s.
 * {@link AppBase} maintains a single instance of this class which can be accessed via
 * {@link AppBase#systems}.
 *
 * ```javascript
 * // Set the gravity to zero
 * app.systems.rigidbody.gravity = new pc.Vec3(0, 0, 0);
 *
 * // Set the volume to 50%
 * app.systems.sound.volume = 0.5;
 * ```
 */
export class ComponentSystemRegistry extends EventHandler {
    /**
     * Gets the {@link AnimComponentSystem} from the registry.
     *
     * @type {AnimComponentSystem|undefined}
     * @readonly
     */
    readonly anim: AnimComponentSystem | undefined;
    /**
     * Gets the {@link AnimationComponentSystem} from the registry.
     *
     * @type {AnimationComponentSystem|undefined}
     * @readonly
     */
    readonly animation: AnimationComponentSystem | undefined;
    /**
     * Gets the {@link AudioListenerComponentSystem} from the registry.
     *
     * @type {AudioListenerComponentSystem|undefined}
     * @readonly
     */
    readonly audiolistener: AudioListenerComponentSystem | undefined;
    /**
     * Gets the {@link ButtonComponentSystem} from the registry.
     *
     * @type {ButtonComponentSystem|undefined}
     * @readonly
     */
    readonly button: ButtonComponentSystem | undefined;
    /**
     * Gets the {@link CameraComponentSystem} from the registry.
     *
     * @type {CameraComponentSystem|undefined}
     * @readonly
     */
    readonly camera: CameraComponentSystem | undefined;
    /**
     * Gets the {@link CollisionComponentSystem} from the registry.
     *
     * @type {CollisionComponentSystem|undefined}
     * @readonly
     */
    readonly collision: CollisionComponentSystem | undefined;
    /**
     * Gets the {@link ElementComponentSystem} from the registry.
     *
     * @type {ElementComponentSystem|undefined}
     * @readonly
     */
    readonly element: ElementComponentSystem | undefined;
    /**
     * Gets the {@link GSplatComponentSystem} from the registry.
     *
     * @type {GSplatComponentSystem|undefined}
     * @readonly
     */
    readonly gsplat: GSplatComponentSystem | undefined;
    /**
     * Gets the {@link JointComponentSystem} from the registry.
     *
     * @type {JointComponentSystem|undefined}
     * @readonly
     * @ignore
     */
    readonly joint: JointComponentSystem | undefined;
    /**
     * Gets the {@link LayoutChildComponentSystem} from the registry.
     *
     * @type {LayoutChildComponentSystem|undefined}
     * @readonly
     */
    readonly layoutchild: LayoutChildComponentSystem | undefined;
    /**
     * Gets the {@link LayoutGroupComponentSystem} from the registry.
     *
     * @type {LayoutGroupComponentSystem|undefined}
     * @readonly
     */
    readonly layoutgroup: LayoutGroupComponentSystem | undefined;
    /**
     * Gets the {@link LightComponentSystem} from the registry.
     *
     * @type {LightComponentSystem|undefined}
     * @readonly
     */
    readonly light: LightComponentSystem | undefined;
    /**
     * Gets the {@link ModelComponentSystem} from the registry.
     *
     * @type {ModelComponentSystem|undefined}
     * @readonly
     */
    readonly model: ModelComponentSystem | undefined;
    /**
     * Gets the {@link ParticleSystemComponentSystem} from the registry.
     *
     * @type {ParticleSystemComponentSystem|undefined}
     * @readonly
     */
    readonly particlesystem: ParticleSystemComponentSystem | undefined;
    /**
     * Gets the {@link RenderComponentSystem} from the registry.
     *
     * @type {RenderComponentSystem|undefined}
     * @readonly
     */
    readonly render: RenderComponentSystem | undefined;
    /**
     * Gets the {@link RigidBodyComponentSystem} from the registry.
     *
     * @type {RigidBodyComponentSystem|undefined}
     * @readonly
     */
    readonly rigidbody: RigidBodyComponentSystem | undefined;
    /**
     * Gets the {@link ScreenComponentSystem} from the registry.
     *
     * @type {ScreenComponentSystem|undefined}
     * @readonly
     */
    readonly screen: ScreenComponentSystem | undefined;
    /**
     * Gets the {@link ScriptComponentSystem} from the registry.
     *
     * @type {ScriptComponentSystem|undefined}
     * @readonly
     */
    readonly script: ScriptComponentSystem | undefined;
    /**
     * Gets the {@link ScrollbarComponentSystem} from the registry.
     *
     * @type {ScrollbarComponentSystem|undefined}
     * @readonly
     */
    readonly scrollbar: ScrollbarComponentSystem | undefined;
    /**
     * Gets the {@link ScrollViewComponentSystem} from the registry.
     *
     * @type {ScrollViewComponentSystem|undefined}
     * @readonly
     */
    readonly scrollview: ScrollViewComponentSystem | undefined;
    /**
     * Gets the {@link SoundComponentSystem} from the registry.
     *
     * @type {SoundComponentSystem|undefined}
     * @readonly
     */
    readonly sound: SoundComponentSystem | undefined;
    /**
     * Gets the {@link SpriteComponentSystem} from the registry.
     *
     * @type {SpriteComponentSystem|undefined}
     * @readonly
     */
    readonly sprite: SpriteComponentSystem | undefined;
    /**
     * Gets the {@link ZoneComponentSystem} from the registry.
     *
     * @type {ZoneComponentSystem|undefined}
     * @readonly
     * @ignore
     */
    readonly zone: ZoneComponentSystem | undefined;
    list: any[];
    /**
     * Add a component system to the registry.
     *
     * @param {object} system - The {@link ComponentSystem} instance.
     * @ignore
     */
    add(system: object): void;
    /**
     * Remove a component system from the registry.
     *
     * @param {object} system - The {@link ComponentSystem} instance.
     * @ignore
     */
    remove(system: object): void;
    destroy(): void;
}
import { EventHandler } from '../../core/event-handler.js';
import type { AnimComponentSystem } from './anim/system.js';
import type { AnimationComponentSystem } from './animation/system.js';
import type { AudioListenerComponentSystem } from './audio-listener/system.js';
import type { ButtonComponentSystem } from './button/system.js';
import type { CameraComponentSystem } from './camera/system.js';
import type { CollisionComponentSystem } from './collision/system.js';
import type { ElementComponentSystem } from './element/system.js';
import type { GSplatComponentSystem } from './gsplat/system.js';
import type { JointComponentSystem } from './joint/system.js';
import type { LayoutChildComponentSystem } from './layout-child/system.js';
import type { LayoutGroupComponentSystem } from './layout-group/system.js';
import type { LightComponentSystem } from './light/system.js';
import type { ModelComponentSystem } from './model/system.js';
import type { ParticleSystemComponentSystem } from './particle-system/system.js';
import type { RenderComponentSystem } from './render/system.js';
import type { RigidBodyComponentSystem } from './rigid-body/system.js';
import type { ScreenComponentSystem } from './screen/system.js';
import type { ScriptComponentSystem } from './script/system.js';
import type { ScrollbarComponentSystem } from './scrollbar/system.js';
import type { ScrollViewComponentSystem } from './scroll-view/system.js';
import type { SoundComponentSystem } from './sound/system.js';
import type { SpriteComponentSystem } from './sprite/system.js';
import type { ZoneComponentSystem } from './zone/system.js';
