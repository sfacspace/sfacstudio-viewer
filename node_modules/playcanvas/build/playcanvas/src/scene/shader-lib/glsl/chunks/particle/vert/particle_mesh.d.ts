declare const _default: "\n    vec3 localPos = meshLocalPos;\n    localPos.xy = rotate(localPos.xy, inAngle, rotMatrix);\n    localPos.yz = rotate(localPos.yz, inAngle, rotMatrix);\n\n    billboard(particlePos, quadXY);\n";
export default _default;
