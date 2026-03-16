declare const _default: "\nfloat getLightDiffuse(vec3 worldNormal, vec3 viewDir, vec3 lightDirNorm) {\n    return max(dot(worldNormal, -lightDirNorm), 0.0);\n}\n";
export default _default;
