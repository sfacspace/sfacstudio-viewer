/** Create wireframe sphere mesh and material. */
export function createWireSphereMeshAndMaterial(app, radius = 1, segments = 48) {
    const pc = window.pc;
    if (!app?.graphicsDevice || !pc) return { mesh: null, material: null };
    const device = app.graphicsDevice;
    const positions = [];
    const colors = [];
    const indices = [];
    const color = [0.85, 0.85, 0.85, 1];
    const width = 0.025;

    const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, v | 0));
    const ringDiv = clampInt(Math.round(Math.abs(radius) * 4), 6, 40);
    const meridians = clampInt(Math.round(Math.abs(radius) * 6), 6, 48);

    const addRibbonSegment = (positions, colors, indices, p0, p1, normal, width, color) => {
        const nx = normal[0];
        const ny = normal[1];
        const nz = normal[2];
        const dx = p1[0] - p0[0];
        const dy = p1[1] - p0[1];
        const dz = p1[2] - p0[2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (len <= 1e-6) return;
        const tx = dx / len;
        const ty = dy / len;
        const tz = dz / len;

        let ox = ty * nz - tz * ny;
        let oy = tz * nx - tx * nz;
        let oz = tx * ny - ty * nx;
        const oLen = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
        ox /= oLen;
        oy /= oLen;
        oz /= oLen;

        const hw = width / 2;
        ox *= hw; oy *= hw; oz *= hw;

        const baseIndex = positions.length / 3;
        const v0 = [p0[0] - ox, p0[1] - oy, p0[2] - oz];
        const v1 = [p0[0] + ox, p0[1] + oy, p0[2] + oz];
        const v2 = [p1[0] + ox, p1[1] + oy, p1[2] + oz];
        const v3 = [p1[0] - ox, p1[1] - oy, p1[2] - oz];

        for (const p of [v0, v1, v2, v3]) {
            positions.push(p[0], p[1], p[2]);
            colors.push(color[0], color[1], color[2], color[3]);
        }

        indices.push(
            baseIndex + 0, baseIndex + 1, baseIndex + 2,
            baseIndex + 0, baseIndex + 2, baseIndex + 3
        );
    };

    const addCircle = (planeNormal, planeAxisA, planeAxisB, r = radius, yOffset = 0) => {
        for (let i = 0; i < segments; ++i) {
            const a0 = (i / segments) * Math.PI * 2;
            const a1 = ((i + 1) / segments) * Math.PI * 2;
            const p0 = [
                r * (Math.cos(a0) * planeAxisA[0] + Math.sin(a0) * planeAxisB[0]),
                r * (Math.cos(a0) * planeAxisA[1] + Math.sin(a0) * planeAxisB[1]) + yOffset,
                r * (Math.cos(a0) * planeAxisA[2] + Math.sin(a0) * planeAxisB[2]),
            ];
            const p1 = [
                r * (Math.cos(a1) * planeAxisA[0] + Math.sin(a1) * planeAxisB[0]),
                r * (Math.cos(a1) * planeAxisA[1] + Math.sin(a1) * planeAxisB[1]) + yOffset,
                r * (Math.cos(a1) * planeAxisA[2] + Math.sin(a1) * planeAxisB[2]),
            ];
            addRibbonSegment(positions, colors, indices, p0, p1, planeNormal, width, color);
        }
    };

    addCircle([0, 0, 1], [0, 1, 0], [1, 0, 0]);
    addCircle([1, 0, 0], [0, 0, 1], [0, 1, 0]);
    addCircle([0, 1, 0], [0, 0, 1], [1, 0, 0]);

    for (let j = 0; j < meridians; j++) {
        const phi = (j / meridians) * Math.PI;
        const dx = Math.cos(phi);
        const dz = Math.sin(phi);
        const normal = [dz, 0, -dx];
        const axisA = [0, 1, 0];
        const axisB = [dx, 0, dz];
        addCircle(normal, axisA, axisB);
    }

    for (let i = 1; i < ringDiv; i++) {
        const t = i / ringDiv;
        const lat = -Math.PI / 2 + t * Math.PI;
        const y = radius * Math.sin(lat);
        const r = Math.abs(radius * Math.cos(lat));
        if (r <= 1e-5) continue;
        addCircle([0, 1, 0], [1, 0, 0], [0, 0, 1], r, y);
    }

    const posArray = new Float32Array(positions);
    const colArray = new Uint8Array(colors.map(c => Math.floor(c * 255)));
    const idxArray = (posArray.length / 3 > 65535) ? new Uint32Array(indices) : new Uint16Array(indices);
    const mesh = new pc.Mesh(device);
    mesh.setPositions(posArray);
    mesh.setColors32(colArray);
    mesh.setIndices(idxArray);
    mesh.update(pc.PRIMITIVE_TRIANGLES);
    const mat = new pc.StandardMaterial();
    mat.useLighting = false;
    mat.emissive = new pc.Color(1, 1, 1);
    mat.emissiveVertexColor = true;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();
    return { mesh, material: mat };
}

/** Create wireframe sphere entity. */
export function createWireSphere(app, pos = {x:0, y:0, z:0}, radius = 1, segments = 48) {
    const pc = window.pc;
    const entity = new pc.Entity("WireSphere", app);
    entity.addComponent('render');
    entity.__wireRadius = radius;
    const { mesh, material } = createWireSphereMeshAndMaterial(app, radius, segments);
    if (!mesh || !material) return entity;
    const meshInstance = new pc.MeshInstance(mesh, material);
    meshInstance.lineWidth = 2.5;

    entity.render.meshInstances = [meshInstance];
    entity.on('destroy', () => {
        try {
            mesh.destroy();
        } catch (e) {
        }
        try {
            material.destroy();
        } catch (e) {
        }
    });
    entity.setLocalPosition(pos.x, pos.y, pos.z);
    return entity;
}

export default createWireSphereMeshAndMaterial;
