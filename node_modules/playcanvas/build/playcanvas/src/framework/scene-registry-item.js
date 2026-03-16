class SceneRegistryItem {
		get loaded() {
				return !!this.data;
		}
		get loading() {
				return this._loading;
		}
		constructor(name, url){
				this.data = null;
				this._loading = false;
				this._onLoadedCallbacks = [];
				this.name = name;
				this.url = url;
		}
}

export { SceneRegistryItem };
