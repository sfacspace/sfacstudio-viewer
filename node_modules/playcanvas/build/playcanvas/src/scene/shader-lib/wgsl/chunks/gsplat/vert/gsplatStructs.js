var gsplatStructsVS = `
struct SplatSource {
	order: u32,
	id: u32,
	uv: vec2<i32>,
	cornerUV: vec2f,
}
struct SplatCenter {
	view: vec3f,
	proj: vec4f,
	modelView: mat4x4f,
	projMat00: f32,
	modelCenterOriginal: vec3f,
	modelCenterModified: vec3f,
}
struct SplatCorner {
	offset: vec2f,
	uv: vec2f,
	#if GSPLAT_AA
		aaFactor: f32,
	#endif
}
`;

export { gsplatStructsVS as default };
