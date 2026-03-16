var tonemappingAces2PS = `
uniform exposure: f32;
const ACESInputMat: mat3x3f = mat3x3f(
	vec3f(0.59719, 0.35458, 0.04823),
	vec3f(0.07600, 0.90834, 0.01566),
	vec3f(0.02840, 0.13383, 0.83777)
);
const ACESOutputMat: mat3x3f = mat3x3f(
	vec3f( 1.60475, -0.53108, -0.07367),
	vec3f(-0.10208,  1.10813, -0.00605),
	vec3f(-0.00327, -0.07276,  1.07602)
);
fn RRTAndODTFit(v: vec3f) -> vec3f {
	let a: vec3f = v * (v + vec3f(0.0245786)) - vec3f(0.000090537);
	let b: vec3f = v * (vec3f(0.983729) * v + vec3f(0.4329510)) + vec3f(0.238081);
	return a / b;
}
fn toneMap(color: vec3f) -> vec3f {
	var c: vec3f = color * (uniform.exposure / 0.6);
	c = c * ACESInputMat;
	c = RRTAndODTFit(c);
	c = c * ACESOutputMat;
	return clamp(c, vec3f(0.0), vec3f(1.0));
}
`;

export { tonemappingAces2PS as default };
