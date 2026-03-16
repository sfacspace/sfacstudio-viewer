var particle_customFaceVS = `
	let rotationResult = rotateWithMatrix(quadXY, inAngle);
	let rotatedQuadXY = rotationResult.rotatedVec;
	rotMatrix = rotationResult.matrix;
	var localPos = customFace(particlePos, rotatedQuadXY);
`;

export { particle_customFaceVS as default };
