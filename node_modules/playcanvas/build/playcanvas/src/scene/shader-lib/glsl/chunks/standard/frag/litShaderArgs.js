var litShaderArgsPS = `
vec3 litArgs_albedo;
float litArgs_opacity;
vec3 litArgs_emission;
vec3 litArgs_worldNormal;
float litArgs_ao;
vec3 litArgs_lightmap;
vec3 litArgs_lightmapDir;
float litArgs_metalness;
vec3 litArgs_specularity;
float litArgs_specularityFactor;
float litArgs_gloss;
float litArgs_sheen_gloss;
vec3 litArgs_sheen_specularity;
float litArgs_transmission;
float litArgs_thickness;
float litArgs_ior;
float litArgs_dispersion;
float litArgs_iridescence_intensity;
float litArgs_iridescence_thickness;
vec3 litArgs_clearcoat_worldNormal;
float litArgs_clearcoat_specularity;
float litArgs_clearcoat_gloss;
`;

export { litShaderArgsPS as default };
