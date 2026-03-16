var litShaderArgsPS = `
var<private> litArgs_albedo: vec3f;
var<private> litArgs_opacity: f32;
var<private> litArgs_emission: vec3f;
var<private> litArgs_worldNormal: vec3f;
var<private> litArgs_ao: f32;
var<private> litArgs_lightmap: vec3f;
var<private> litArgs_lightmapDir: vec3f;
var<private> litArgs_metalness: f32;
var<private> litArgs_specularity: vec3f;
var<private> litArgs_specularityFactor: f32;
var<private> litArgs_gloss: f32;
var<private> litArgs_sheen_gloss: f32;
var<private> litArgs_sheen_specularity: vec3f;
var<private> litArgs_transmission: f32;
var<private> litArgs_thickness: f32;
var<private> litArgs_ior: f32;
var<private> litArgs_dispersion: f32;
var<private> litArgs_iridescence_intensity: f32;
var<private> litArgs_iridescence_thickness: f32;
var<private> litArgs_clearcoat_worldNormal: vec3f;
var<private> litArgs_clearcoat_specularity: f32;
var<private> litArgs_clearcoat_gloss: f32;
`;

export { litShaderArgsPS as default };
