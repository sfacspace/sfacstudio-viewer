var particle_normalVS = `
output.Normal = normalize(localPos + uniform.matrix_viewInverse[2].xyz);
`;

export { particle_normalVS as default };
