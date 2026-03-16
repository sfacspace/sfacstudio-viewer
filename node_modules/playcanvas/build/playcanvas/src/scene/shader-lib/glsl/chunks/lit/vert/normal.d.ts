declare const _default: "\nmat3 dNormalMatrix;\n\nvec3 getNormal() {\n    dNormalMatrix = getNormalMatrix(dModelMatrix);\n    vec3 localNormal = getLocalNormal(vertex_normal);\n    return normalize(dNormalMatrix * localNormal);\n}\n";
export default _default;
