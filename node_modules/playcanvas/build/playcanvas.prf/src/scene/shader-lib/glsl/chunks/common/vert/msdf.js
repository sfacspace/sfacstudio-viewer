var msdfVS = `
attribute vec3 vertex_outlineParameters;
attribute vec3 vertex_shadowParameters;
varying vec4 outline_color;
varying float outline_thickness;
varying vec4 shadow_color;
varying vec2 shadow_offset;
void unpackMsdfParams() {
	vec3 little = mod(vertex_outlineParameters, 256.);
	vec3 big = (vertex_outlineParameters - little) / 256.;
	outline_color.rb = little.xy / 255.;
	outline_color.ga = big.xy / 255.;
	outline_thickness = little.z / 255. * 0.2;
	little = mod(vertex_shadowParameters, 256.);
	big = (vertex_shadowParameters - little) / 256.;
	shadow_color.rb = little.xy / 255.;
	shadow_color.ga = big.xy / 255.;
	shadow_offset = (vec2(little.z, big.z) / 127. - 1.) * 0.005;
}
`;

export { msdfVS as default };
