declare const _default: "\nuniform twoSidedLightingNegScaleFactor: f32;\n\nfn handleTwoSidedLighting() {\n    dTBN[2] = dTBN[2] * select(-uniform.twoSidedLightingNegScaleFactor, uniform.twoSidedLightingNegScaleFactor, pcFrontFacing);\n}\n";
export default _default;
