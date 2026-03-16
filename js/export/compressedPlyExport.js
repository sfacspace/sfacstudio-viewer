/**
 * Compressed PLY export (SuperSplat .compressed.ply). Same SH rotation as exportPly (v7).
 */

import { getExportBaseName, getExportOptionsFromWorldMat4, saveBlobWithDialog } from './exportPly.js';
import { t } from '../i18n.js';

function getDataFromMat4(mat4) {
  return mat4?.data ?? (Array.isArray(mat4) ? mat4 : null);
}

function transformPointByMat4(mat4, x, y, z) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return { x, y, z };
  return {
    x: d[0] * x + d[4] * y + d[8] * z + d[12],
    y: d[1] * x + d[5] * y + d[9] * z + d[13],
    z: d[2] * x + d[6] * y + d[10] * z + d[14],
  };
}

const MIN_WORLD_SCALE = 1e-6;

function getQuatFromMat4(mat4) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return { w: 1, x: 0, y: 0, z: 0 };
  let r00 = d[0], r10 = d[1], r20 = d[2];
  let r01 = d[4], r11 = d[5], r21 = d[6];
  let r02 = d[8], r12 = d[9], r22 = d[10];
  const s0 = Math.sqrt(r00 * r00 + r10 * r10 + r20 * r20) || 1;
  const s1 = Math.sqrt(r01 * r01 + r11 * r11 + r21 * r21) || 1;
  const s2 = Math.sqrt(r02 * r02 + r12 * r12 + r22 * r22) || 1;
  r00 /= s0; r10 /= s0; r20 /= s0;
  r01 /= s1; r11 /= s1; r21 /= s1;
  r02 /= s2; r12 /= s2; r22 /= s2;
  const tr = r00 + r11 + r22;
  let w, x, y, z;
  if (tr > 0) {
    const s = 2.0 * Math.sqrt(tr + 1.0);
    w = 0.25 * s; x = (r21 - r12) / s; y = (r02 - r20) / s; z = (r10 - r01) / s;
  } else if (r00 > r11 && r00 > r22) {
    const s = 2.0 * Math.sqrt(1.0 + r00 - r11 - r22);
    w = (r21 - r12) / s; x = 0.25 * s; y = (r01 + r10) / s; z = (r02 + r20) / s;
  } else if (r11 > r22) {
    const s = 2.0 * Math.sqrt(1.0 + r11 - r00 - r22);
    w = (r02 - r20) / s; x = (r01 + r10) / s; y = 0.25 * s; z = (r12 + r21) / s;
  } else {
    const s = 2.0 * Math.sqrt(1.0 + r22 - r00 - r11);
    w = (r10 - r01) / s; x = (r02 + r20) / s; y = (r12 + r21) / s; z = 0.25 * s;
  }
  const len = Math.sqrt(w * w + x * x + y * y + z * z) || 1;
  return { w: w / len, x: x / len, y: y / len, z: z / len };
}

function getScaleFromMat4(mat4) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return { x: 1, y: 1, z: 1 };
  let sx = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  let sy = Math.sqrt(d[4] * d[4] + d[5] * d[5] + d[6] * d[6]);
  let sz = Math.sqrt(d[8] * d[8] + d[9] * d[9] + d[10] * d[10]);
  if (!Number.isFinite(sx) || sx < MIN_WORLD_SCALE) sx = MIN_WORLD_SCALE;
  if (!Number.isFinite(sy) || sy < MIN_WORLD_SCALE) sy = MIN_WORLD_SCALE;
  if (!Number.isFinite(sz) || sz < MIN_WORLD_SCALE) sz = MIN_WORLD_SCALE;
  return { x: sx, y: sy, z: sz };
}

function getRotMat3FromMat4(mat4) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  let r00 = d[0], r10 = d[1], r20 = d[2];
  let r01 = d[4], r11 = d[5], r21 = d[6];
  let r02 = d[8], r12 = d[9], r22 = d[10];
  const s0 = Math.sqrt(r00 * r00 + r10 * r10 + r20 * r20) || 1;
  const s1 = Math.sqrt(r01 * r01 + r11 * r11 + r21 * r21) || 1;
  const s2 = Math.sqrt(r02 * r02 + r12 * r12 + r22 * r22) || 1;
  return [
    r00 / s0, r01 / s1, r02 / s2,
    r10 / s0, r11 / s1, r12 / s2,
    r20 / s0, r21 / s1, r22 / s2,
  ];
}

