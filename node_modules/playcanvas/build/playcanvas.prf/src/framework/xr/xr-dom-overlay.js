import { platform } from '../../core/platform.js';

class XrDomOverlay {
		get supported() {
				return this._supported;
		}
		get available() {
				return this._supported && this._manager.active && this._manager._session.domOverlayState !== null;
		}
		get state() {
				if (!this._supported || !this._manager.active || !this._manager._session.domOverlayState) {
						return null;
				}
				return this._manager._session.domOverlayState.type;
		}
		set root(value) {
				if (!this._supported || this._manager.active) {
						return;
				}
				this._root = value;
		}
		get root() {
				return this._root;
		}
		constructor(manager){
				this._supported = platform.browser && !!window.XRDOMOverlayState;
				this._root = null;
				this._manager = manager;
		}
}

export { XrDomOverlay };
