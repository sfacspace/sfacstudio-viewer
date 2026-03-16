declare const _default: "\n    let light: vec3f = negNormal.x * uniform.lightCube[0] + posNormal.x * uniform.lightCube[1] +\n                       negNormal.y * uniform.lightCube[2] + posNormal.y * uniform.lightCube[3] +\n                       negNormal.z * uniform.lightCube[4] + posNormal.z * uniform.lightCube[5];\n\n    rgb = rgb * light;\n";
export default _default;
