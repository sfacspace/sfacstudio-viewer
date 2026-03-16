/**
 * IndexedDB import cache: store/read PLY by project (download API → cache → load without local server).
 * DB: liam_viewer_import_cache_v1; stores: projects (meta), files (projectKey::index → Blob).
 */

const DB_NAME = 'liam_viewer_import_cache_v1';
const STORE_PROJECTS = 'projects';
const STORE_FILES = 'files';
const DB_VERSION = 1;

/**
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES);
      }
    };
  });
}

export const importCache = {
  /**
   * Store project files (Blobs from download API).
   * @param {string} projectKey - project id
   * @param {{ projectId?: string, projectName?: string }} meta
   * @param {Blob[]} blobs - PLY Blobs
   */
  async putProject(projectKey, meta = {}, blobs = []) {
    const db = await openDB();
    const totalBytes = blobs.reduce((sum, b) => sum + (b?.size ?? 0), 0);
    const projectMeta = {
      key: projectKey,
      projectId: meta.projectId ?? projectKey,
      projectName: meta.projectName ?? projectKey,
      fileCount: blobs.length,
      totalBytes,
      updatedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS, STORE_FILES], 'readwrite');
      const projectsStore = tx.objectStore(STORE_PROJECTS);
      const filesStore = tx.objectStore(STORE_FILES);

      projectsStore.put(projectMeta);

      blobs.forEach((blob, index) => {
        const fileKey = `${projectKey}::${index}`;
        filesStore.put(blob, fileKey);
      });

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  },

  /**
   * Get one file from cached project (returns File).
   * @param {string} projectKey
   * @param {number} index
   * @param {string} [fileName] - returned File.name
   * @returns {Promise<File|null>}
   */
  async getProjectFile(projectKey, index, fileName = null) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const key = `${projectKey}::${index}`;
      const req = store.get(key);
      req.onsuccess = () => {
        db.close();
        const blob = req.result;
        if (!blob) {
          resolve(null);
          return;
        }
        const name = fileName || `frame_${String(index + 1).padStart(6, '0')}.ply`;
        resolve(new File([blob], name, { type: 'application/octet-stream' }));
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  },

  /**
   * List cached projects (meta only).
   * @returns {Promise<Array<{ key: string, projectId: string, projectName: string, fileCount: number, totalBytes: number, updatedAt: number }>>}
   */
  async listProjects() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const req = tx.objectStore(STORE_PROJECTS).getAll();
      req.onsuccess = () => {
        db.close();
        resolve(req.result || []);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  },

  /**
   * Clear one project from cache.
   * @param {string} projectKey
   */
  async clearProject(projectKey) {
    const db = await openDB();
    const meta = await this.listProjects().then((list) => list.find((p) => p.key === projectKey));
    const fileCount = meta?.fileCount ?? 0;

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS, STORE_FILES], 'readwrite');
      const projectsStore = tx.objectStore(STORE_PROJECTS);
      const filesStore = tx.objectStore(STORE_FILES);
      projectsStore.delete(projectKey);
      for (let i = 0; i < fileCount; i++) {
        filesStore.delete(`${projectKey}::${i}`);
      }
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  },

  /** Clear all cache. */
  async clearAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS, STORE_FILES], 'readwrite');
      tx.objectStore(STORE_PROJECTS).clear();
      tx.objectStore(STORE_FILES).clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  },

  formatBytes,
};
