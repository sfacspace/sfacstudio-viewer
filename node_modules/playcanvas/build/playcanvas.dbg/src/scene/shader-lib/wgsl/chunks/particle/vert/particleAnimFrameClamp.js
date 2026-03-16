var particleAnimFrameClampVS = /* wgsl */ `
    let animFrame: f32 = min(floor(input.texCoordsAlphaLife.w * uniform.animTexParams.y) + uniform.animTexParams.x, uniform.animTexParams.z);
`;

export { particleAnimFrameClampVS as default };
