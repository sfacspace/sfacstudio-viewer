declare const _default: "\n    gl_FragColor.rgb = combineColor(litArgs_albedo, litArgs_sheen_specularity, litArgs_clearcoat_specularity);\n\n    gl_FragColor.rgb += litArgs_emission;\n    gl_FragColor.rgb = addFog(gl_FragColor.rgb);\n    gl_FragColor.rgb = toneMap(gl_FragColor.rgb);\n    gl_FragColor.rgb = gammaCorrectOutput(gl_FragColor.rgb);\n";
export default _default;
