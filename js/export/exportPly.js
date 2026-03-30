/**
 * PLY export – SuperSplat-style: vertex properties, SingleSplat read/transform/write, bakeWorldTransform.
 * v7: SH coefficient rotation (3DGS basis) so inspector rotation doesn’t desaturate colors.
 */

import { Zip, ZipPassThrough } from 'fflate';
import { t } from '../i18n.js';

/** Property type → byte size (SuperSplat DataTypeSize). */
function dataTypeSize(type) {
  const t = String(type).toLowerCase();
  return { char: 1, uchar: 1, short: 2, ushort: 2, int: 4, uint: 4, float: 4, double: 8 }[t] ?? 4;
}

const PLY_TYPE_MAP = {
  char:    { size: 1, writer: 'setInt8',    reader: 'getInt8'    },
  uchar:   { size: 1, writer: 'setUint8',   reader: 'getUint8'   },
  int8:    { size: 1, writer: 'setInt8',    reader: 'getInt8'    },
  uint8:   { size: 1, writer: 'setUint8',   reader: 'getUint8'   },
  short:   { size: 2, writer: 'setInt16',   reader: 'getInt16'   },
  ushort:  { size: 2, writer: 'setUint16',  reader: 'getUint16'  },
  int:     { size: 4, writer: 'setInt32',   reader: 'getInt32'   },
  uint:    { size: 4, writer: 'setUint32',  reader: 'getUint32'  },
  int32:   { size: 4, writer: 'setInt32',   reader: 'getInt32'   },
  uint32:  { size: 4, writer: 'setUint32',  reader: 'getUint32'  },
  float:   { size: 4, writer: 'setFloat32', reader: 'getFloat32' },
  float32: { size: 4, writer: 'setFloat32', reader: 'getFloat32' },
  double:  { size: 8, writer: 'setFloat64', reader: 'getFloat64' },
  float64: { size: 8, writer: 'setFloat64', reader: 'getFloat64' },
};

const CANONICAL_TYPE = {
  float32: 'float', float64: 'double',
  int8: 'char', uint8: 'uchar', int16: 'short', uint16: 'ushort',
  int32: 'int', uint32: 'uint',
};

function canonicalType(t) { return CANONICAL_TYPE[t] || t; }

const REQUIRED_PROPS = [
  'x','y','z','f_dc_0','f_dc_1','f_dc_2','opacity',
  'scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3',
];

const INTERNAL_PROPS = ['state', 'transform'];

const CANONICAL_PROP_ORDER = [
  'x','y','z','f_dc_0','f_dc_1','f_dc_2','opacity',
  'scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3',
];

/** Export property list from vertex.properties; exclude internalProps; optional maxSHBands. */
function getExportProps(gsplatData, options = {}) {
  const vertex = gsplatData?.elements?.find(e => e.name === 'vertex') || gsplatData?.elements?.[0];
  if (!vertex?.properties?.length) return [];
  const maxSHBands = options.maxSHBands ?? 3;
  const byName = new Map(
    vertex.properties
      .filter((p) => p.storage && !INTERNAL_PROPS.includes(p.name))
      .map((p) => [p.name, p])
  );
  const ordered = [];
  for (const name of CANONICAL_PROP_ORDER) {
    if (byName.has(name)) ordered.push(byName.get(name));
  }
  const fRest = [...byName.keys()].filter((n) => /^f_rest_\d+$/.test(n));
  const bandLimit = [0, 9, 24, 45][maxSHBands] ?? 45;
  fRest.sort((a, b) => parseInt(a.replace('f_rest_', ''), 10) - parseInt(b.replace('f_rest_', ''), 10));
  for (const name of fRest) {
    const idx = parseInt(name.replace('f_rest_', ''), 10);
    if (idx < bandLimit) ordered.push(byName.get(name));
  }
  for (const [name, p] of byName) {
    if (!CANONICAL_PROP_ORDER.includes(name) && !/^f_rest_\d+$/.test(name)) ordered.push(p);
  }
  return ordered.map((p) => ({ name: p.name, type: canonicalType(p.type) || 'float' }));
}

const DEFAULT_OPTIONS = { bakeWorldTransform: true, debug: false };

