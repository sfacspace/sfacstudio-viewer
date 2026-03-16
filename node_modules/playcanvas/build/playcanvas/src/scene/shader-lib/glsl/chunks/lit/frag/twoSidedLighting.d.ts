declare const _default: "\nuniform float twoSidedLightingNegScaleFactor;\nvoid handleTwoSidedLighting() {\n    dTBN[2] *= gl_FrontFacing ? twoSidedLightingNegScaleFactor : -twoSidedLightingNegScaleFactor;\n}\n";
export default _default;
