var particle_halflambertPS = /* wgsl */ `
    var negNormal: vec3f = normal * 0.5 + 0.5;
    var posNormal: vec3f = -normal * 0.5 + 0.5;
    negNormal = negNormal * negNormal;
    posNormal = posNormal * posNormal;
`;

export { particle_halflambertPS as default };
