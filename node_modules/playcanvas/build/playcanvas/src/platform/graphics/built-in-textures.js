import { PIXELFORMAT_RGBA8 } from './constants.js';
import { DeviceCache } from './device-cache.js';
import { Texture } from './texture.js';

const textureData = {
		white: [
				255,
				255,
				255,
				255
		],
		gray: [
				128,
				128,
				128,
				255
		],
		black: [
				0,
				0,
				0,
				255
		],
		normal: [
				128,
				128,
				255,
				255
		],
		pink: [
				255,
				128,
				255,
				255
		]
};
class BuiltInTextures {
		destroy() {
				this.map.forEach((texture)=>{
						texture.destroy();
				});
		}
		constructor(){
				this.map = new Map();
		}
}
const deviceCache = new DeviceCache();
const getBuiltInTexture = (device, name)=>{
		const cache = deviceCache.get(device, ()=>{
				return new BuiltInTextures();
		});
		if (!cache.map.has(name)) {
				const texture = new Texture(device, {
						name: `built-in-texture-${name}`,
						width: 1,
						height: 1,
						format: PIXELFORMAT_RGBA8
				});
				const pixels = texture.lock();
				const data = textureData[name];
				pixels.set(data);
				texture.unlock();
				cache.map.set(name, texture);
		}
		return cache.map.get(name);
};

export { getBuiltInTexture };
