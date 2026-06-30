/**
 * 대시보드/코멘트 마커를 오브젝트(대표 entity)의 자식처럼 따라가게 하기 위한 로컬 앵커
 */

/**
 * @param {object|null|undefined} obj - 타임라인 오브젝트
 * @returns {import('playcanvas').Entity|null}
 */
export function getPrimaryEntityForObject(obj) {
  if (!obj) return null;
  if (obj.isMultiFile && obj.files?.length > 0) {
    return obj.files[0].entity || obj.entity || null;
  }
  return obj.entity || null;
}

/**
 * 월드 좌표 한 점을 entity 로컬 공간 오프셋으로 변환
 * @param {import('playcanvas').Entity|null} entity
 * @param {number} wx
 * @param {number} wy
 * @param {number} wz
 * @returns {{ x: number, y: number, z: number } | null}
 */
export function computeMarkerOffsetLocal(entity, wx, wy, wz) {
  const pc = typeof window !== 'undefined' ? window.pc : null;
  if (!entity || !pc || typeof entity.getWorldTransform !== 'function') return null;
  try {
    const worldPt = new pc.Vec3(wx, wy, wz);
    const inv = new pc.Mat4();
    inv.copy(entity.getWorldTransform()).invert();
    const local = new pc.Vec3();
    inv.transformPoint(worldPt, local);
    return { x: local.x, y: local.y, z: local.z };
  } catch {
    return null;
  }
}

/**
 * 레거시 항목: 저장된 worldPosition과 현재 entity 자세로 로컬 오프셋을 한 번 채움
 * @param {{ worldPosition?: {x?:number,y?:number,z?:number}, markerOffsetLocal?: {x?:number,y?:number,z?:number} }} record
 * @param {object|null} timeline
 */
export function ensureMarkerOffsetLocal(record, timeline) {
  if (!record || !timeline?.objects) return;
  const o = record.markerOffsetLocal;
  if (o && Number.isFinite(o.x) && Number.isFinite(o.y) && Number.isFinite(o.z)) return;
  const obj = timeline.objects.find((ob) => ob.id === record.objectId);
  const ent = getPrimaryEntityForObject(obj);
  const wp = record.worldPosition;
  if (!ent || !wp) return;
  const lo = computeMarkerOffsetLocal(ent, wp.x ?? 0, wp.y ?? 0, wp.z ?? 0);
  if (lo) record.markerOffsetLocal = lo;
}

/**
 * 마커의 현재 월드 위치를 out에 기록 (로컬 오프셋 우선, 없으면 worldPosition)
 * @param {import('playcanvas').Entity|null} entity
 * @param {{ x?: number, y?: number, z?: number }|null|undefined} markerOffsetLocal
 * @param {{ x?: number, y?: number, z?: number }|null|undefined} fallbackWorld
 * @param {import('playcanvas').Vec3} out
 */
export function worldPositionForMarker(entity, markerOffsetLocal, fallbackWorld, out) {
  const pc = typeof window !== 'undefined' ? window.pc : null;
  const off = markerOffsetLocal;
  if (entity && off && Number.isFinite(off.x) && Number.isFinite(off.y) && Number.isFinite(off.z) && pc) {
    try {
      const localPt = new pc.Vec3(off.x, off.y, off.z);
      entity.getWorldTransform().transformPoint(localPt, out);
      return;
    } catch {
      /* fall through */
    }
  }
  const p = fallbackWorld || { x: 0, y: 0, z: 0 };
  out.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
}
