/**
 * 2D selection outline: convex hull (fallback) + grid-based concave outline.
 */

/** Monotone chain convex hull. */
export function convexHull2D(points) {
  const n = points.length;
  if (n <= 1) return points.slice();
  const pts = points.slice().sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/** Build corner graph from filled cells, walk boundary loops. */
function traceOrthogonalContours(occ, cw, ch) {
  const at = (i, j) => i >= 0 && i < cw && j >= 0 && j < ch && occ[j * cw + i];
  /** @type {Map<string, string[]>} */
  const adj = new Map();
  const addEdge = (x1, y1, x2, y2) => {
    const a = `${x1},${y1}`;
    const b = `${x2},${y2}`;
    if (a === b) return;
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b);
    adj.get(b).push(a);
  };

  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      if (!at(i, j)) continue;
      if (!at(i, j - 1)) addEdge(i, j, i + 1, j);
      if (!at(i, j + 1)) addEdge(i, j + 1, i + 1, j + 1);
      if (!at(i - 1, j)) addEdge(i, j, i, j + 1);
      if (!at(i + 1, j)) addEdge(i + 1, j, i + 1, j + 1);
    }
  }

  if (adj.size === 0) return [];

  const parse = (k) => {
    const [x, y] = k.split(",").map(Number);
    return { x, y };
  };

  const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  /** Next corner: prefer max cross (y-down screen, keep interior left of path). */
  const pickNext = (prevKey, currKey) => {
    const nbrs = adj.get(currKey);
    if (!nbrs?.length) return null;
    const cand = nbrs.filter((k) => k !== prevKey);
    if (cand.length === 0) return null;
    if (cand.length === 1) return cand[0];
    const pv = parse(prevKey);
    const cv = parse(currKey);
    const fx = cv.x - pv.x;
    const fy = cv.y - pv.y;
    let best = cand[0];
    let bestScore = -Infinity;
    for (const nk of cand) {
      const nv = parse(nk);
      const tx = nv.x - cv.x;
      const ty = nv.y - cv.y;
      const cross = fx * ty - fy * tx;
      if (cross > bestScore || (cross === bestScore && nk < best)) {
        bestScore = cross;
        best = nk;
      }
    }
    return best;
  };

  const used = new Set();
  const loops = [];

  for (const [startA, nbrs] of adj) {
    for (const startB of nbrs) {
      const ek = edgeKey(startA, startB);
      if (used.has(ek)) continue;

      const pathKeys = [startA];
      let prev = startA;
      let curr = startB;
      const maxSteps = adj.size * 8 + 10;
      let ok = false;

      for (let s = 0; s < maxSteps; s++) {
        used.add(edgeKey(prev, curr));
        pathKeys.push(curr);
        if (curr === startA && pathKeys.length > 2) {
          ok = true;
          break;
        }
        const next = pickNext(prev, curr);
        if (!next) break;
        prev = curr;
        curr = next;
      }

      if (ok && pathKeys.length > 3) {
        const poly = pathKeys.slice(0, -1).map(parse);
        if (poly.length >= 3) loops.push(poly);
      }
    }
  }

  return loops;
}

/** 8-neighborhood dilation. */
function dilate8(occ, cw, ch, passes) {
  let cur = occ;
  for (let p = 0; p < passes; p++) {
    const next = new Uint8Array(cw * ch);
    for (let j = 0; j < ch; j++) {
      for (let i = 0; i < cw; i++) {
        if (cur[j * cw + i]) {
          next[j * cw + i] = 1;
          continue;
        }
        let hit = false;
        for (let dj = -1; dj <= 1 && !hit; dj++) {
          for (let di = -1; di <= 1; di++) {
            const ni = i + di;
            const nj = j + dj;
            if (ni >= 0 && ni < cw && nj >= 0 && nj < ch && cur[nj * cw + ni]) {
              hit = true;
              break;
            }
          }
        }
        if (hit) next[j * cw + i] = 1;
      }
    }
    cur = next;
  }
  return cur;
}

/** Douglas–Peucker in screen space. */
function simplifyRdp(pts, eps) {
  if (pts.length < 3) return pts.slice();
  let idx = 0;
  let maxD = 0;
  const a = pts[0];
  const b = pts[pts.length - 1];
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const ab2 = abx * abx + aby * aby || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const t = clamp(((p.x - a.x) * abx + (p.y - a.y) * aby) / ab2, 0, 1);
    const qx = a.x + t * abx;
    const qy = a.y + t * aby;
    const d = Math.hypot(p.x - qx, p.y - qy);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD <= eps) return [a, b];
  const left = simplifyRdp(pts.slice(0, idx + 1), eps);
  const right = simplifyRdp(pts.slice(idx), eps);
  return left.slice(0, -1).concat(right);
}

function polygonAreaSq(poly) {
  let a = 0;
  const m = poly.length;
  for (let i = 0; i < m; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % m];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a);
}

function pointInPolygon(x, y, poly) {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const inter = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi;
    if (inter) inside = !inside;
  }
  return inside;
}

