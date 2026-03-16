declare const _default: "\n    var finalRgb: vec3f = combineColor(litArgs_albedo, litArgs_sheen_specularity, litArgs_clearcoat_specularity);\n\n    finalRgb = finalRgb + litArgs_emission;\n    finalRgb = addFog(finalRgb);\n    finalRgb = toneMap(finalRgb);\n    finalRgb = gammaCorrectOutput(finalRgb);\n    output.color = vec4f(finalRgb, output.color.a);\n";
export default _default;
