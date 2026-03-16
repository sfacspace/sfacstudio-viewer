import { blueNoiseData } from '../../core/math/blue-noise.js';
import { FILTER_NEAREST, TEXTURETYPE_DEFAULT, ADDRESS_REPEAT, PIXELFORMAT_RGBA8 } from '../../platform/graphics/constants.js';
import { DeviceCache } from '../../platform/graphics/device-cache.js';
import { Texture } from '../../platform/graphics/texture.js';

const createTexture = (device, namePrefix, size, data)=>{
		const texture = new Texture(device, {
				name: `${namePrefix}${size}`,
				width: size,
				height: size,
				format: PIXELFORMAT_RGBA8,
				addressU: ADDRESS_REPEAT,
				addressV: ADDRESS_REPEAT,
				type: TEXTURETYPE_DEFAULT,
				magFilter: FILTER_NEAREST,
				minFilter: FILTER_NEAREST,
				anisotropy: 1,
				mipmaps: false
		});
		texture.lock().set(data);
		texture.unlock();
		return texture;
};
const deviceCacheBlueNoise = new DeviceCache();
const getBlueNoiseTexture = (device)=>{
		return deviceCacheBlueNoise.get(device, ()=>{
				const data = blueNoiseData();
				const size = Math.sqrt(data.length / 4);
				return createTexture(device, 'BlueNoise', size, data);
		});
};

export { getBlueNoiseTexture };
