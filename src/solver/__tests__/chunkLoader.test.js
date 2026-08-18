import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadChunk, prefetchChunks, getNode, clearMemoryCache } from '../chunkLoader';
import fixture from '../__fixtures__/c0-lite-as8h3c.json';

// No IndexedDB in this environment, which is the point: every path has to keep
// working when the cache is unavailable, because that is a real browser state
// (private mode, evicted storage, quota exhaustion).
const ok = (body) => ({ ok: true, status: 200, json: async () => body });

beforeEach(() => clearMemoryCache());

describe('loadChunk', () => {
  it('fetches and returns a chunk', async () => {
    const fetchImpl = vi.fn(async () => ok(fixture));
    const chunk = await loadChunk('c0/As8h3c/flop.json', { fetchImpl });
    expect(chunk.board).toEqual(['As', '8h', '3c']);
    expect(fetchImpl).toHaveBeenCalledWith('/solver/c0/As8h3c/flop.json');
  });

  it('serves a repeat request from memory instead of the network', async () => {
    const fetchImpl = vi.fn(async () => ok(fixture));
    await loadChunk('c0/As8h3c/flop.json', { fetchImpl });
    await loadChunk('c0/As8h3c/flop.json', { fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('dedupes concurrent requests for the same chunk', async () => {
    // A prefetch and a real load racing for the same path should not both hit
    // the network.
    const fetchImpl = vi.fn(async () => ok(fixture));
    const p = 'c0/As8h3c/flop.json';
    await Promise.all([
      loadChunk(p, { fetchImpl }), loadChunk(p, { fetchImpl }), loadChunk(p, { fetchImpl }),
    ]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('honours a custom base url', async () => {
    const fetchImpl = vi.fn(async () => ok(fixture));
    await loadChunk('a/b.json', { fetchImpl, baseUrl: '/Poker-Genie/solver' });
    expect(fetchImpl).toHaveBeenCalledWith('/Poker-Genie/solver/a/b.json');
  });

  it('reports a failed fetch rather than caching a broken chunk', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 404 }));
    await expect(loadChunk('missing.json', { fetchImpl })).rejects.toThrow(/404/);
    // And the failure must not poison the in-flight map for later callers.
    const good = vi.fn(async () => ok(fixture));
    await expect(loadChunk('missing.json', { fetchImpl: good })).resolves.toBeTruthy();
  });

  it('fails clearly when there is no fetch to use', async () => {
    // `undefined` would fall through to the default parameter and pick up the
    // global fetch; `null` is how a caller says "there genuinely isn't one",
    // which is the case this guard exists for.
    await expect(loadChunk('x.json', { fetchImpl: null })).rejects.toThrow(/No fetch available/);
  });
});

describe('prefetchChunks', () => {
  it('never rejects, even when every prefetch fails', async () => {
    const fetchImpl = vi.fn(async () => { throw new Error('offline'); });
    expect(() => prefetchChunks(['a.json', 'b.json'], { fetchImpl })).not.toThrow();
    await Promise.resolve();
  });
});

describe('getNode', () => {
  it('finds the root node by its empty path', () => {
    expect(getNode(fixture, '')).toBeTruthy();
  });

  it('finds a node deeper in the tree', () => {
    expect(getNode(fixture, 'BET 2.000000')).toBeTruthy();
  });

  it('returns null for a node that is not in the chunk', () => {
    expect(getNode(fixture, 'CHECK/BET 999')).toBeNull();
  });
});

describe('in-flight bookkeeping', () => {
  it('does not let a settled request evict a newer one for the same path', async () => {
    // Clearing the cache mid-flight used to make the older promise's cleanup
    // delete the newer entry, breaking dedupe for everything after it.
    let release;
    const slow = new Promise((r) => { release = r; });
    const first = vi.fn(async () => { await slow; return ok(fixture); });
    const path = 'c0/As8h3c/flop.json';

    const inflight = loadChunk(path, { fetchImpl: first });
    clearMemoryCache();

    const second = vi.fn(async () => ok(fixture));
    const a = loadChunk(path, { fetchImpl: second });
    release();
    await inflight;

    const b = loadChunk(path, { fetchImpl: second });
    await Promise.all([a, b]);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