export function validatePlyBinary(plyBytes, sampleCount = 3) {
  const warnings = [];
  const decoder = new TextDecoder();

  let headerEndIdx = -1;
  const endHeaderStr = 'end_header\n';
  const endHeaderBytes = new TextEncoder().encode(endHeaderStr);
  for (let i = 0; i <= plyBytes.length - endHeaderBytes.length; i++) {
    let match = true;
    for (let j = 0; j < endHeaderBytes.length; j++) {
      if (plyBytes[i + j] !== endHeaderBytes[j]) { match = false; break; }
    }
    if (match) { headerEndIdx = i + endHeaderBytes.length; break; }
  }
  if (headerEndIdx < 0) {
    return { ok: false, header: '', vertexCount: 0, properties: [], samples: [], warnings: ['end_header not found'] };
  }

  const headerStr = decoder.decode(plyBytes.slice(0, headerEndIdx));
  const lines = headerStr.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (!lines.some(l => l === 'format binary_little_endian 1.0'))
    warnings.push('format is not binary_little_endian 1.0');

  let vertexCount = 0;
  const vtxLine = lines.find(l => l.startsWith('element vertex'));
  if (vtxLine) vertexCount = parseInt(vtxLine.split(/\s+/)[2], 10);
  else warnings.push('element vertex line not found');

  const properties = [];
  for (const l of lines) {
    if (l.startsWith('property ')) {
      const parts = l.split(/\s+/);
      if (parts.length >= 3) properties.push({ type: parts[1], name: parts[2] });
    }
  }

  const propNames = new Set(properties.map(p => p.name));
  for (const req of REQUIRED_PROPS) {
    if (!propNames.has(req)) warnings.push(`Missing required property: ${req}`);
  }

  let bytesPerVertex = 0;
  for (const p of properties) {
    const info = PLY_TYPE_MAP[p.type];
    bytesPerVertex += info ? info.size : 4;
    if (!info) warnings.push(`Unknown type: ${p.type} (property: ${p.name})`);
  }

  const dataStart = headerEndIdx;
  const expectedSize = dataStart + vertexCount * bytesPerVertex;
  if (plyBytes.length < expectedSize)
    warnings.push(`File too small: expected ${expectedSize}, got ${plyBytes.length}`);
  else if (plyBytes.length > expectedSize)
    warnings.push(`File too large: expected ${expectedSize}, got ${plyBytes.length}`);

  const dv = new DataView(plyBytes.buffer, plyBytes.byteOffset, plyBytes.byteLength);
  const samples = [];
  for (let vi = 0; vi < Math.min(sampleCount, vertexCount); vi++) {
    let off = dataStart + vi * bytesPerVertex;
    const vertex = {};
    for (const p of properties) {
      const info = PLY_TYPE_MAP[p.type] || { size: 4, reader: 'getFloat32' };
      vertex[p.name] = info.size === 1 ? dv[info.reader](off) : dv[info.reader](off, true);
      off += info.size;
    }
    samples.push(vertex);
  }

  return { ok: warnings.length === 0, header: headerStr, vertexCount, properties, samples, warnings, bytesPerVertex, dataStart };
}

export function comparePlyWithSource(gsplatData, plyBytes, sampleIndices = [0, 1, 2]) {
  const validation = validatePlyBinary(plyBytes, sampleIndices.length);
  if (!validation.ok && validation.warnings.some(w => w.includes('end_header'))) {
    console.error('[PLY Compare] Parse failed:', validation.warnings);
    return;
  }
  const vertex = gsplatData?.elements?.find(e => e.name === 'vertex') || gsplatData?.elements?.[0];
  if (!vertex) { console.error('[PLY Compare] No vertex element'); return; }
  const propMap = {};
  for (const p of vertex.properties) propMap[p.name] = p;

  console.group('[PLY Compare] source gsplatData vs exported PLY');
  for (let si = 0; si < sampleIndices.length && si < validation.samples.length; si++) {
    const srcIdx = sampleIndices[si];
    const exported = validation.samples[si];
    console.group(`Vertex #${srcIdx}`);
    for (const key of REQUIRED_PROPS) {
      const srcVal = propMap[key]?.storage?.[srcIdx];
      const expVal = exported?.[key];
      const match = srcVal !== undefined && expVal !== undefined && Math.abs(srcVal - expVal) < 1e-5;
      console.log(`  ${key}: src=${srcVal?.toFixed?.(6) ?? 'N/A'} → exp=${expVal?.toFixed?.(6) ?? 'N/A'} ${match ? '✅' : '⚠️ mismatch'}`);
    }
    console.groupEnd();
  }
  console.groupEnd();
}

function getDataFromMat4(mat4) {
  return mat4?.data ?? (Array.isArray(mat4) ? mat4 : null);
}

function transformPointByMat4(mat4, x, y, z) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return { x, y, z };
  return {
    x: d[0]*x + d[4]*y + d[8]*z + d[12],
    y: d[1]*x + d[5]*y + d[9]*z + d[13],
    z: d[2]*x + d[6]*y + d[10]*z + d[14],
  };
}

const MIN_WORLD_SCALE = 1e-6;

function getQuatFromMat4(mat4) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return { w: 1, x: 0, y: 0, z: 0 };

  // Remove scale
  let r00 = d[0], r10 = d[1], r20 = d[2];
  let r01 = d[4], r11 = d[5], r21 = d[6];
  let r02 = d[8], r12 = d[9], r22 = d[10];
  const s0 = Math.sqrt(r00*r00 + r10*r10 + r20*r20) || 1;
  const s1 = Math.sqrt(r01*r01 + r11*r11 + r21*r21) || 1;
  const s2 = Math.sqrt(r02*r02 + r12*r12 + r22*r22) || 1;
  r00/=s0; r10/=s0; r20/=s0;
  r01/=s1; r11/=s1; r21/=s1;
  r02/=s2; r12/=s2; r22/=s2;

  // Shepperd method
  const tr = r00 + r11 + r22;
  let w, x, y, z;
  if (tr > 0) {
    const s = 2.0 * Math.sqrt(tr + 1.0);
    w = 0.25 * s; x = (r21-r12)/s; y = (r02-r20)/s; z = (r10-r01)/s;
  } else if (r00 > r11 && r00 > r22) {
    const s = 2.0 * Math.sqrt(1.0+r00-r11-r22);
    w = (r21-r12)/s; x = 0.25*s; y = (r01+r10)/s; z = (r02+r20)/s;
  } else if (r11 > r22) {
    const s = 2.0 * Math.sqrt(1.0+r11-r00-r22);
    w = (r02-r20)/s; x = (r01+r10)/s; y = 0.25*s; z = (r12+r21)/s;
  } else {
    const s = 2.0 * Math.sqrt(1.0+r22-r00-r11);
    w = (r10-r01)/s; x = (r02+r20)/s; y = (r12+r21)/s; z = 0.25*s;
  }
  const len = Math.sqrt(w*w + x*x + y*y + z*z) || 1;
  return { w: w/len, x: x/len, y: y/len, z: z/len };
}

