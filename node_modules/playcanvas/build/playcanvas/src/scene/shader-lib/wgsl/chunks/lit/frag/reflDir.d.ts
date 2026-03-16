declare const _default: "\nfn getReflDir(worldNormal: vec3f, viewDir: vec3f, gloss: f32, tbn: mat3x3f) {\n    dReflDirW = normalize(-reflect(viewDir, worldNormal));\n}\n";
export default _default;
