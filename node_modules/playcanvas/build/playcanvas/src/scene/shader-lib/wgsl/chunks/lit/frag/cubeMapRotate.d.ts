declare const _default: "\n#ifdef CUBEMAP_ROTATION\nuniform cubeMapRotationMatrix: mat3x3f;\n#endif\n\nfn cubeMapRotate(refDir: vec3f) -> vec3f {\n#ifdef CUBEMAP_ROTATION\n    return refDir * uniform.cubeMapRotationMatrix;\n#else\n    return refDir;\n#endif\n}\n";
export default _default;
