declare const _default: "\n#ifdef CUBEMAP_ROTATION\nuniform mat3 cubeMapRotationMatrix;\n#endif\n\nvec3 cubeMapRotate(vec3 refDir) {\n#ifdef CUBEMAP_ROTATION\n    return refDir * cubeMapRotationMatrix;\n#else\n    return refDir;\n#endif\n}\n";
export default _default;