function quatMul(q1, q2) {
  const w = q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z;
  const x = q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y;
  const y = q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x;
  const z = q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w;
  const len = Math.sqrt(w * w + x * x + y * y + z * z) || 1;
  return { w: w / len, x: x / len, y: y / len, z: z / len };
}

function isNearIdentityFull(d, eps = 0.001) {
  if (!d || d.length < 16) return true;
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  for (let i = 0; i < 16; i++) {
    if (Math.abs((d[i] ?? 0) - I[i]) > eps) return false;
  }
  return true;
}

function mat4MulRotZNeg180(mat4) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return null;
  return new Float32Array([
    -d[0], -d[1], d[2], 0, -d[4], -d[5], d[6], 0,
    -d[8], -d[9], d[10], 0, -d[12], -d[13], d[14], d[15]
  ]);
}

function extractUserTransform(worldMat4, _debug = false) {
  const d = getDataFromMat4(worldMat4);
  if (!d || d.length < 16) return null;
  if (isNearIdentityFull(d)) return null;
  const Rz180 = [-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  let isRz180 = true;
  for (let i = 0; i < 16; i++) {
    if (Math.abs((d[i] ?? 0) - Rz180[i]) > 0.001) { isRz180 = false; break; }
  }
  if (isRz180) return null;
  const stripped = mat4MulRotZNeg180(worldMat4);
  if (isNearIdentityFull(stripped)) return null;
  const distWorld = d.reduce((s, v, i) => {
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    return s + (v - I[i]) ** 2;
  }, 0);
  const distStripped = stripped.reduce((s, v, i) => {
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    return s + (v - I[i]) ** 2;
  }, 0);
  return distStripped < distWorld ? { data: stripped } : worldMat4;
}

// 3DGS SH constants
const SH_C1 = 0.4886025119029199;
const SH_C2 = [1.0925484305920792, 1.0925484305920792, 0.31539156525252005, 1.0925484305920792, 0.5462742152960396];
const SH_C3 = [
  -0.5900435899266435, 2.890611442640554, -0.4570457994644658,
  0.3731763325901154, -0.4570457994644658, 1.445305721320277, -0.5900435899266435,
];

function evalSHBasis(band, x, y, z) {
  if (band === 1) return [-SH_C1 * y, SH_C1 * z, -SH_C1 * x];
  if (band === 2) return [
    SH_C2[0] * x * y, SH_C2[1] * y * z, SH_C2[2] * (2 * z * z - x * x - y * y),
    SH_C2[3] * x * z, SH_C2[4] * (x * x - y * y),
  ];
  if (band === 3) {
    const xx = x * x, yy = y * y, zz = z * z;
    return [
      SH_C3[0] * y * (3 * xx - yy), SH_C3[1] * x * y * z,
      SH_C3[2] * y * (4 * zz - xx - yy), SH_C3[3] * z * (2 * zz - 3 * xx - 3 * yy),
      SH_C3[4] * x * (4 * zz - xx - yy), SH_C3[5] * z * (xx - yy),
      SH_C3[6] * x * (xx - 3 * yy),
    ];
  }
  return [];
}

function generateTestDirections(count) {
  const dirs = [];
  const phi = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / count);
    const angle = 2 * Math.PI * i / phi;
    dirs.push([Math.sin(theta) * Math.cos(angle), Math.sin(theta) * Math.sin(angle), Math.cos(theta)]);
  }
  return dirs;
}

function invertMatrix(M) {
  const n = M.length;
  const aug = M.map((row, i) => {
    const ext = new Float64Array(2 * n);
    for (let j = 0; j < n; j++) ext[j] = row[j];
    ext[n + i] = 1;
    return ext;
  });
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-14) return null;
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }
  return aug.map(row => Array.from(row.slice(n)));
}

