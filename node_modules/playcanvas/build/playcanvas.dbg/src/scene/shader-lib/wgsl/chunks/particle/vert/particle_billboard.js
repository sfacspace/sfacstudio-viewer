var particle_billboardVS = /* wgsl */ `
    let rotationResult = rotateWithMatrix(quadXY, inAngle);
    let rotatedQuadXY = rotationResult.rotatedVec;
    rotMatrix = rotationResult.matrix;
    var localPos = billboard(particlePos, rotatedQuadXY);
`;

export { particle_billboardVS as default };
