declare const _default: "\n    if (outLife >= lifetime) {\n        outLife -= max(lifetime, numParticles * particleRate);\n        visMode = 1.0;\n    }\n    visMode = outLife < 0.0? 1.0: visMode;\n";
export default _default;