function computeSHRotationMatrix(band, rotMat3) {
  const n = 2 * band + 1;
  const R = rotMat3;
  const numDirs = Math.max(n * 3, 50);
  const testDirs = generateTestDirections(numDirs);

  const A = [], B = [];
  for (let k = 0; k < numDirs; k++) {
    const [x, y, z] = testDirs[k];
    const rx = R[0] * x + R[1] * y + R[2] * z;
    const ry = R[3] * x + R[4] * y + R[5] * z;
    const rz = R[6] * x + R[7] * y + R[8] * z;
    A.push(evalSHBasis(band, x, y, z));
    B.push(evalSHBasis(band, rx, ry, rz));
  }

  const AtA = Array.from({ length: n }, () => new Float64Array(n));
  const AtB = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sumAA = 0, sumAB = 0;
      for (let k = 0; k < numDirs; k++) { sumAA += A[k][i] * A[k][j]; sumAB += A[k][i] * B[k][j]; }
      AtA[i][j] = sumAA; AtB[i][j] = sumAB;
    }
  }

  const AtAinv = invertMatrix(AtA.map(r => Array.from(r)));
  if (!AtAinv) {
    console.warn(`[SH Rotation] Band ${band} inverse failed, using identity`);
    return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
  }

  // X = AtAinv * AtB (this is D^T)
  const Dt = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    let sum = 0; for (let k = 0; k < n; k++) sum += AtAinv[i][k] * AtB[k][j]; Dt[i][j] = sum;
  }

  // [v7] transpose to get D from D^T
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => Dt[j][i]));
}

function createSHRotationMatrices(rotMat3, maxBand) {
  const isIdentity =
    Math.abs(rotMat3[0] - 1) < 1e-6 && Math.abs(rotMat3[4] - 1) < 1e-6 && Math.abs(rotMat3[8] - 1) < 1e-6 &&
    Math.abs(rotMat3[1]) < 1e-6 && Math.abs(rotMat3[2]) < 1e-6 &&
    Math.abs(rotMat3[3]) < 1e-6 && Math.abs(rotMat3[5]) < 1e-6 &&
    Math.abs(rotMat3[6]) < 1e-6 && Math.abs(rotMat3[7]) < 1e-6;
  if (isIdentity) return { band1: null, band2: null, band3: null };
  return {
    band1: maxBand >= 1 ? computeSHRotationMatrix(1, rotMat3) : null,
    band2: maxBand >= 2 ? computeSHRotationMatrix(2, rotMat3) : null,
    band3: maxBand >= 3 ? computeSHRotationMatrix(3, rotMat3) : null,
  };
}

function applySHRotation(vec, mat) {
  const n = vec.length;
  const tmp = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0; for (let j = 0; j < n; j++) sum += mat[i][j] * vec[j]; tmp[i] = sum;
  }
  for (let i = 0; i < n; i++) vec[i] = tmp[i];
}

const CHUNK_MEMBERS = [
  'x', 'y', 'z',
  'scale_0', 'scale_1', 'scale_2',
  'f_dc_0', 'f_dc_1', 'f_dc_2', 'opacity',
  'rot_0', 'rot_1', 'rot_2', 'rot_3'
];

const SH_NAMES = new Array(45).fill('').map((_, i) => `f_rest_${i}`);
const SH_BAND_COEFFS = [0, 3, 8, 15];

function getProp(gsplatData, name) {
  if (typeof gsplatData.getProp === 'function') {
    return gsplatData.getProp(name);
  }
  const el = gsplatData?.elements?.find(e => e.name === 'vertex') || gsplatData?.elements?.[0];
  return el?.properties?.find(pr => pr.name === name)?.storage ?? null;
}

function detectSHBands(propNames) {
  let maxIdx = -1;
  for (const name of propNames) {
    const m = name.match(/^f_rest_(\d+)$/);
    if (m) { const idx = parseInt(m[1], 10); if (idx > maxIdx) maxIdx = idx; }
  }
  if (maxIdx >= 44) return 3;
  if (maxIdx >= 23) return 2;
  if (maxIdx >= 8)  return 1;
  return 0;
}

function coeffsPerChannel(numBands) {
  return [0, 3, 8, 15][numBands] ?? 0;
}

