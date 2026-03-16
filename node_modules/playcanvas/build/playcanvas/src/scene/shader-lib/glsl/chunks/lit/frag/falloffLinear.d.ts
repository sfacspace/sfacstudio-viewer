declare const _default: "\nfloat getFalloffLinear(float lightRadius, vec3 lightDir) {\n    float d = length(lightDir);\n    return max(((lightRadius - d) / lightRadius), 0.0);\n}\n";
export default _default;
