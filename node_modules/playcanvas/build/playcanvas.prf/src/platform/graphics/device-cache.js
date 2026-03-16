class DeviceCache {
		get(device, onCreate) {
				if (!this._cache.has(device)) {
						this._cache.set(device, onCreate());
						device.on('destroy', ()=>{
								this.remove(device);
						});
						device.on('devicelost', ()=>{
								this._cache.get(device)?.loseContext?.(device);
						});
				}
				return this._cache.get(device);
		}
		remove(device) {
				this._cache.get(device)?.destroy?.(device);
				this._cache.delete(device);
		}
		constructor(){
				this._cache = new Map();
		}
}

export { DeviceCache };