function createCompressedReader(gsplatData, propNames, opts) {
  const data = {};
  propNames.forEach(n => { data[n] = 0; });
  const hasPos = ['x', 'y', 'z'].every(k => k in data);
  const hasRot = ['rot_0', 'rot_1', 'rot_2', 'rot_3'].every(k => k in data);
  const hasScale = ['scale_0', 'scale_1', 'scale_2'].every(k => k in data);
  const srcArrays = {};
  propNames.forEach(n => { srcArrays[n] = getProp(gsplatData, n); });

  let worldQuat = null;
  let worldScale = null;
  let shRotMats = null;

  // [v7] precompute SH layout
  const numBands = detectSHBands(propNames);
  const cpc = coeffsPerChannel(numBands);
  const shChannelOffsets = [0, cpc, cpc * 2];

  if (opts.worldMat4) {
    worldQuat = getQuatFromMat4(opts.worldMat4);
    worldScale = getScaleFromMat4(opts.worldMat4);

    // [v7] precompute SH rotation matrices
    if (numBands > 0) {
      const rotMat3 = getRotMat3FromMat4(opts.worldMat4);
      shRotMats = createSHRotationMatrices(rotMat3, numBands);
    }
  }

  function read(i) {
    propNames.forEach(n => {
      const arr = srcArrays[n];
      data[n] = (arr && i < arr.length) ? arr[i] : 0;
    });

    if (opts.worldMat4) {
      // 1. Position
      if (hasPos) {
        const t = transformPointByMat4(opts.worldMat4, data.x, data.y, data.z);
        data.x = t.x; data.y = t.y; data.z = t.z;
      }
      // 2. Rotation
      if (hasRot && worldQuat) {
        const localQ = { w: data.rot_0, x: data.rot_1, y: data.rot_2, z: data.rot_3 };
        const result = quatMul(worldQuat, localQ);
        data.rot_0 = result.w; data.rot_1 = result.x; data.rot_2 = result.y; data.rot_3 = result.z;
      }
      // 3. Scale
      if (hasScale && worldScale) {
        data.scale_0 += Math.log(worldScale.x);
        data.scale_1 += Math.log(worldScale.y);
        data.scale_2 += Math.log(worldScale.z);
      }

      // 4. [v7] SH coefficient rotation
      if (shRotMats && cpc > 0) {
        for (let ch = 0; ch < 3; ch++) {
          const base = shChannelOffsets[ch];

          // Band 1 (3 coeffs)
          if (shRotMats.band1 && cpc >= 3) {
            const coeffs = [data[`f_rest_${base + 0}`], data[`f_rest_${base + 1}`], data[`f_rest_${base + 2}`]];
            applySHRotation(coeffs, shRotMats.band1);
            data[`f_rest_${base + 0}`] = coeffs[0]; data[`f_rest_${base + 1}`] = coeffs[1]; data[`f_rest_${base + 2}`] = coeffs[2];
          }

          // Band 2 (5 coeffs)
          if (shRotMats.band2 && cpc >= 8) {
            const coeffs = [
              data[`f_rest_${base + 3}`], data[`f_rest_${base + 4}`], data[`f_rest_${base + 5}`],
              data[`f_rest_${base + 6}`], data[`f_rest_${base + 7}`],
            ];
            applySHRotation(coeffs, shRotMats.band2);
            data[`f_rest_${base + 3}`] = coeffs[0]; data[`f_rest_${base + 4}`] = coeffs[1];
            data[`f_rest_${base + 5}`] = coeffs[2]; data[`f_rest_${base + 6}`] = coeffs[3]; data[`f_rest_${base + 7}`] = coeffs[4];
          }

          // Band 3 (7 coeffs)
          if (shRotMats.band3 && cpc >= 15) {
            const coeffs = [
              data[`f_rest_${base + 8}`], data[`f_rest_${base + 9}`], data[`f_rest_${base + 10}`],
              data[`f_rest_${base + 11}`], data[`f_rest_${base + 12}`], data[`f_rest_${base + 13}`], data[`f_rest_${base + 14}`],
            ];
            applySHRotation(coeffs, shRotMats.band3);
            data[`f_rest_${base + 8}`] = coeffs[0]; data[`f_rest_${base + 9}`] = coeffs[1];
            data[`f_rest_${base + 10}`] = coeffs[2]; data[`f_rest_${base + 11}`] = coeffs[3];
            data[`f_rest_${base + 12}`] = coeffs[4]; data[`f_rest_${base + 13}`] = coeffs[5]; data[`f_rest_${base + 14}`] = coeffs[6];
          }
        }
      }
    }

    return { ...data };
  }
  return { read, data };
}

function collectVertices(gsplatData, keepMask, opts) {
  const propNames = [...CHUNK_MEMBERS];
  const vertex = gsplatData?.elements?.find(e => e.name === 'vertex') || gsplatData?.elements?.[0];
  if (!vertex?.properties?.length) return { vertices: [], shCoeffs: 0 };
  const byName = new Set(vertex.properties.map(p => p.name));
  for (const n of SH_NAMES) {
    if (byName.has(n)) propNames.push(n);
  }
  const reader = createCompressedReader(gsplatData, propNames, opts);
  const vertices = [];
  const n = gsplatData.numSplats;
  for (let i = 0; i < n; i++) {
    if (!keepMask(i)) continue;
    vertices.push(reader.read(i));
  }
  const hasRest = CHUNK_MEMBERS.length < propNames.length;
  const shCoeffs = hasRest ? Math.min(45, propNames.length - CHUNK_MEMBERS.length) : 0;
  return { vertices, shCoeffs, propNames };
}

