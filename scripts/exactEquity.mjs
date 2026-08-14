// Exact equity for a class matchup: every disjoint combo pair, every C(48,5)
// board. Slow but definitive — used to test whether the Monte Carlo table is
// biased or merely noisy.
import { evaluate7 } from '../src/engine/handRank.js';
import { combosOf, classFromNotation } from '../src/engine/handClass.js';

function exactEquity(notationA, notationB) {
  const combosA = combosOf(classFromNotation(notationA));
  const combosB = combosOf(classFromNotation(notationB));

  let wins = 0, ties = 0, total = 0;
  const handA = new Int32Array(7);
  const handB = new Int32Array(7);
  const rest = new Int32Array(48);

  for (const [a1, a2] of combosA) {
    for (const [b1, b2] of combosB) {
      if (a1 === b1 || a1 === b2 || a2 === b1 || a2 === b2) continue;

      let n = 0;
      for (let c = 0; c < 52; c++) {
        if (c !== a1 && c !== a2 && c !== b1 && c !== b2) rest[n++] = c;
      }

      handA[0] = a1; handA[1] = a2;
      handB[0] = b1; handB[1] = b2;

      for (let i = 0; i < 44; i++) {
        handA[2] = handB[2] = rest[i];
        for (let j = i + 1; j < 45; j++) {
          handA[3] = handB[3] = rest[j];
          for (let k = j + 1; k < 46; k++) {
            handA[4] = handB[4] = rest[k];
            for (let l = k + 1; l < 47; l++) {
              handA[5] = handB[5] = rest[l];
              for (let m = l + 1; m < 48; m++) {
                handA[6] = handB[6] = rest[m];
                const sa = evaluate7(handA);
                const sb = evaluate7(handB);
                if (sa > sb) wins++;
                else if (sa === sb) ties++;
                total++;
              }
            }
          }
        }
      }
    }
  }

  return { equity: (wins + ties / 2) / total, total };
}

const matchups = process.argv.slice(2);
for (let i = 0; i < matchups.length; i += 2) {
  const a = matchups[i];
  const b = matchups[i + 1];
  const start = Date.now();
  const { equity, total } = exactEquity(a, b);
  const secs = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`${a} vs ${b}: ${(equity * 100).toFixed(4)}%  (${total.toLocaleString()} boards, ${secs}s)`);
}
