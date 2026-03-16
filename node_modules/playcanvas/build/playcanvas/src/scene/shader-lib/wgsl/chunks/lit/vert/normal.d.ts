declare const _default: "\nvar<private> dNormalMatrix: mat3x3f;\n\nfn getNormal() -> vec3f {\n    dNormalMatrix = getNormalMatrix(dModelMatrix);\n    let localNormal: vec3f = getLocalNormal(vertex_normal);\n    return normalize(dNormalMatrix * localNormal);\n}";
export default _default;
