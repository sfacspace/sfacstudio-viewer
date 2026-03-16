declare const _default: "\n    float depth = getLinearScreenDepth();\n    float particleDepth = vDepth;\n    float depthDiff = saturate(abs(particleDepth - depth) * softening);\n    a *= depthDiff;\n";
export default _default;