function packUnorm(value, bits) {
  const t = (1 << bits) - 1;
  return Math.max(0, Math.min(t, Math.floor(value * t + 0.5)));
}

function pack111011(x, y, z) {
  return (packUnorm(x, 11) << 21) | (packUnorm(y, 10) << 11) | packUnorm(z, 11);
}

function pack8888(x, y, z, w) {
  return (packUnorm(x, 8) << 24) | (packUnorm(y, 8) << 16) | (packUnorm(z, 8) << 8) | packUnorm(w, 8);
}

function packRot(x, y, z, w) {
  const len = Math.sqrt(x * x + y * y + z * z + w * w) || 1;
  const q = { x: x / len, y: y / len, z: z / len, w: w / len };
  const a = [q.x, q.y, q.z, q.w];
  const largest = a.reduce((curr, v, i) => (Math.abs(v) > Math.abs(a[curr]) ? i : curr), 0);
  if (a[largest] < 0) {
    a[0] = -a[0]; a[1] = -a[1]; a[2] = -a[2]; a[3] = -a[3];
  }
  const norm = Math.sqrt(2) * 0.5;
  let result = largest;
  for (let i = 0; i < 4; i++) {
    if (i !== largest) result = (result << 10) | packUnorm(a[i] * norm + 0.5, 10);
  }
  return result;
}

class Chunk {
  constructor(size = 256) {
    this.size = size;
    this.data = {};
    CHUNK_MEMBERS.forEach(m => { this.data[m] = new Float32Array(size); });
    this.position = new Uint32Array(size);
    this.rotation = new Uint32Array(size);
    this.scale = new Uint32Array(size);
    this.color = new Uint32Array(size);
  }

  set(index, vertex) {
    CHUNK_MEMBERS.forEach(name => {
      const v = vertex[name];
      this.data[name][index] = v !== undefined ? v : 0;
    });
  }

  pack(globalColorRange = null) {
    const calcMinMax = (data) => {
      let min = data[0], max = data[0];
      for (let i = 1; i < data.length; i++) {
        const v = data[i];
        min = Math.min(min, v); max = Math.max(max, v);
      }
      return { min, max };
    };
    const normalize = (x, min, max) => {
      if (x <= min) return 0;
      if (x >= max) return 1;
      const t = (max - min < 0.00001) ? 0 : (x - min) / (max - min);
      return Math.max(0, Math.min(1, t));
    };
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const d = this.data;
    const x = d.x, y = d.y, z = d.z;
    const scale_0 = d.scale_0, scale_1 = d.scale_1, scale_2 = d.scale_2;
    const rot_0 = d.rot_0, rot_1 = d.rot_1, rot_2 = d.rot_2, rot_3 = d.rot_3;
    const f_dc_0 = d.f_dc_0, f_dc_1 = d.f_dc_1, f_dc_2 = d.f_dc_2;
    const opacity = d.opacity;

    const px = calcMinMax(x), py = calcMinMax(y), pz = calcMinMax(z);
    const sx = calcMinMax(scale_0), sy = calcMinMax(scale_1), sz = calcMinMax(scale_2);
    sx.min = clamp(sx.min, -20, 20); sx.max = clamp(sx.max, -20, 20);
    sy.min = clamp(sy.min, -20, 20); sy.max = clamp(sy.max, -20, 20);
    sz.min = clamp(sz.min, -20, 20); sz.max = clamp(sz.max, -20, 20);

    const SH_C0 = 0.28209479177387814;
    const fd0 = new Float32Array(f_dc_0.length);
    const fd1 = new Float32Array(f_dc_1.length);
    const fd2 = new Float32Array(f_dc_2.length);
    for (let i = 0; i < f_dc_0.length; i++) {
      fd0[i] = f_dc_0[i] * SH_C0 + 0.5;
      fd1[i] = f_dc_1[i] * SH_C0 + 0.5;
      fd2[i] = f_dc_2[i] * SH_C0 + 0.5;
    }
    const cr = globalColorRange?.cr ?? calcMinMax(fd0);
    const cg = globalColorRange?.cg ?? calcMinMax(fd1);
    const cb = globalColorRange?.cb ?? calcMinMax(fd2);

    const dither8 = (i, c) => ((i * 31 + c) % 257) / 257 - 0.5;
    const oneOver255 = 1 / 255;

    for (let i = 0; i < this.size; i++) {
      const nx = normalize(x[i], px.min, px.max);
      const ny = normalize(y[i], py.min, py.max);
      const nz = normalize(z[i], pz.min, pz.max);
      this.position[i] = pack111011(nx, ny, nz);

      this.rotation[i] = packRot(rot_0[i], rot_1[i], rot_2[i], rot_3[i]);

      this.scale[i] = pack111011(
        normalize(scale_0[i], sx.min, sx.max),
        normalize(scale_1[i], sy.min, sy.max),
        normalize(scale_2[i], sz.min, sz.max)
      );

      const crVal = Math.max(0, Math.min(1, normalize(fd0[i], cr.min, cr.max) + dither8(i, 0) * oneOver255));
      const cgVal = Math.max(0, Math.min(1, normalize(fd1[i], cg.min, cg.max) + dither8(i, 1) * oneOver255));
      const cbVal = Math.max(0, Math.min(1, normalize(fd2[i], cb.min, cb.max) + dither8(i, 2) * oneOver255));
      const opLinear = 1 / (1 + Math.exp(-opacity[i]));
      const opVal = Math.max(0, Math.min(1, opLinear + dither8(i, 3) * oneOver255));
      this.color[i] = pack8888(crVal, cgVal, cbVal, opVal);
    }
    return { px, py, pz, sx, sy, sz, cr, cg, cb };
  }
}

