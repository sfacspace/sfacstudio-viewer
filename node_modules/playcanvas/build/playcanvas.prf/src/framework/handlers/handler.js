class ResourceHandler {
		set maxRetries(value) {
				this._maxRetries = value;
		}
		get maxRetries() {
				return this._maxRetries;
		}
		load(url, callback, asset) {}
		open(url, data, asset) {
				return data;
		}
		patch(asset, assets) {}
		constructor(app, handlerType){
				this.handlerType = '';
				this._maxRetries = 0;
				this._app = app;
				this.handlerType = handlerType;
		}
}

export { ResourceHandler };
