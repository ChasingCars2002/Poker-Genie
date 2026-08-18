// Fetching solver chunks, with a cache that is allowed to fail.
//
// Chunks are large and immutable: a chunk's path contains the dataset id, so a
// re-solve produces new paths rather than changing old ones. That makes caching
// trivially safe — nothing ever needs invalidating, only evicting.
//
// IndexedDB is used as a cache and never as a store of record. Browsers evict
// it, private modes disable it, quotas bite. Every path through this module
// degrades to a plain fetch rather than failing, because losing a cached chunk
// should cost a network round-trip and nothing else. The progress store in
// state/progressStore.js is the opposite: small, precious, and synchronous.

const DB_NAME = 'poker-genie-solver';
const STORE = 'chunks';
const MEMORY_LIMIT = 24; // decoded chunks; a drill session touches far fewer

const memory = new Map(); // path -> chunk, insertion-ordered for LRU
const inFlight = new Map(); // path -> Promise, so a burst issues one request

function openDb() {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null);
    let request;
    try {
      request = indexedDB.open(DB_NAME, 1);
    } catch {
      return resolve(null); // private mode can throw on open
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function readCache(db, path) {
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(path);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeCache(db, path, value) {
  if (!db) return;
  await new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, path);
      tx.oncomplete = () => resolve();
      // A failed write is not an error worth surfacing: the chunk is still
      // usable, it just will not be there next time.
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

function remember(path, chunk) {
  memory.set(path, chunk);
  while (memory.size > MEMORY_LIMIT) {
    memory.delete(memory.keys().next().value); // oldest first
  }
  return chunk;
}

/**
 * Load one chunk. Memory → IndexedDB → network, deduped across callers.
 * `fetchImpl` and `baseUrl` are injectable so this is testable without a DOM.
 */
export function loadChunk(path, { baseUrl = '/solver', fetchImpl = globalThis.fetch } = {}) {
  const hit = memory.get(path);
  if (hit) {
    memory.delete(path); // reinsert so it counts as recently used
    return Promise.resolve(remember(path, hit));
  }

  const pending = inFlight.get(path);
  if (pending) return pending;

  const work = (async () => {
    const db = await openDb();
    const cached = await readCache(db, path);
    if (cached) return remember(path, cached);

    if (typeof fetchImpl !== 'function') throw new Error(`No fetch available to load ${path}`);
    const response = await fetchImpl(`${baseUrl}/${path}`);
    if (!response.ok) throw new Error(`Failed to load chunk ${path}: ${response.status}`);
    const chunk = await response.json();

    await writeCache(db, path, chunk);
    return remember(path, chunk);
  })().finally(() => inFlight.delete(path));

  inFlight.set(path, work);
  return work;
}

/**
 * Warm chunks likely to be needed next. Never rejects — a failed prefetch is
 * not a user-visible problem, it just means the real load pays full price.
 */
export function prefetchChunks(paths, options) {
  for (const path of paths) {
    loadChunk(path, options).catch(() => {});
  }
}

/** Find a node within a loaded chunk by its solver path. */
export function getNode(chunk, nodePath = '') {
  return chunk.nodes.find((n) => n.path === nodePath) ?? null;
}

/** Test seam: drop the in-memory cache. Does not touch IndexedDB. */
export function clearMemoryCache() {
  memory.clear();
  inFlight.clear();
}
