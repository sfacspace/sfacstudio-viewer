var particle_endVS = /* wgsl */ `
    localPos = localPos * scale * uniform.emitterScale;
    localPos = localPos + particlePos;

    #ifdef SCREEN_SPACE
        output.position = vec4f(localPos.x, localPos.y, 0.0, 1.0);
    #else
        output.position = uniform.matrix_viewProjection * vec4f(localPos.xyz, 1.0);
    #endif
`;

export { particle_endVS as default };
