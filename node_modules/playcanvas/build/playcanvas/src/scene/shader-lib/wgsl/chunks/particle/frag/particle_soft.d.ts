declare const _default: "\n    var depth: f32 = getLinearScreenDepthFrag();\n    var particleDepth: f32 = vDepth;\n    var depthDiff: f32 = saturate(abs(particleDepth - depth) * uniform.softening);\n    a = a * depthDiff;\n";
export default _default;