function polygonCentroid(poly) {
  let x = 0;
  let y = 0;
  for (const p of poly) {
    x += p.x;
    y += p.y;
  }
  const n = poly.length || 1;
  return { x: x / n, y: y / n };
}

/** Drop hole rings: centroid inside a larger kept polygon. Keeps disjoint blobs. */
function dropInteriorHoles(polys) {
  if (polys.length <= 1) return polys;
  const sorted = polys
    .filter((p) => p.length >= 3)
    .slice()
    .sort((a, b) => polygonAreaSq(b) - polygonAreaSq(a));
  const kept = [];
  for (const poly of sorted) {
    const c = polygonCentroid(poly);
    const isHoleOfKept = kept.some((k) => pointInPolygon(c.x, c.y, k));
    if (!isHoleOfKept) kept.push(poly);
  }
  return kept;
}

/** Laplacian-style smooth on a closed ring (blend toward neighbor midpoint). */
function smoothClosedPolygon2D(poly, iterations, blend) {
  const n = poly.length;
  if (n < 3 || iterations < 1 || blend <= 0) return poly.map((p) => ({ x: p.x, y: p.y }));
  let cur = poly.map((p) => ({ x: p.x, y: p.y }));
  for (let k = 0; k < iterations; k++) {
    const next = [];
    for (let i = 0; i < n; i++) {
      const p = cur[i];
      const pr = cur[(i + n - 1) % n];
      const pl = cur[(i + 1) % n];
      const avx = (pr.x + pl.x) * 0.5;
      const avy = (pr.y + pl.y) * 0.5;
      next.push({
        x: p.x + blend * (avx - p.x),
        y: p.y + blend * (avy - p.y),
      });
    }
    cur = next;
  }
  return cur;
}

/**
 * Screen-space outline from projected splat centers (CSS px).
 * Rasterize → dilate → boundary trace; not convex hull.
 *
 * @param {{ x: number, y: number }[]} points
 * @param {object} [opt]
 * @param {number} [opt.padPx]
 * @param {number} [opt.maxCells] grid cells along long bbox edge
 * @param {number} [opt.dilatePasses] 8-neighbor dilate passes
 * @param {number} [opt.simplifyEps] RDP epsilon (px); 0 skips
 * @param {number} [opt.smoothIters] closed-polygon vertex smooth passes
 * @param {number} [opt.smoothBlend] 0–1 pull toward neighbor midpoints
 * @returns {{ x: number, y: number }[][]}
 */
export function concaveOutlines2D(points, opt = {}) {
  const padPx = opt.padPx ?? 20;
  const maxCells = opt.maxCells ?? 120;
  const dilatePasses = opt.dilatePasses ?? 3;
  const simplifyEps = opt.simplifyEps ?? 2.35;
  const smoothIters = opt.smoothIters ?? 2;
  const smoothBlend = opt.smoothBlend ?? 0.42;

  const n = points.length;
  if (n < 2) return [];
  if (n === 2) return [points.slice()];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const minGX = minX - padPx;
  const minGY = minY - padPx;
  const spanX = Math.max(maxX - minX + 2 * padPx, 1e-6);
  const spanY = Math.max(maxY - minY + 2 * padPx, 1e-6);

  let cw = Math.ceil((maxCells * spanX) / Math.max(spanX, spanY));
  let ch = Math.ceil((maxCells * spanY) / Math.max(spanX, spanY));
  cw = clamp(cw, 10, 220);
  ch = clamp(ch, 10, 220);

  let occ = new Uint8Array(cw * ch);
  for (const p of points) {
    const ix = clamp(Math.floor(((p.x - minGX) / spanX) * cw), 0, cw - 1);
    const iy = clamp(Math.floor(((p.y - minGY) / spanY) * ch), 0, ch - 1);
    occ[iy * cw + ix] = 1;
  }

  occ = dilate8(occ, cw, ch, dilatePasses);

  const loops = traceOrthogonalContours(occ, cw, ch);
  if (loops.length === 0) return [];

  const toScreen = (gx, gy) => ({
    x: minGX + (gx / cw) * spanX,
    y: minGY + (gy / ch) * spanY,
  });

  const minArea = Math.max(80, spanX * spanY * 0.0015);
  const out = [];
  for (const loop of loops) {
    let poly = loop.map((c) => toScreen(c.x, c.y));
    if (poly.length > 3 && simplifyEps > 0) {
      const epsUse = poly.length > 120 ? simplifyEps : simplifyEps * 0.58;
      poly = simplifyRdp(poly, epsUse);
    }
    if (poly.length >= 4 && smoothIters > 0 && smoothBlend > 0) {
      poly = smoothClosedPolygon2D(poly, smoothIters, smoothBlend);
    }
    if (poly.length < 2) continue;
    if (poly.length >= 3 && polygonAreaSq(poly) * 0.5 < minArea) continue;
    out.push(poly);
  }
  return dropInteriorHoles(out);
}
