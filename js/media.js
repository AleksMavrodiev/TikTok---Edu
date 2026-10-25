// Stores videos people upload in IndexedDB (too big for localStorage).
const DB = 'curio-media';
const STORE = 'videos';
const urls = new Map();

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => { db.close(); resolve(req.result); };
    t.onerror = t.onabort = () => { db.close(); reject(t.error); };
  }));
}

export const putVideo = (key, blob) => tx('readwrite', (s) => s.put(blob, key));

export function deleteVideo(key) {
  if (urls.has(key)) { URL.revokeObjectURL(urls.get(key)); urls.delete(key); }
  return tx('readwrite', (s) => s.delete(key));
}

// Object URL for a stored video (cached so every card reuses one URL).
export async function videoUrl(key) {
  if (urls.has(key)) return urls.get(key);
  const blob = await tx('readonly', (s) => s.get(key));
  if (!blob) throw new Error('missing video');
  const url = URL.createObjectURL(blob);
  urls.set(key, url);
  return url;
}
