var envAtlasPS = `
#ifndef _ENVATLAS_INCLUDED_
#define _ENVATLAS_INCLUDED_
const atlasSize : f32 = 512.0;
const seamSize : f32 = 1.0 / atlasSize;
fn mapUv(uv : vec2f, rect : vec4f) -> vec2f {
	return vec2f(mix(rect.x + seamSize, rect.x + rect.z - seamSize, uv.x),
				 mix(rect.y + seamSize, rect.y + rect.w - seamSize, uv.y));
}
fn mapRoughnessUv(uv : vec2f, level : f32) -> vec2f {
	let t : f32 = 1.0 / exp2(level);
	return mapUv(uv, vec4f(0.0, 1.0 - t, t, t * 0.5));
}
fn mapShinyUv(uv : vec2f, level : f32) -> vec2f {
	let t : f32 = 1.0 / exp2(level);
	return mapUv(uv, vec4f(1.0 - t, 1.0 - t, t, t * 0.5));
}
#endif
`;

export { envAtlasPS as default };