function getScaleFromMat4(mat4) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return { x: 1, y: 1, z: 1 };
  let sx = Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]);
  let sy = Math.sqrt(d[4]*d[4] + d[5]*d[5] + d[6]*d[6]);
  let sz = Math.sqrt(d[8]*d[8] + d[9]*d[9] + d[10]*d[10]);
  if (!Number.isFinite(sx) || sx < MIN_WORLD_SCALE) sx = MIN_WORLD_SCALE;
  if (!Number.isFinite(sy) || sy < MIN_WORLD_SCALE) sy = MIN_WORLD_SCALE;
  if (!Number.isFinite(sz) || sz < MIN_WORLD_SCALE) sz = MIN_WORLD_SCALE;
  return { x: sx, y: sy, z: sz };
}

/** 4x4 column-major → row-major 3x3 rotation (scale stripped). */
function getRotMat3FromMat4(mat4) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return [1,0,0, 0,1,0, 0,0,1];

  let r00 = d[0], r10 = d[1], r20 = d[2];
  let r01 = d[4], r11 = d[5], r21 = d[6];
  let r02 = d[8], r12 = d[9], r22 = d[10];
  const s0 = Math.sqrt(r00*r00 + r10*r10 + r20*r20) || 1;
  const s1 = Math.sqrt(r01*r01 + r11*r11 + r21*r21) || 1;
  const s2 = Math.sqrt(r02*r02 + r12*r12 + r22*r22) || 1;

  // column-major d[] → row-major 3x3
  // row 0 (x): d[0]/s0, d[4]/s1, d[8]/s2
  // row 1 (y): d[1]/s0, d[5]/s1, d[9]/s2
  // row 2 (z): d[2]/s0, d[6]/s1, d[10]/s2
  return [
    r00/s0, r01/s1, r02/s2,
    r10/s0, r11/s1, r12/s2,
    r20/s0, r21/s1, r22/s2,
  ];
}

function quatMul(q1, q2) {
  const w = q1.w*q2.w - q1.x*q2.x - q1.y*q2.y - q1.z*q2.z;
  const x = q1.w*q2.x + q1.x*q2.w + q1.y*q2.z - q1.z*q2.y;
  const y = q1.w*q2.y - q1.x*q2.z + q1.y*q2.w + q1.z*q2.x;
  const z = q1.w*q2.z + q1.x*q2.y - q1.y*q2.x + q1.z*q2.w;
  const len = Math.sqrt(w*w + x*x + y*y + z*z) || 1;
  return { w: w/len, x: x/len, y: y/len, z: z/len };
}

function isNearIdentityFull(d, eps = 0.001) {
  if (!d || d.length < 16) return true;
  const I = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  for (let i = 0; i < 16; i++) {
    if (Math.abs((d[i]??0) - I[i]) > eps) return false;
  }
  return true;
}

function mat4MulRotZNeg180(mat4) {
  const d = getDataFromMat4(mat4);
  if (!d || d.length < 16) return null;
  return new Float32Array([
    -d[0], -d[1], d[2], 0,
    -d[4], -d[5], d[6], 0,
    -d[8], -d[9], d[10], 0,
    -d[12], -d[13], d[14], d[15]
  ]);
}

/** Extract user transform from world mat4; strip viewer Rz180; return null if none. */
function extractUserTransform(worldMat4, debug = false) {
  const d = getDataFromMat4(worldMat4);
  if (!d || d.length < 16) return null;

  // Identity → no user transform
  if (isNearIdentityFull(d)) return null;

  // Rz180 check
  const Rz180 = [-1,0,0,0, 0,-1,0,0, 0,0,1,0, 0,0,0,1];
  let isRz180 = true;
  for (let i = 0; i < 16; i++) {
    if (Math.abs((d[i]??0) - Rz180[i]) > 0.001) { isRz180 = false; break; }
  }
  if (isRz180) return null;

  // Try stripping Rz180
  const stripped = mat4MulRotZNeg180(worldMat4);
  if (isNearIdentityFull(stripped)) return null;

  // Include Rz180 if result is closer to Identity after strip
  const distWorld = d.reduce((s, v, i) => {
    const I = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    return s + (v - I[i]) ** 2;
  }, 0);
  const distStripped = stripped.reduce((s, v, i) => {
    const I = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    return s + (v - I[i]) ** 2;
  }, 0);

  if (distStripped < distWorld) {
    if (debug) console.log('[extractUserTransform] Rz180 stripped');
    return { data: stripped };
  } else {
    if (debug) console.log('[extractUserTransform] world unchanged');
    return worldMat4;
  }
}

