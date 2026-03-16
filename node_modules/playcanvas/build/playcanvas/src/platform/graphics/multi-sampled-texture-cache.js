import { RefCountedKeyCache } from '../../core/ref-counted-key-cache.js';
import { DeviceCache } from './device-cache.js';

class MultisampledTextureCache extends RefCountedKeyCache {
		loseContext(device) {
				this.clear();
		}
}
const multisampledTextureCache = new DeviceCache();
const getMultisampledTextureCache = (device)=>{
		return multisampledTextureCache.get(device, ()=>{
				return new MultisampledTextureCache();
		});
};

export { getMultisampledTextureCache };
