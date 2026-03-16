declare const _default: "\n    if (outLife >= uniform.lifetime) {\n        let subtractAmount = max(uniform.lifetime, uniform.numParticles * particleRate);\n        outLife = outLife - subtractAmount;\n        visMode = 1.0;\n    }\n    visMode = select(visMode, 1.0, outLife < 0.0);\n";
export default _default;
