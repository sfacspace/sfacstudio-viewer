declare const _default: "\n    localPos = localPos * scale * uniform.emitterScale;\n    localPos = localPos + particlePos;\n\n    #ifdef SCREEN_SPACE\n        output.position = vec4f(localPos.x, localPos.y, 0.0, 1.0);\n    #else\n        output.position = uniform.matrix_viewProjection * vec4f(localPos.xyz, 1.0);\n    #endif\n";
export default _default;
