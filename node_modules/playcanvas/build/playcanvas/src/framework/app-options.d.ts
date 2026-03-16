/**
 * @import { BatchManager } from '../scene/batching/batch-manager.js'
 * @import { ComponentSystem } from './components/system.js'
 * @import { ElementInput } from './input/element-input.js'
 * @import { GamePads } from '../platform/input/game-pads.js'
 * @import { GraphicsDevice } from '../platform/graphics/graphics-device.js'
 * @import { Keyboard } from '../platform/input/keyboard.js'
 * @import { Lightmapper } from './lightmapper/lightmapper.js'
 * @import { Mouse } from '../platform/input/mouse.js'
 * @import { ResourceHandler } from './handlers/handler.js'
 * @import { SoundManager } from '../platform/sound/manager.js'
 * @import { TouchDevice } from '../platform/input/touch-device.js'
 * @import { XrManager } from './xr/xr-manager.js'
 */
/**
 * AppOptions holds configuration settings utilized in the creation of an {@link AppBase} instance.
 * It allows functionality to be included or excluded from the AppBase instance.
 */
export class AppOptions {
    /**
     * Input handler for {@link ElementComponent}s.
     *
     * @type {ElementInput}
     */
    elementInput: ElementInput;
    /**
     * Keyboard handler for input.
     *
     * @type {Keyboard}
     */
    keyboard: Keyboard;
    /**
     * Mouse handler for input.
     *
     * @type {Mouse}
     */
    mouse: Mouse;
    /**
     * TouchDevice handler for input.
     *
     * @type {TouchDevice}
     */
    touch: TouchDevice;
    /**
     * Gamepad handler for input.
     *
     * @type {GamePads}
     */
    gamepads: GamePads;
    /**
     * Prefix to apply to script urls before loading.
     *
     * @type {string}
     */
    scriptPrefix: string;
    /**
     * Prefix to apply to asset urls before loading.
     *
     * @type {string}
     */
    assetPrefix: string;
    /**
     * Scripts in order of loading first.
     *
     * @type {string[]}
     */
    scriptsOrder: string[];
    /**
     * The sound manager
     *
     * @type {SoundManager}
     */
    soundManager: SoundManager;
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    graphicsDevice: GraphicsDevice;
    /**
     * The lightmapper.
     *
     * @type {typeof Lightmapper}
     */
    lightmapper: typeof Lightmapper;
    /**
     * The BatchManager.
     *
     * @type {typeof BatchManager}
     */
    batchManager: typeof BatchManager;
    /**
     * The XrManager.
     *
     * @type {typeof XrManager}
     */
    xr: typeof XrManager;
    /**
     * The component systems the app requires.
     *
     * @type {typeof ComponentSystem[]}
     */
    componentSystems: (typeof ComponentSystem)[];
    /**
     * The resource handlers the app requires.
     *
     * @type {typeof ResourceHandler[]}
     */
    resourceHandlers: (typeof ResourceHandler)[];
}
import type { ElementInput } from './input/element-input.js';
import type { Keyboard } from '../platform/input/keyboard.js';
import type { Mouse } from '../platform/input/mouse.js';
import type { TouchDevice } from '../platform/input/touch-device.js';
import type { GamePads } from '../platform/input/game-pads.js';
import type { SoundManager } from '../platform/sound/manager.js';
import type { GraphicsDevice } from '../platform/graphics/graphics-device.js';
import type { Lightmapper } from './lightmapper/lightmapper.js';
import type { BatchManager } from '../scene/batching/batch-manager.js';
import type { XrManager } from './xr/xr-manager.js';
import type { ComponentSystem } from './components/system.js';
import type { ResourceHandler } from './handlers/handler.js';
