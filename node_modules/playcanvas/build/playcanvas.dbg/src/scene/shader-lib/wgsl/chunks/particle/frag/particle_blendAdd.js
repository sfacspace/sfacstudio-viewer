var particle_blendAddPS = /* wgsl */ `
    dBlendModeFogFactor = 0.0;
    rgb = rgb * saturate(gammaCorrectInput(max(a, 0.0)));
    if ((rgb.r + rgb.g + rgb.b) < 0.000001) {
        discard;
    }    
`;

export { particle_blendAddPS as default };
