declare const _default: "\nfloat getSpotEffect(vec3 lightSpotDir, float lightInnerConeAngle, float lightOuterConeAngle, vec3 lightDirNorm) {\n    float cosAngle = dot(lightDirNorm, lightSpotDir);\n    return smoothstep(lightOuterConeAngle, lightInnerConeAngle, cosAngle);\n}\n";
export default _default;
