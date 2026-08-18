// Choosing which flops to solve.
//
// There are C(52,3) = 22,100 flops, but only 1,755 strategically distinct ones:
// poker is exactly invariant under relabelling suits, so As8h3c and Ah8s3d are
// the same problem wearing different clothes. Solving both would be pure waste.
//
// Each of those 1,755 classes stands for a different number of real flops (4,
// 12, or 24), and that multiplicity is how often it actually comes up at the
// table. Carrying the weight through matters: monotone boards are about 5% of
// reality, so picking 25 flops uniformly would silently hand them 4% of study
// time by accident rather than by choice.

const RANKS = '23456789TJQKA';
const SUITS = 'shdc';

const cardRank = (card) => RANKS.indexOf(card[0]);
const cardSuit = (card) => card[1];

/** All 22,100 three-card boards, each sorted rank-descending. */
export function allFlops() {
  const deck = [];
  for (const r of RANKS) for (const s of SUITS) deck.push(r + s);
  const out = [];
  for (let i = 0; i < deck.length; i++)
    for (let j = i + 1; j < deck.length; j++)
      for (let k = j + 1; k < deck.length; k++)
        out.push(sortFlop([deck[i], deck[j], deck[k]]));
  return out;
}

const sortFlop = (cards) =>
  [...cards].sort((a, b) => cardRank(b) - cardRank(a) || SUITS.indexOf(cardSuit(a)) - SUITS.indexOf(cardSuit(b)));

const SUIT_PERMUTATIONS = (() => {
  const out = [];
  const permute = (remaining, acc) => {
    if (remaining.length === 0) { out.push(acc); return; }
    for (let i = 0; i < remaining.length; i++) {
      permute(remaining.slice(0, i) + remaining.slice(i + 1), acc + remaining[i]);
    }
  };
  permute(SUITS, '');
  return out; // all 24
})();

/**
 * Canonical form under suit relabelling: the lexicographically smallest
 * representation over all 24 suit permutations.
 *
 * Relabelling suits by order of first appearance looks like it should work and
 * does not — it produced 1911 classes instead of 1755, with some orbits split
 * in two (a multiplicity of 6 appeared, which is impossible under a group of
 * order 24). The sort itself depends on suits, so first-appearance is not
 * invariant across members of an orbit. Minimising over the whole group is.
 */
export function canonicalFlop(cards) {
  let best = null;
  for (const perm of SUIT_PERMUTATIONS) {
    const mapped = sortFlop(cards.map((c) => c[0] + perm[SUITS.indexOf(cardSuit(c))])).join('');
    if (best === null || mapped < best) best = mapped;
  }
  return best;
}

/** Rainbow / two-tone / monotone, by number of distinct suits. */
export function suitedness(canonical) {
  const suits = new Set([canonical[1], canonical[3], canonical[5]]);
  return suits.size === 3 ? 'rainbow' : suits.size === 2 ? 'two-tone' : 'monotone';
}

/** Unpaired / paired / trips. */
export function pairedness(canonical) {
  const ranks = [canonical[0], canonical[2], canonical[4]];
  const distinct = new Set(ranks).size;
  return distinct === 3 ? 'unpaired' : distinct === 2 ? 'paired' : 'trips';
}

/** High-card bucket — the single strongest driver of range advantage. */
export function highCardBucket(canonical) {
  const top = canonical[0];
  if (top === 'A') return 'A';
  if (top === 'K') return 'K';
  if ('QJT'.includes(top)) return 'broadway';
  return 'low';
}

/**
 * The 1,755 distinct classes, each with the count of real flops it represents
 * and its share of all 22,100.
 */
export function flopClasses() {
  const counts = new Map();
  for (const flop of allFlops()) {
    const key = canonicalFlop(flop);
    const existing = counts.get(key);
    if (existing) existing.multiplicity += 1;
    else counts.set(key, { canonical: key, example: flop, multiplicity: 1 });
  }
  const total = 22100;
  return [...counts.values()].map((c) => ({
    ...c,
    weight: c.multiplicity / total,
    suitedness: suitedness(c.canonical),
    pairedness: pairedness(c.canonical),
    highCard: highCardBucket(c.canonical),
  }));
}

/** Aggregate weight per value of a feature — used to check a selection is representative. */
export function weightByFeature(classes, feature) {
  const out = {};
  for (const c of classes) out[c[feature]] = (out[c[feature]] ?? 0) + c.weight;
  return out;
}

/**
 * Pick `k` flops that stand in for all 1,755.
 *
 * Stratify by the three features that most change how a hand plays — high card,
 * pairedness, suitedness — then allocate the k slots across strata in
 * proportion to how much real-world weight each carries, taking the heaviest
 * class in each stratum as its representative. Deterministic: no rng, so the
 * same k always yields the same set and a dataset can be regenerated exactly.
 */
export function selectFlops(k = 25, classes = flopClasses()) {
  const strata = new Map();
  for (const c of classes) {
    const key = `${c.highCard}/${c.pairedness}/${c.suitedness}`;
    if (!strata.has(key)) strata.set(key, []);
    strata.get(key).push(c);
  }

  const entries = [...strata.entries()]
    .map(([key, members]) => ({
      key,
      members: members.sort((a, b) => b.multiplicity - a.multiplicity || a.canonical.localeCompare(b.canonical)),
      weight: members.reduce((sum, m) => sum + m.weight, 0),
    }))
    .sort((a, b) => b.weight - a.weight);

  // Largest-remainder allocation, so rounding does not quietly drop the
  // lightest strata or overshoot k.
  const exact = entries.map((e) => e.weight * k);
  const base = exact.map((x) => Math.floor(x));
  let remaining = k - base.reduce((a, b) => a + b, 0);
  const order = exact
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remaining <= 0) break;
    base[i] += 1;
    remaining -= 1;
  }

  // Within a stratum, spread the picks across rank structure instead of taking
  // the "heaviest" members. Multiplicity ties constantly (most classes are 12
  // or 24), so any tie-break on the canonical string sorts by rank text and
  // hands you 3-2-x boards for every stratum — 25 flops that all look alike and
  // teach nothing. Even spacing over rank-sorted members gives high, middle and
  // low examples of each texture.
  const rankKey = (c) => [c.canonical[0], c.canonical[2], c.canonical[4]]
    .map((r) => String(RANKS.indexOf(r)).padStart(2, '0'))
    .join('');

  const picked = [];
  entries.forEach((entry, i) => {
    const slots = Math.min(base[i], entry.members.length);
    if (slots === 0) return;
    const byRank = [...entry.members].sort((a, b) => rankKey(b).localeCompare(rankKey(a)));
    for (let n = 0; n < slots; n++) {
      // Sample at the midpoint of each of `slots` equal buckets, so a single
      // pick lands mid-range rather than at the extreme.
      const idx = Math.floor(((n + 0.5) / slots) * byRank.length);
      picked.push({ ...byRank[Math.min(idx, byRank.length - 1)], stratum: entry.key });
    }
  });
  return picked.slice(0, k);
}
