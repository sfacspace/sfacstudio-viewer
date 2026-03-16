var gsplatStructsVS = `
struct SplatSource {
	uint order;
	uint id;
	ivec2 uv;
	vec2 cornerUV;
};
struct SplatCenter {
	vec3 view;
	vec4 proj;
	mat4 modelView;
	float projMat00;
	vec3 modelCenterOriginal;
	vec3 modelCenterModified;
};
struct SplatCorner {
	vec2 offset;
	vec2 uv;
	#if GSPLAT_AA
		float aaFactor;
	#endif
	vec2 v;
	float dlen;
};
`;

export { gsplatStructsVS as default };
