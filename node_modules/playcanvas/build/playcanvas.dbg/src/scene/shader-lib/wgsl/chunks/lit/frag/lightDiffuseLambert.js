var lightDiffuseLambertPS = /* wgsl */ `
fn getLightDiffuse(worldNormal: vec3f, viewDir: vec3f, lightDirNorm: vec3f) -> f32 {
    return max(dot(worldNormal, -lightDirNorm), 0.0);
}
`;

export { lightDiffuseLambertPS as default };
