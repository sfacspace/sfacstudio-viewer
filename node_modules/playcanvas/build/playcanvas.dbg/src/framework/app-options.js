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
 */ /**
 * AppOptions holds configuration settings utilized in the creation of an {@link AppBase} instance.
 * It allows functionality to be included or excluded from the AppBase instance.
 */ class AppOptions {
    constructor(){
        /**
     * The component systems the app requires.
     *
     * @type {typeof ComponentSystem[]}
     */ this.componentSystems = [];
        /**
     * The resource handlers the app requires.
     *
     * @type {typeof ResourceHandler[]}
     */ this.resourceHandlers = [];
    }
}

export { AppOptions };