function encodeMorton3(x, y, z) {
  const Part1By2 = (v) => {
    v &= 0x000003ff;
    v = (v ^ (v << 16)) & 0xff0000ff;
    v = (v ^ (v << 8)) & 0x0300f00f;
    v = (v ^ (v << 4)) & 0x030c30c3;
    v = (v ^ (v << 2)) & 0x09249249;
    return v;
  };
  return (Part1By2(z) << 2) + (Part1By2(y) << 1) + Part1By2(x);
}

function sortIndicesByMorton(vertices) {
  if (vertices.length === 0) return [];
  let minx = vertices[0].x, maxx = vertices[0].x;
  let miny = vertices[0].y, maxy = vertices[0].y;
  let minz = vertices[0].z, maxz = vertices[0].z;
  for (let i = 1; i < vertices.length; i++) {
    const v = vertices[i];
    if (v.x < minx) minx = v.x; else if (v.x > maxx) maxx = v.x;
    if (v.y < miny) miny = v.y; else if (v.y > maxy) maxy = v.y;
    if (v.z < minz) minz = v.z; else if (v.z > maxz) maxz = v.z;
  }
  const xlen = maxx - minx || 1;
  const ylen = maxy - miny || 1;
  const zlen = maxz - minz || 1;
  const morton = new Uint32Array(vertices.length);
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    const ix = Math.min(1023, Math.floor(1024 * (v.x - minx) / xlen));
    const iy = Math.min(1023, Math.floor(1024 * (v.y - miny) / ylen));
    const iz = Math.min(1023, Math.floor(1024 * (v.z - minz) / zlen));
    morton[i] = encodeMorton3(ix, iy, iz);
  }
  const indices = vertices.map((_, i) => i);
  indices.sort((a, b) => morton[a] - morton[b]);
  return indices;
}

const CHUNK_PROPS = [
  'min_x', 'min_y', 'min_z',
  'max_x', 'max_y', 'max_z',
  'min_scale_x', 'min_scale_y', 'min_scale_z',
  'max_scale_x', 'max_scale_y', 'max_scale_z',
  'min_r', 'min_g', 'min_b',
  'max_r', 'max_g', 'max_b'
];
const VERTEX_PROPS = ['packed_position', 'packed_rotation', 'packed_scale', 'packed_color'];