// 3DGS SH constants (diff-gaussian-rasterization)
const SH_C1 = 0.4886025119029199;
const SH_C2 = [1.0925484305920792, 1.0925484305920792, 0.31539156525252005, 1.0925484305920792, 0.5462742152960396];
const SH_C3 = [
  -0.5900435899266435,
  2.890611442640554,
  -0.4570457994644658,
  0.3731763325901154,
  -0.4570457994644658,
  1.445305721320277,
  -0.5900435899266435,
];

function evalSHBasis(band, x, y, z) {
  if (band === 1) {
    return [
      -SH_C1 * y,
       SH_C1 * z,
      -SH_C1 * x,
    ];
  }
  if (band === 2) {
    return [
      SH_C2[0] * x * y,
      SH_C2[1] * y * z,
      SH_C2[2] * (2*z*z - x*x - y*y),
      SH_C2[3] * x * z,
      SH_C2[4] * (x*x - y*y),
    ];
  }
  if (band === 3) {
    const xx = x*x, yy = y*y, zz = z*z;
    return [
      SH_C3[0] * y * (3*xx - yy),
      SH_C3[1] * x * y * z,
      SH_C3[2] * y * (4*zz - xx - yy),
      SH_C3[3] * z * (2*zz - 3*xx - 3*yy),
      SH_C3[4] * x * (4*zz - xx - yy),
      SH_C3[5] * z * (xx - yy),
      SH_C3[6] * x * (xx - 3*yy),
    ];
  }
  return [];
}

function generateTestDirections(count) {
  const dirs = [];
  const phi = (1 + Math.sqrt(5)) / 2; // golden ratio
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / count);
    const angle = 2 * Math.PI * i / phi;
    dirs.push([
      Math.sin(theta) * Math.cos(angle),
      Math.sin(theta) * Math.sin(angle),
      Math.cos(theta),
    ]);
  }
  return dirs;
}

function invertMatrix(M) {
  const n = M.length;
  // Augmented matrix [M | I]
  const aug = M.map((row, i) => {
    const ext = new Float64Array(2 * n);
    for (let j = 0; j < n; j++) ext[j] = row[j];
    ext[n + i] = 1;
    return ext;
  });

  for (let col = 0; col < n; col++) {
    // Pivot selection
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-14) return null; // Singular

    // Normalize pivot row
    for (let j = 0; j < 2*n; j++) aug[col][j] /= pivot;

    // Eliminate
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2*n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }

  // Extract inverse
  return aug.map(row => Array.from(row.slice(n)));
}

function computeSHRotationMatrix(band, rotMat3) {
  const n = 2 * band + 1;
  const R = rotMat3;

  // Build overdetermined system from test directions
  const numDirs = Math.max(n * 3, 50);
  const testDirs = generateTestDirections(numDirs);

  // A[k][j] = basis_j(d_k), B[k][j] = basis_j(R * d_k)
  const A = [];
  const B = [];

  for (let k = 0; k < numDirs; k++) {
    const [x, y, z] = testDirs[k];
    // R * d (row-major: R[row*3+col])
    const rx = R[0]*x + R[1]*y + R[2]*z;
    const ry = R[3]*x + R[4]*y + R[5]*z;
    const rz = R[6]*x + R[7]*y + R[8]*z;

    A.push(evalSHBasis(band, x, y, z));
    B.push(evalSHBasis(band, rx, ry, rz));
  }

  // Least squares: X = (A^T A)^{-1} A^T B; this X is D^T (transpose of D)
  const AtA = Array.from({ length: n }, () => new Float64Array(n));
  const AtB = Array.from({ length: n }, () => new Float64Array(n));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sumAA = 0, sumAB = 0;
      for (let k = 0; k < numDirs; k++) {
        sumAA += A[k][i] * A[k][j];
        sumAB += A[k][i] * B[k][j];
      }
      AtA[i][j] = sumAA;
      AtB[i][j] = sumAB;
    }
  }

  const AtAinv = invertMatrix(AtA.map(r => Array.from(r)));
  if (!AtAinv) {
    console.warn(`[SH Rotation] Band ${band} inverse failed, using identity`);
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
    );
  }

  // X = AtAinv * AtB (this is D^T)
  const Dt = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) sum += AtAinv[i][k] * AtB[k][j];
      Dt[i][j] = sum;
    }
  }

  // [v7] Transpose to get D from D^T. c_new = D * c_old is correct SH rotation.
  const D = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Dt[j][i])
  );

  return D;
}

function createSHRotationMatrices(rotMat3, maxBand) {
  // Skip if rotation is near identity
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
    let sum = 0;
    for (let j = 0; j < n; j++) sum += mat[i][j] * vec[j];
    tmp[i] = sum;
  }
  for (let i = 0; i < n; i++) vec[i] = tmp[i];
}

function detectSHBands(propNames) {
  let maxIdx = -1;
  for (const name of propNames) {
    const m = name.match(/^f_rest_(\d+)$/);
    if (m) {
      const idx = parseInt(m[1], 10);
      if (idx > maxIdx) maxIdx = idx;
    }
  }
  if (maxIdx >= 44) return 3;
  if (maxIdx >= 23) return 2;
  if (maxIdx >= 8)  return 1;
  return 0;
}

function coeffsPerChannel(numBands) {
  return [0, 3, 8, 15][numBands] ?? 0;
}

