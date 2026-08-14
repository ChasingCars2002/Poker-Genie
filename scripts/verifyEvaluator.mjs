// Exhaustive validation: enumerate every 7-card hand and compare the category
// distribution against the published frequencies for 7-card poker.
import { evaluate7, categoryOf, CATEGORY_NAMES } from '../src/engine/handRank.js';

// Published counts over C(52,7) = 133,784,560 hands.
const EXPECTED = {
  'Straight Flush': 41584,
  'Four of a Kind': 224848,
  'Full House': 3473184,
  'Flush': 4047644,
  'Straight': 6180020,
  'Three of a Kind': 6461620,
  'Two Pair': 31433400,
  'Pair': 58627800,
  'High Card': 23294460,
};

const counts = new Array(9).fill(0);
const hand = new Int32Array(7);
let total = 0;

const start = Date.now();
for (let a = 0; a < 46; a++) {
  hand[0] = a;
  for (let b = a + 1; b < 47; b++) {
    hand[1] = b;
    for (let c = b + 1; c < 48; c++) {
      hand[2] = c;
      for (let d = c + 1; d < 49; d++) {
        hand[3] = d;
        for (let e = d + 1; e < 50; e++) {
          hand[4] = e;
          for (let f = e + 1; f < 51; f++) {
            hand[5] = f;
            for (let g = f + 1; g < 52; g++) {
              hand[6] = g;
              counts[categoryOf(evaluate7(hand))]++;
              total++;
            }
          }
        }
      }
    }
  }
}

const elapsed = (Date.now() - start) / 1000;
console.log(`Enumerated ${total.toLocaleString()} hands in ${elapsed.toFixed(1)}s\n`);

let allMatch = total === 133784560;
if (!allMatch) console.log(`TOTAL MISMATCH: expected 133,784,560, got ${total.toLocaleString()}`);

for (let i = 8; i >= 0; i--) {
  const name = CATEGORY_NAMES[i];
  const got = counts[i];
  const want = EXPECTED[name];
  const ok = got === want;
  if (!ok) allMatch = false;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${name.padEnd(16)} got ${got.toLocaleString().padStart(12)}  want ${want.toLocaleString().padStart(12)}`
  );
}

console.log(allMatch ? '\nALL CATEGORY COUNTS MATCH PUBLISHED FREQUENCIES' : '\nMISMATCH');
process.exit(allMatch ? 0 : 1);