function buildCompressedPlyBytes(vertices, sortedIndices, maxSHBands = 3) {
  if (vertices.length === 0) return null;
  const numSplats = vertices.length;
  const numChunks = Math.ceil(numSplats / 256);
  const outputSHCoeffs = SH_BAND_COEFFS[Math.min(maxSHBands, 3)];
  const hasSH = outputSHCoeffs > 0;

  const shHeader = hasSH
    ? [`element sh ${numSplats}`, ...SH_NAMES.slice(0, outputSHCoeffs * 3).map((_, i) => `property uchar f_rest_${i}`)]
    : [];

  const headerText = [
    'ply',
    'format binary_little_endian 1.0',
    'comment Liam Viewer compressed PLY',
    `element chunk ${numChunks}`,
    ...CHUNK_PROPS.map(p => `property float ${p}`),
    `element vertex ${numSplats}`,
    ...VERTEX_PROPS.map(p => `property uint ${p}`),
    ...shHeader,
    'end_header\n'
  ].join('\n');

  const header = new TextEncoder().encode(headerText);
  const chunkData = new Float32Array(18);
  const chunkDataU8 = new Uint8Array(chunkData.buffer);
  const vertexData = new Uint32Array(256 * 4);
  const vertexDataU8 = new Uint8Array(vertexData.buffer);
  const chunk = new Chunk();

  const totalBytes =
    header.byteLength +
    numChunks * 18 * 4 +
    numSplats * 4 * 4 +
    (hasSH ? numSplats * outputSHCoeffs * 3 : 0);
  const out = new Uint8Array(totalBytes);
  let offset = 0;
  out.set(header, offset);
  offset += header.byteLength;

  const sortedVertices = sortedIndices.map(i => vertices[i]);

  const SH_C0 = 0.28209479177387814;
  let cr = { min: 1, max: 0 }, cg = { min: 1, max: 0 }, cb = { min: 1, max: 0 };
  for (const v of sortedVertices) {
    const f0 = v.f_dc_0 * SH_C0 + 0.5, f1 = v.f_dc_1 * SH_C0 + 0.5, f2 = v.f_dc_2 * SH_C0 + 0.5;
    cr.min = Math.min(cr.min, f0); cr.max = Math.max(cr.max, f0);
    cg.min = Math.min(cg.min, f1); cg.max = Math.max(cg.max, f1);
    cb.min = Math.min(cb.min, f2); cb.max = Math.max(cb.max, f2);
  }
  if (cr.min > cr.max) cr = { min: 0, max: 1 };
  if (cg.min > cg.max) cg = { min: 0, max: 1 };
  if (cb.min > cb.max) cb = { min: 0, max: 1 };
  const globalColorRange = { cr, cg, cb };

  for (let c = 0; c < numChunks; c++) {
    const start = c * 256;
    const num = Math.min(256, numSplats - start);
    for (let j = 0; j < num; j++) chunk.set(j, sortedVertices[start + j]);
    for (let j = num; j < 256; j++) chunk.set(j, sortedVertices[start + num - 1]);
    const result = chunk.pack(globalColorRange);
    chunkData[0] = result.px.min; chunkData[1] = result.py.min; chunkData[2] = result.pz.min;
    chunkData[3] = result.px.max; chunkData[4] = result.py.max; chunkData[5] = result.pz.max;
    chunkData[6] = result.sx.min; chunkData[7] = result.sy.min; chunkData[8] = result.sz.min;
    chunkData[9] = result.sx.max; chunkData[10] = result.sy.max; chunkData[11] = result.sz.max;
    chunkData[12] = cr.min; chunkData[13] = cg.min; chunkData[14] = cb.min;
    chunkData[15] = cr.max; chunkData[16] = cg.max; chunkData[17] = cb.max;
    out.set(chunkDataU8, offset);
    offset += chunkDataU8.length;
  }

  for (let c = 0; c < numChunks; c++) {
    const start = c * 256;
    const num = Math.min(256, numSplats - start);
    for (let j = 0; j < num; j++) chunk.set(j, sortedVertices[start + j]);
    for (let j = num; j < 256; j++) chunk.set(j, sortedVertices[start + num - 1]);
    chunk.pack(globalColorRange);
    for (let j = 0; j < num; j++) {
      vertexData[j * 4 + 0] = chunk.position[j];
      vertexData[j * 4 + 1] = chunk.rotation[j];
      vertexData[j * 4 + 2] = chunk.scale[j];
      vertexData[j * 4 + 3] = chunk.color[j];
    }
    out.set(vertexDataU8.subarray(0, num * 16), offset);
    offset += num * 16;
  }

  if (hasSH) {
    const shData = new Uint8Array(outputSHCoeffs * 3 * 256);
    for (let c = 0; c < numChunks; c++) {
      const start = c * 256;
      const num = Math.min(256, numSplats - start);
      for (let j = 0; j < num; j++) {
        const v = sortedVertices[start + j];
        const base = j * outputSHCoeffs * 3;
        for (let k = 0; k < outputSHCoeffs * 3; k++) {
          const key = SH_NAMES[k];
          const val = (v[key] !== undefined ? v[key] : 0) / 8 + 0.5;
          shData[base + k] = Math.max(0, Math.min(255, Math.trunc(val * 256)));
        }
      }
      out.set(shData.subarray(0, num * outputSHCoeffs * 3), offset);
      offset += num * outputSHCoeffs * 3;
    }
  }

  return out;
}