/** SingleSplat-style reader: read(i) fills data, applies world transform + SH rotation. */
function createSingleSplat(gsplatData, propNames, opts) {
  const data = {};
  propNames.forEach((name) => { data[name] = 0; });

  const hasPos = ['x', 'y', 'z'].every((k) => k in data);
  const hasRot = ['rot_0', 'rot_1', 'rot_2', 'rot_3'].every((k) => k in data);
  const hasScale = ['scale_0', 'scale_1', 'scale_2'].every((k) => k in data);

  const getProp =
    typeof gsplatData.getProp === 'function'
      ? (name) => gsplatData.getProp(name)
      : (name) => {
          const el = gsplatData?.elements?.find((e) => e.name === 'vertex') || gsplatData?.elements?.[0];
          return el?.properties?.find((pr) => pr.name === name)?.storage ?? null;
        };

  const srcArrays = {};
  propNames.forEach((name) => { srcArrays[name] = getProp(name); });

  let worldQuat = null;
  let worldScale = null;
  let shRotMats = null;  // [v7] SH rotation matrices

  if (opts.worldMat4) {
    worldQuat = getQuatFromMat4(opts.worldMat4);
    worldScale = getScaleFromMat4(opts.worldMat4);

    // [v7] Precompute SH rotation matrices
    const numBands = detectSHBands(propNames);
    if (numBands > 0) {
      const rotMat3 = getRotMat3FromMat4(opts.worldMat4);
      shRotMats = createSHRotationMatrices(rotMat3, numBands);
      if (opts.debug) {
        console.log(`[SH Rotation] ${numBands} bands detected, rotation matrices computed`);
      }
    }
  }

  // [v7] Precompute SH coefficient index mapping
  const numBands = detectSHBands(propNames);
  const cpc = coeffsPerChannel(numBands); // coefficients per channel
  const shChannelOffsets = [0, cpc, cpc * 2]; // f_rest start offset per R,G,B channel

  function read(i) {
    for (const name of propNames) {
      const arr = srcArrays[name];
      data[name] = arr && i < arr.length ? arr[i] : 0;
    }

    if (opts.worldMat4) {
      // 1. Position transform
      if (hasPos) {
        const t = transformPointByMat4(opts.worldMat4, data.x, data.y, data.z);
        data.x = t.x;
        data.y = t.y;
        data.z = t.z;
      }
      // 2. Rotation transform (Hamilton product)
      if (hasRot && worldQuat) {
        const localQ = { w: data.rot_0, x: data.rot_1, y: data.rot_2, z: data.rot_3 };
        const result = quatMul(worldQuat, localQ);
        data.rot_0 = result.w;
        data.rot_1 = result.x;
        data.rot_2 = result.y;
        data.rot_3 = result.z;
      }
      // 3. Scale transform (log-space)
      if (hasScale && worldScale) {
        data.scale_0 += Math.log(worldScale.x);
        data.scale_1 += Math.log(worldScale.y);
        data.scale_2 += Math.log(worldScale.z);
      }

    }
    // 선택 중심을 원점으로: PLY에 쓸 때 중심이 (0,0,0)이 되도록 이동 (worldMat4 유무와 무관)
    if (opts.translateToOrigin && hasPos) {
      data.x -= opts.translateToOrigin.x;
      data.y -= opts.translateToOrigin.y;
      data.z -= opts.translateToOrigin.z;
    }

    if (opts.worldMat4) {
      // 4. [v7] SH coefficient rotation (f_rest channel-major; band1: 3, band2: 5, band3: 7 coeffs)
      if (shRotMats && cpc > 0) {
        for (let ch = 0; ch < 3; ch++) {
          const base = shChannelOffsets[ch]; // f_rest offset

          // Band 1 rotation (3 coeffs)
          if (shRotMats.band1 && cpc >= 3) {
            const coeffs = [
              data[`f_rest_${base + 0}`],
              data[`f_rest_${base + 1}`],
              data[`f_rest_${base + 2}`],
            ];
            applySHRotation(coeffs, shRotMats.band1);
            data[`f_rest_${base + 0}`] = coeffs[0];
            data[`f_rest_${base + 1}`] = coeffs[1];
            data[`f_rest_${base + 2}`] = coeffs[2];
          }

          // Band 2 rotation (5 coeffs)
          if (shRotMats.band2 && cpc >= 8) {
            const coeffs = [
              data[`f_rest_${base + 3}`],
              data[`f_rest_${base + 4}`],
              data[`f_rest_${base + 5}`],
              data[`f_rest_${base + 6}`],
              data[`f_rest_${base + 7}`],
            ];
            applySHRotation(coeffs, shRotMats.band2);
            data[`f_rest_${base + 3}`] = coeffs[0];
            data[`f_rest_${base + 4}`] = coeffs[1];
            data[`f_rest_${base + 5}`] = coeffs[2];
            data[`f_rest_${base + 6}`] = coeffs[3];
            data[`f_rest_${base + 7}`] = coeffs[4];
          }

          // Band 3 rotation (7 coeffs)
          if (shRotMats.band3 && cpc >= 15) {
            const coeffs = [
              data[`f_rest_${base + 8}`],
              data[`f_rest_${base + 9}`],
              data[`f_rest_${base + 10}`],
              data[`f_rest_${base + 11}`],
              data[`f_rest_${base + 12}`],
              data[`f_rest_${base + 13}`],
              data[`f_rest_${base + 14}`],
            ];
            applySHRotation(coeffs, shRotMats.band3);
            data[`f_rest_${base + 8}`]  = coeffs[0];
            data[`f_rest_${base + 9}`]  = coeffs[1];
            data[`f_rest_${base + 10}`] = coeffs[2];
            data[`f_rest_${base + 11}`] = coeffs[3];
            data[`f_rest_${base + 12}`] = coeffs[4];
            data[`f_rest_${base + 13}`] = coeffs[5];
            data[`f_rest_${base + 14}`] = coeffs[6];
          }
        }
      }
    }

    return data;
  }

  return { data, read };
}

