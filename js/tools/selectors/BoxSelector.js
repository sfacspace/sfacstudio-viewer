/** Create wireframe box entity. */
export function createWireBox(app, pos = {x:0, y:0, z:0}, size = {x:1, y:1, z:1}) {
    const pc = window.pc;
    const entity = new pc.Entity("WireBox", app);
    entity.addComponent('render');
    const { mesh, material } = createWireBoxMeshAndMaterial(app, size);
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

/** Create wireframe box mesh and material.
 * @param {{ outlineOnly?: boolean, edgeColor?: number[] }} [options] — outlineOnly: 면 그리드 생략(선택 하이라이트용)
 */
export function createWireBoxMeshAndMaterial(app, size = { x: 1, y: 1, z: 1 }, options = {}) {
    const outlineOnly = options.outlineOnly === true;
    const pc = window.pc;
    if (!app?.graphicsDevice || !pc) return { mesh: null, material: null };
    const device = app.graphicsDevice;
    const addThickSegment = (positions, colors, indices, a, b, width, color) => {
        const ax = a[0], ay = a[1], az = a[2];
        const bx = b[0], by = b[1], bz = b[2];

        const dx = bx - ax;
        const dy = by - ay;
        const dz = bz - az;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (len <= 1e-6) return;

        const dirX = dx / len;
        const dirY = dy / len;
        const dirZ = dz / len;

        let upX = 1, upY = 0, upZ = 0;
        const dotUp = Math.abs(dirX * upX + dirY * upY + dirZ * upZ);
        if (dotUp > 0.98) {
            upX = 0; upY = 1; upZ = 0;
        }

        let rightX = dirY * upZ - dirZ * upY;
        let rightY = dirZ * upX - dirX * upZ;
        let rightZ = dirX * upY - dirY * upX;
        const rightLen = Math.sqrt(rightX * rightX + rightY * rightY + rightZ * rightZ) || 1;
        rightX /= rightLen;
        rightY /= rightLen;
        rightZ /= rightLen;

        let up2X = rightY * dirZ - rightZ * dirY;
        let up2Y = rightZ * dirX - rightX * dirZ;
        let up2Z = rightX * dirY - rightY * dirX;

        const hw = width / 2;
        rightX *= hw; rightY *= hw; rightZ *= hw;
        up2X *= hw; up2Y *= hw; up2Z *= hw;

        const baseIndex = positions.length / 3;
        const c0 = [ax, ay, az];
        const c1 = [bx, by, bz];
        const corners = [
            [c0[0] - rightX - up2X, c0[1] - rightY - up2Y, c0[2] - rightZ - up2Z],
            [c0[0] + rightX - up2X, c0[1] + rightY - up2Y, c0[2] + rightZ - up2Z],
            [c0[0] + rightX + up2X, c0[1] + rightY + up2Y, c0[2] + rightZ + up2Z],
            [c0[0] - rightX + up2X, c0[1] - rightY + up2Y, c0[2] - rightZ + up2Z],
            [c1[0] - rightX - up2X, c1[1] - rightY - up2Y, c1[2] - rightZ - up2Z],
            [c1[0] + rightX - up2X, c1[1] + rightY - up2Y, c1[2] + rightZ - up2Z],
            [c1[0] + rightX + up2X, c1[1] + rightY + up2Y, c1[2] + rightZ + up2Z],
            [c1[0] - rightX + up2X, c1[1] - rightY + up2Y, c1[2] - rightZ + up2Z],
        ];

        for (const p of corners) {
            positions.push(p[0], p[1], p[2]);
            colors.push(color[0], color[1], color[2], color[3]);
        }

        const faces = [
            [0, 1, 2, 0, 2, 3],
            [4, 6, 5, 4, 7, 6],
            [0, 4, 5, 0, 5, 1],
            [1, 5, 6, 1, 6, 2],
            [2, 6, 7, 2, 7, 3],
            [3, 7, 4, 3, 4, 0],
        ];
        for (const f of faces) {
            indices.push(
                baseIndex + f[0], baseIndex + f[1], baseIndex + f[2],
                baseIndex + f[3], baseIndex + f[4], baseIndex + f[5]
            );
        }
    };

    const hx = size.x / 2;
    const hy = size.y / 2;
    const hz = size.z / 2;
    const v = [
        [-hx, -hy, -hz], [hx, -hy, -hz], [hx, hy, -hz], [-hx, hy, -hz],
        [-hx, -hy,  hz], [hx, -hy,  hz], [hx, hy,  hz], [-hx, hy,  hz]
    ];
    const edges = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7]
    ];
    const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, v | 0));
    const maxSize = Math.max(Math.abs(size.x), Math.abs(size.y), Math.abs(size.z));
    const gridDiv = clampInt(Math.round(maxSize * 2), 1, 16);

    const addLine = (a, b) => {
        addThickSegment(positions, colors, indices, a, b, width, color);
    };

    const addFaceGridXZ = (y) => {
        for (let i = 1; i < gridDiv; i++) {
            const z = -hz + (2 * hz * i) / gridDiv;
            addLine([-hx, y, z], [hx, y, z]);
        }
        for (let i = 1; i < gridDiv; i++) {
            const x = -hx + (2 * hx * i) / gridDiv;
            addLine([x, y, -hz], [x, y, hz]);
        }
    };

    const addFaceGridYZ = (x) => {
        for (let i = 1; i < gridDiv; i++) {
            const z = -hz + (2 * hz * i) / gridDiv;
            addLine([x, -hy, z], [x, hy, z]);
        }
        for (let i = 1; i < gridDiv; i++) {
            const y = -hy + (2 * hy * i) / gridDiv;
            addLine([x, y, -hz], [x, y, hz]);
        }
    };

    const addFaceGridXY = (z) => {
        for (let i = 1; i < gridDiv; i++) {
            const y = -hy + (2 * hy * i) / gridDiv;
            addLine([-hx, y, z], [hx, y, z]);
        }
        for (let i = 1; i < gridDiv; i++) {
            const x = -hx + (2 * hx * i) / gridDiv;
            addLine([x, -hy, z], [x, hy, z]);
        }
    };

    const positions = [];
    const colors = [];
    const indices = [];
    const color = options.edgeColor || [0.85, 0.85, 0.85, 1];
    const width = 0.012;
    for (const [a, b] of edges) {
        addThickSegment(positions, colors, indices, v[a], v[b], width, color);
    }

    if (!outlineOnly) {
        addFaceGridXZ(hy);
        addFaceGridXZ(-hy);
        addFaceGridYZ(hx);
        addFaceGridYZ(-hx);
        addFaceGridXY(hz);
        addFaceGridXY(-hz);
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


export default createWireBoxMeshAndMaterial;
