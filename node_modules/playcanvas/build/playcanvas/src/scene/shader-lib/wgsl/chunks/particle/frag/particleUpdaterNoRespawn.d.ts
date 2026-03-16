declare const _default: "\n    if (outLife >= uniform.lifetime) {\n        outLife = outLife - max(uniform.lifetime, uniform.numParticles * particleRate);\n        visMode = -1.0;\n    }\n";
export default _default;