const DEFAULT_OPTIONS = {
  bakeWorldTransform: true,
  debug: false,
};

function buildCompressedPlyForEntity(selectionTool, entity, _fileName, options = {}) {
  const instance = entity?.gsplat?.instance;
  const resource = instance?.resource;
  const gsplatData = resource?.gsplatData;
  if (!gsplatData?.elements?.length) return null;

  const erasedSet = selectionTool._getErasedIndicesForEntity(entity);
  const keepMask = (i) => !erasedSet.has(i);
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.bakeWorldTransform && typeof entity?.getWorldTransform === 'function') {
    const world = entity.getWorldTransform();
    const userTransform = extractUserTransform(world, opts.debug);
    if (userTransform) opts.worldMat4 = userTransform;
  }

  const { vertices, shCoeffs } = collectVertices(gsplatData, keepMask, opts);
  if (vertices.length === 0) return null;

  const maxSHBands = shCoeffs >= 45 ? 3 : shCoeffs >= 24 ? 2 : shCoeffs >= 9 ? 1 : 0;
  const sortedIndices = sortIndicesByMorton(vertices);
  return buildCompressedPlyBytes(vertices, sortedIndices, maxSHBands);
}

export async function exportFilteredCompressedPlyForSelectedObject(viewer, selectionTool, options = {}) {
  const v = viewer ?? window.__viewer;
  const selectedObject = v?.getSelectedObject?.();
  if (!selectedObject || !selectionTool) {
    alert('선택된 오브젝트가 없거나 내보낼 수 없습니다.');
    return;
  }

  const base = getExportBaseName(selectedObject.name || selectedObject.id);
  const suggestedName = `with_${base}.compressed.ply`;
  const mime = 'application/octet-stream';

  const entity = selectionTool.getGsplatEntityFromSelection?.();
  if (!entity?.gsplat) {
    alert('내보낼 PLY 엔티티를 찾을 수 없습니다.');
    return;
  }

  let fileHandle = null;
  if (typeof window.showSaveFilePicker === 'function') {
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: 'Compressed PLY', accept: { [mime]: ['.compressed.ply', '.ply'] } }],
      });
    } catch (e) {
      if (e?.name === 'AbortError') return;
    }
  }

  try {
    let cancel = false;
    window.__showGlobalLoadingOverlay?.(t('loading.exportingCompressedPly'), 0, { showCancel: true, onCancel: () => { cancel = true; } });

    const opts = getExportOptionsFromWorldMat4(entity.getWorldTransform?.());
    const bytes = buildCompressedPlyForEntity(selectionTool, entity, selectedObject?.name, { ...opts, ...options });

    if (cancel) return;
    if (!bytes) {
      alert('압축 PLY 데이터를 생성할 수 없습니다.');
      return;
    }

    window.__showGlobalLoadingOverlay?.(t('loading.exportingCompressedPly'), 100);

    if (fileHandle) {
      let writable;
      try {
        writable = await fileHandle.createWritable({ keepExistingData: false });
        if (cancel) {
          try { await writable.abort?.(); } catch (_) {}
          return;
        }
        await writable.write(bytes);
        await writable.close();
      } catch (e) {
        if (e?.name === 'AbortError' || cancel) {
          if (writable) try { await writable.abort?.(); } catch (_) {}
          return;
        }
        if (writable) try { await writable.abort?.(); } catch (_) {}
        await saveBlobWithDialog(new Blob([bytes], { type: mime }), suggestedName, mime);
      }
    } else {
      await saveBlobWithDialog(new Blob([bytes], { type: mime }), suggestedName, mime);
    }
  } finally {
    window.__hideGlobalLoadingOverlay?.();
  }
}