export function writePlyBinary(gsplatData, keepMask, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const props = getExportProps(gsplatData, opts);
  if (!props.length) {
    console.error('[writePlyBinary] No vertex element or properties.');
    return null;
  }

  const count = gsplatData.numSplats;
  let keepCount = 0;
  for (let i = 0; i < count; i++) {
    if (keepMask(i)) keepCount++;
  }
  if (keepCount === 0) {
    console.warn('[writePlyBinary] Zero vertices to keep.');
    return null;
  }

  const gaussianSizeBytes = props.reduce((tot, p) => tot + dataTypeSize(p.type), 0);
  const headerText = [
    'ply',
    'format binary_little_endian 1.0',
    `element vertex ${keepCount}`,
    ...props.map((p) => `property ${p.type} ${p.name}`),
    'end_header',
    '',
  ].join('\n');

  const header = new TextEncoder().encode(headerText);
  const totalSize = header.byteLength + keepCount * gaussianSizeBytes;
  const buffer = new ArrayBuffer(totalSize);
  const u8 = new Uint8Array(buffer);
  u8.set(header, 0);
  const dv = new DataView(buffer);
  let offset = header.byteLength;

  const singleSplat = createSingleSplat(gsplatData, props.map((p) => p.name), opts);
  let debugCount = 0;

  for (let i = 0; i < count; i++) {
    if (!keepMask(i)) continue;

    singleSplat.read(i);

    if (opts.debug && debugCount < 3) {
      console.log(`[writePlyBinary] Vertex ${i}:`, { ...singleSplat.data });
      debugCount++;
    }

    for (let j = 0; j < props.length; j++) {
      const p = props[j];
      const name = p.name;
      const val = singleSplat.data[name];
      const size = dataTypeSize(p.type);

      if (p.type === 'uchar') {
        dv.setUint8(offset, Math.max(0, Math.min(255, Math.round(Number(val)))));
      } else if (p.type === 'double') {
        dv.setFloat64(offset, Number(val), true);
      } else {
        dv.setFloat32(offset, Number(val), true);
      }
      offset += size;
    }
  }

  const result = new Uint8Array(buffer);
  if (opts.debug) {
    console.group('[writePlyBinary] Validation');
    const validation = validatePlyBinary(result, 3);
console.log('Vertex count:', validation.vertexCount, 'per vertex:', gaussianSizeBytes, 'B');
  console.log('Samples:', validation.samples);
  if (validation.warnings.length) console.warn('Warnings:', validation.warnings);
  else console.log('✅ Validation OK');
    console.groupEnd();
  }
  return result;
}

export function getExportBaseName(name) {
  return (name || 'splat').trim().replace(/\.[^/.]+$/, '') || 'splat';
}

