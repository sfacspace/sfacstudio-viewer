/**
 * The AudioListenerComponent enables an {@link Entity} to represent the point from where
 * positional {@link SoundComponent}s are heard. This is typically the main camera Entity in your
 * scene. And typically, you will only have one AudioListenerComponent in your scene.
 *
 * You should never need to use the AudioListenerComponent constructor directly. To add a
 * AudioListenerComponent to an {@link Entity}, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = new pc.Entity();
 * entity.addComponent('audiolistener');
 * ```
 *
 * Relevant Engine API examples:
 *
 * - [Positional Sound](https://playcanvas.github.io/#/sound/positional)
 *
 * @hideconstructor
 * @category Sound
 */
export class AudioListenerComponent extends Component {
    setCurrentListener(): void;
}
import { Component } from '../component.js';
