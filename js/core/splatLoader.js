/**
 * PLY/splat loading via @playcanvas/splat-transform.
 * Optional Morton-order reorder for large PLY; use skipReorder for sequences.
 */

import {
  getInputFormat,
  readFile,
  sortMortonOrder,
  MemoryReadFileSystem,
} from '@playcanvas/splat-transform';

const DEFAULT_OPTIONS = {
  iterations: 10,
  lodSelect: [0],
  unbundled: false,
  lodChunkCount: 512,
  lodChunkExtent: 16,
};

const COLUMN_TYPE_TO_GSPLAT = {
  int8: 'char',
  uint8: 'uchar',
  int16: 'short',
  uint16: 'ushort',
  int32: 'int',
  uint32: 'uint',
  float32: 'float',
  float64: 'double',
};

function columnTypeToGSplatType(colType) {
  return COLUMN_TYPE_TO_GSPLAT[colType] ?? 'float';
}

/** splat-transform DataTable → PlayCanvas GSplatData */
function dataTableToGSplatData(dataTable, pc) {
  const properties = dataTable.columns.map((col) => ({
    type: columnTypeToGSplatType(col.dataType),
    name: col.name,
    storage: col.data,
    byteSize: col.data.BYTES_PER_ELEMENT ?? 4,
  }));

  const gsplatData = new pc.GSplatData([
    {
      name: 'vertex',
      count: dataTable.numRows,
      properties,
    },
  ]);

  if (
    gsplatData.getProp('scale_0') &&
    gsplatData.getProp('scale_1') &&
    !gsplatData.getProp('scale_2')
  ) {
    const scale2 = new Float32Array(gsplatData.numSplats).fill(Math.log(1e-6));
    gsplatData.addProp('scale_2', scale2);
    const props = gsplatData.getElement('vertex').properties;
    const idx = props.findIndex((p) => p.name === 'scale_1');
    if (idx !== -1) {
      const last = props.pop();
      props.splice(idx + 1, 0, last);
    }
  }

  return gsplatData;
}

function validateGSplatData(gsplatData) {
  const required = [
    'x', 'y', 'z',
    'scale_0', 'scale_1', 'scale_2',
    'rot_0', 'rot_1', 'rot_2', 'rot_3',
    'f_dc_0', 'f_dc_1', 'f_dc_2', 'opacity',
  ];
  const missing = required.filter((name) => !gsplatData.getProp(name));
  if (missing.length > 0) {
    throw new Error(
      `Gaussian splat 데이터가 아닙니다. 누락된 속성: ${missing.join(', ')}`
    );
  }
}

/**
 * Read PLY via splat-transform from Blob/ArrayBuffer; optional Morton reorder; return GSplatData.
 * @param {object} pc - PlayCanvas namespace
 * @param {string} filename
 * @param {ArrayBuffer|Blob} bufferOrBlob
 * @param {{ skipReorder?: boolean, skipValidation?: boolean, onProgress?: (percent: number, msg: string) => void }} options
 */
export async function loadGSplatDataWithMorton(pc, filename, bufferOrBlob, options = {}) {
  const skipReorder = options.skipReorder === true;
  const skipValidation = options.skipValidation === true;
  const onProgress = options.onProgress;

  const arrayBuffer = bufferOrBlob instanceof ArrayBuffer
    ? bufferOrBlob
    : await bufferOrBlob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  const fs = new MemoryReadFileSystem();
  const name = (filename || 'splat.ply').toLowerCase();
  fs.set(name, uint8);

  const inputFormat = getInputFormat(filename || 'splat.ply');
  onProgress?.(25, 'Loading...');

  const tables = await readFile({
    filename: name,
    inputFormat,
    options: DEFAULT_OPTIONS,
    params: [],
    fileSystem: fs,
  });

  if (!tables?.length) {
    throw new Error('No splat data in file');
  }

  const table = tables[0];
  onProgress?.(50, 'Processing...');

  const lower = (filename || '').toLowerCase();
  const isCompressedPly = lower.endsWith('.compressed.ply');
  const doMorton = !skipReorder && inputFormat !== 'sog' && !isCompressedPly;

  if (doMorton) {
    const indices = new Uint32Array(table.numRows);
    for (let i = 0; i < indices.length; i++) indices[i] = i;
    sortMortonOrder(table, indices);
    table.permuteRowsInPlace(indices);
  }

  onProgress?.(75, 'Preparing...');
  const gsplatData = dataTableToGSplatData(table, pc);
  if (!skipValidation) validateGSplatData(gsplatData);
  return gsplatData;
}

/**
 * Fetch PLY from URL then load via loadGSplatDataWithMorton.
 * @param {object} pc - PlayCanvas namespace
 * @param {string} url
 * @param {{ skipReorder?: boolean, onProgress?: (percent: number, msg: string) => void, signal?: AbortSignal }} options
 */
export async function loadGSplatDataFromUrl(pc, url, options = {}) {
  const onProgress = options.onProgress;
  onProgress?.(5, 'Downloading...');

  const res = await fetch(url, { signal: options.signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  onProgress?.(15, 'Loaded');

  const filename = url.split('/').pop() || url.split('\\').pop() || 'splat.ply';
  return loadGSplatDataWithMorton(pc, filename, arrayBuffer, options);
}