export async function saveBlobWithDialog(blob, suggestedName, mime, fileHandlePromise = null) {
  const fileName = suggestedName;
  const ext = fileName.split('.').pop() || 'bin';

  if (fileHandlePromise) {
    try {
      const fh = await fileHandlePromise;
      const w = await fh.createWritable(); await w.write(blob); await w.close(); return;
    } catch (err) { if (err?.name === 'AbortError') return; }
  }
  if (window.showSaveFilePicker) {
    try {
      const fh = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: ext.toUpperCase(), accept: { [mime]: ['.'+ext] } }],
      });
      const w = await fh.createWritable(); await w.write(blob); await w.close(); return;
    } catch (err) { if (err?.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Unified/Non-unified 공통: entity에서 GSplat 리소스 획득 (selectionTool._getGsplatResource와 동일 경로). */
export function getGsplatResourceFromEntity(entity, selectionTool) {
  if (selectionTool && typeof selectionTool._getGsplatResource === 'function') {
    return selectionTool._getGsplatResource(entity) ?? null;
  }
  const c = entity?.gsplat;
  return c?.instance?.resource ?? c?.asset?.resource ?? c?._placement?.resource ?? null;
}

/**
 * 선택된 점들(노란 점, lastSelectedIndices)만의 무게중심(평균 위치)을 월드 좌표로 반환.
 * 선택 도구가 가리키는 엔티티만 사용하며, 그 엔티티의 선택된 점들만으로 중심을 계산. (다른 엔티티·나머지 점은 사용하지 않음)
 * @param {import('../core/viewer.js').PlayCanvasViewer|null} viewer
 * @param {Object} selectionTool - lastSelectedIndices, getGsplatEntityFromSelection, _getGsplatResource
 * @returns {{ x: number, y: number, z: number } | null}
 */
export function getSelectedPointsCenter(viewer, selectionTool) {
  const selectedIndices = selectionTool?.lastSelectedIndices;
  if (!selectedIndices?.length) return null;

  const entity = selectionTool?.getGsplatEntityFromSelection?.();
  if (!entity?.gsplat) return null;

  const resource = getGsplatResourceFromEntity(entity, selectionTool);
  const gsplatData = resource?.gsplatData;
  if (!gsplatData?.elements?.length) return null;

  const getProp =
    typeof gsplatData.getProp === 'function'
      ? (name) => gsplatData.getProp(name)
      : (name) => {
          const el = gsplatData?.elements?.find((e) => e.name === 'vertex') || gsplatData?.elements?.[0];
          return el?.properties?.find((pr) => pr.name === name)?.storage ?? null;
        };
  const xArr = getProp('x');
  const yArr = getProp('y');
  const zArr = getProp('z');
  if (!xArr || !yArr || !zArr) return null;

  let worldMat4 = null;
  if (typeof entity.getWorldTransform === 'function') {
    const world = entity.getWorldTransform();
    worldMat4 = extractUserTransform(world, false) || getDataFromMat4(world);
  }
  const d = worldMat4 && (worldMat4.data ?? worldMat4);
  const hasTransform = d && d.length >= 16;

  let sx = 0, sy = 0, sz = 0;
  const n = selectedIndices.length;
  for (let k = 0; k < n; k++) {
    const i = selectedIndices[k];
    let x = xArr[i] ?? 0, y = yArr[i] ?? 0, z = zArr[i] ?? 0;
    if (hasTransform) {
      const tx = d[0]*x + d[4]*y + d[8]*z + d[12];
      const ty = d[1]*x + d[5]*y + d[9]*z + d[13];
      const tz = d[2]*x + d[6]*y + d[10]*z + d[14];
      x = tx; y = ty; z = tz;
    }
    sx += x; sy += y; sz += z;
  }
  if (n === 0) return null;
  return { x: sx / n, y: sy / n, z: sz / n };
}

/** Build PLY bytes for entity; optional bakeWorldTransform (strip Rz180, apply user transform + SH). */
function buildPlyForEntity(selectionTool, entity, _fileName, options = {}) {
  const resource = getGsplatResourceFromEntity(entity, selectionTool);
  const gsplatData = resource?.gsplatData;
  if (!gsplatData?.elements?.length) return null;

  const erasedSet = selectionTool._getErasedIndicesForEntity(entity);
  const keepMask = (i) => !erasedSet.has(i);
  const opts = { ...options };

  // Only read entity transform when bakeWorldTransform
  if (opts.bakeWorldTransform && typeof entity?.getWorldTransform === 'function') {
    const world = entity.getWorldTransform();
    const userTransform = extractUserTransform(world, opts.debug);
    if (userTransform) {
      opts.worldMat4 = userTransform;
      if (opts.debug) {
        console.log('[buildPlyForEntity] bakeWorldTransform: applying user transform');
      }
    } else {
      if (opts.debug) {
        console.log('[buildPlyForEntity] bakeWorldTransform: default transform, skip');
      }
    }
  }

  return writePlyBinary(gsplatData, keepMask, opts);
}

/**
 * 선택된 점(노란 점)만 포함한 PLY 바이트 생성. 객체 만들기용.
 * @param {import('../core/viewer.js').PlayCanvasViewer|null} viewer
 * @param {Object} selectionTool - lastSelectedIndices, getGsplatEntityFromSelection, _getGsplatResource
 * @param {Object} [options] - bakeWorldTransform 등
 * @returns {Uint8Array|null}
 */
export function buildPlyBytesForSelectedPointsOnly(viewer, selectionTool, options = {}) {
  const v = viewer ?? window.__viewer;
  const entity = v?.getSelectedObject?.()?.entity ?? selectionTool?.getGsplatEntityFromSelection?.();
  if (!entity?.gsplat) return null;

  const selectedIndices = selectionTool?.lastSelectedIndices;
  if (!selectedIndices?.length) return null;

  const resource = getGsplatResourceFromEntity(entity, selectionTool);
  const gsplatData = resource?.gsplatData;
  if (!gsplatData?.elements?.length) return null;

  const selectedSet = new Set(selectedIndices);
  const keepMask = (i) => selectedSet.has(i);
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.bakeWorldTransform !== false && typeof entity.getWorldTransform === 'function') {
    const world = entity.getWorldTransform();
    const userTransform = extractUserTransform(world, opts.debug);
    if (userTransform) opts.worldMat4 = userTransform;
  }
  // opts.translateToOrigin이 있으면 PLY 내 위치가 해당 점을 원점으로 하여 기록됨 (객체 만들기 시 선택 중심)
  const bytes = writePlyBinary(gsplatData, keepMask, opts);
  return bytes ? (bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)) : null;
}

export function getExportOptionsFromWorldMat4(worldMat4, options = {}) {
  const base = { ...DEFAULT_OPTIONS };
  if (!worldMat4) return base;
  if (options.useFullWorldMatrix) {
    base.worldMat4 = worldMat4;
    return base;
  }
  const userTransform = extractUserTransform(worldMat4);
  if (userTransform) base.worldMat4 = userTransform;
  return base;
}

function createZipWriteCallback(writable) {
  let writeChain = Promise.resolve();
  let zipDoneResolve, zipDoneReject;
  const zipDone = new Promise((res, rej) => { zipDoneResolve = res; zipDoneReject = rej; });
  const ondata = (err, data, final) => {
    if (err) { zipDoneReject(err); return; }
    if (data?.length) writeChain = writeChain.then(() => writable.write(data)).catch(e => zipDoneReject(e));
    if (final) writeChain.then(() => writable.close()).then(zipDoneResolve).catch(zipDoneReject);
  };
  return { ondata, zipDone };
}

/**
 * 선택된 오브젝트(단일/멀티/시퀀스) 기준으로 지움 반영 PLY 내보내기.
 * @param {import('../core/viewer.js').PlayCanvasViewer|null} [viewer] - 없으면 window.__viewer 사용
 * @param {Object} selectionTool - SelectionTool (getResource, erase 등)
 * @param {Object} [options] - getExportOptionsFromWorldMat4 등 PLY 옵션
 */
export async function exportFilteredPlyForSelectedObject(viewer, selectionTool, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const v = viewer ?? window.__viewer;
  const selectedObject = v?.getSelectedObject?.();
  if (!selectedObject || !selectionTool) {
    alert('선택된 오브젝트가 없거나 내보낼 수 없습니다.');
    return;
  }

  const base = getExportBaseName(selectedObject.name || selectedObject.id);
  const isMulti = !!(selectedObject.isMultiFile && Array.isArray(selectedObject.files) && selectedObject.files.length > 0);

  try {
    // Multi
    if (isMulti) {
      const suggestedName = `with_${base}.zip`;
      let fileHandle = null;
      if (typeof window.showSaveFilePicker === 'function') {
        try { fileHandle = await window.showSaveFilePicker({ suggestedName, types: [{ description: 'ZIP', accept: { 'application/zip': ['.zip'] } }] }); }
        catch (e) { if (e?.name === 'AbortError') return; }
      }
      if (!fileHandle) { alert('저장할 위치를 선택해 주세요.'); return; }

      let writable;
      try { writable = await fileHandle.createWritable({ keepExistingData: false }); }
      catch (e) { if (e?.name === 'AbortError') return; alert('파일을 쓸 수 없습니다.'); return; }

      const totalCount = selectedObject.files.length;
      let cancel = false;
      window.__showGlobalLoadingOverlay?.(t('loading.exportingPly'), 0, { showCancel: true, onCancel: () => { cancel = true; } });
      const { ondata: zipOnData, zipDone } = createZipWriteCallback(writable);
      const zip = new Zip(zipOnData);

      for (let i = 0; i < totalCount; i++) {
        if (cancel) break;
        const f = selectedObject.files[i]; const entity = f?.entity;
        if (!entity?.gsplat) continue;
        const bytes = buildPlyForEntity(selectionTool, entity, f?.fileName, opts);
        if (!bytes) continue;
        const name = getExportBaseName(f?.fileName || entity?.name) + '.ply';
        const pt = new ZipPassThrough(name);
        zip.add(pt); pt.push(bytes, true);
        window.__showGlobalLoadingOverlay?.(t('loading.exportingPly'), Math.round(((i+1)/totalCount)*100), { showCancel: true, onCancel: () => { cancel = true; } });
      }
      if (cancel) { try { await writable.abort?.(); } catch(_){} return; }
      zip.end(); await zipDone; return;
    }

    // Single
    const suggestedName = `with_${base}.ply`;
    const mime = 'application/octet-stream';
    let fileHandle = null;
    if (typeof window.showSaveFilePicker === 'function') {
      try { fileHandle = await window.showSaveFilePicker({ suggestedName, types: [{ description: 'PLY', accept: { [mime]: ['.ply'] } }] }); }
      catch (e) { if (e?.name === 'AbortError') return; }
    }

    const entity = selectionTool.getGsplatEntityFromSelection?.();
    if (!entity?.gsplat) { alert('내보낼 PLY 엔티티를 찾을 수 없습니다.'); return; }

    let cancel = false;
    window.__showGlobalLoadingOverlay?.(t('loading.exportingPly'), 0, { showCancel: true, onCancel: () => { cancel = true; } });

    const bytes = buildPlyForEntity(selectionTool, entity, selectedObject?.name, opts);
    if (cancel) return;
    if (!bytes) { alert('PLY 데이터를 생성할 수 없습니다.'); return; }

    if (opts.debug) {
      const res = getGsplatResourceFromEntity(entity, selectionTool);
      if (res?.gsplatData) comparePlyWithSource(res.gsplatData, bytes, [0, 1, 2]);
    }

    window.__showGlobalLoadingOverlay?.(t('loading.exportingPly'), 100);

    if (fileHandle) {
      let writable;
      try {
        writable = await fileHandle.createWritable({ keepExistingData: false });
        if (cancel) { try { await writable.abort?.(); } catch(_){} return; }
        await writable.write(bytes); await writable.close();
      } catch (e) {
        if (e?.name === 'AbortError' || cancel) { if (writable) try { await writable.abort?.(); } catch(_){} return; }
        if (writable) try { await writable.abort?.(); } catch(_){}
        await saveBlobWithDialog(new Blob([bytes], { type: mime }), suggestedName, mime);
      }
    } else {
      await saveBlobWithDialog(new Blob([bytes], { type: mime }), suggestedName, mime);
    }
  } finally {
    window.__hideGlobalLoadingOverlay?.();
  }
}