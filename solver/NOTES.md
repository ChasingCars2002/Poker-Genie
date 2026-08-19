# TexasSolver — verified contract (Phase 0)

All findings below were verified empirically against local builds, not inferred
from documentation. Build host: cmake 3.28, g++ 13.3, 4 cores, 16GB RAM.

## 1. EVs: which branch you build decides everything

The `console` branch and `master` are materially different solvers, and the
difference is exactly the thing this project needs.

| | `console` branch | `master` |
|---|---|---|
| `Trainable::dump_evs()` | **absent** | present |
| `Trainable::setEv()` | **absent** | present |
| EV accumulation in the CFR loop | **absent** (stripped) | present (`PCfrSolver.cpp:562-583`) |
| `reConvertJson` emits `evs` | no | **no — but the data exists** |
| Qt dependency in core headers | none | `QString` in `include/Card.h` |
| CMake console target | yes | no (Qt `.pro`; CMakeLists is console-only) |

`git diff origin/master -- src/solver/PCfrSolver.cpp` is **+72/−291**: the console
branch deleted 291 lines, the EV machinery among them.

**Conclusion: build from `master`, not `console`.** Master already computes and
stores per-hand EVs during training; they are simply never serialized, because
`dump_evs()` is reachable only from the Qt GUI's node inspector
(`PCfrSolver::get_evs`, line 1144). Exposing them is a one-line patch to
`reConvertJson`:

```cpp
(*retval)["strategy"] = trainable->dump_strategy(false);
(*retval)["evs"]      = trainable->dump_evs();     // <-- add
```

Building master's `console_solver` needs three mechanical fixes, all verified:
1. `apt-get install qtbase5-dev` (core needs only `QString`; the heavy Qt use is
   in GUI files that are not compiled into `console_solver`).
2. Copy the console branch's `CMakeLists.txt`, and delete its `test` target
   (master has no `test/test.cpp`).
3. Add `include_directories(.)` — master's sources include as `"include/Card.h"`,
   so the project root must be on the include path.

Porting EVs into the `console` branch instead was considered and rejected: it
means reinstating ~80 lines inside the CFR inner loop, which is precisely where
that branch diverged. Patching master is smaller and lower risk.

**AGPL v3:** keep the patch as `solver/patches/0001-dump-evs.patch` in the repo.
The extracted dataset is solver *output*, not a derivative of the program, so the
app's licence is unaffected.

## 2. The multithreaded solver has a data race — parallelise by process

`set_thread_num > 1` segfaults **non-deterministically**. The identical input file
succeeded on one run and segfaulted on a later one. `dmesg` shows multiple solver
threads faulting at the *same instruction address* concurrently — a race, not
resource exhaustion (15GB RAM and 30GB disk were free). Some runs instead abort
with code 134 (`bad_alloc`).

`set_thread_num 1` is stable across repeated runs.

**Verified fix:** four concurrent single-threaded solver processes on four
different flops all completed cleanly (exit 0, ~11.8MB output each). Get
parallelism across solves, not within one. Same core utilisation, no shared
mutable state, and a crash costs one flop instead of the batch. The runner should
be process-parallel and resumable per (config, flop).

## 3. Output JSON shape (verified on a real 22.4MB dump)

```json
{
  "node_type": "action_node",
  "player": 0,
  "actions": ["CHECK", "BET 25.000000", "BET 200.000000"],
  "strategy": {
    "actions":  ["CHECK", "BET 25.000000", "BET 200.000000"],
    "strategy": { "AcKs": [0.7359, 0.2317, 0.0322] }
  },
  "childrens": { "CHECK": { ... } }
}
```
- `strategy` is **doubly nested**: `node["strategy"]["strategy"]` holds the
  per-combo arrays.
- Combo keys are rank-uppercase / suit-lowercase, higher card first: `AcKs`, `2d2c`.
- Probability arrays are index-aligned to `actions`.
- Child keys are the **exact action string including floats** (`"BET 25.000000"`).
- Chance nodes carry `{deal_number, dealcards, node_type}`.
- Note the misspelled `childrens` key throughout.

## 4. Range syntax is far more restrictive than the app assumes

`src/tools/PrivateRangeConverter.cpp` accepts only:
- 2 chars — `AA`, `AK` (expands to suited **and** offsuit)
- 3 chars — `AKs`, `AKo`
- 4 chars — exact combos (`AhKs`), per HEAD commit "support-exact-suited-combos"
- optional `:weight` suffix (`AA:0.25`)

**No `+` notation and no dash ranges.** `A2s+` throws `format not recognize`.
Ranges must be pre-expanded to explicit comma lists.

This makes PR #4's `src/engine/rangeNotation.js` the *required adapter*, not
merely a compatible one: it already parses `22+`, `ATs+`, `76s-98s` into
individual weighted classes, which is exactly the expansion step needed. Exact
4-char combo support also makes **re-rooted turn/river solves** viable — you can
feed a turn solve the precise per-combo range that survived a flop line.

## 5. Measured performance and size

Sample input (pot 50, stack 200, SPR 4, 3 sizes + allin, `dump_rounds 2`),
4 threads, 20 iterations: **14.1s**, output **22.4MB**.

Exploitability went 71.6% at iteration 0 → 17.8% by iteration 11. The published
0.275% figure therefore needs **far** more than 20 iterations. Convergence, not
iteration count, is the cost driver; `set_accuracy` is the knob that matters.
Budget from a measured pilot, not from the 172s headline.

Size confirms extraction is mandatory: 22.4MB for one SPR-4 flop+turn dump, and
our SRP configs run deeper at SPR 17.7. Always dump one street
(`set_dump_rounds 1`) and get later streets from re-rooted solves.

## 6. Gotchas that cost time

- Pot/stack accept decimals (5.5 / 97.5) — the earlier segfaults were the thread
  race, not fractional values. Scaling to integers is unnecessary.
- Defining bet sizes for only one street does **not** cause the crash either.
- `/usr/bin/time` is absent on this host; use shell `time`.

## 7. VERIFIED: the EV patch works, and the EV convention is settled

Built master's `console_solver` with the one-line patch and ran it. The dump now
contains a real `evs` block alongside `strategy`:

```json
"evs": {
  "actions": ["CHECK", "BET 25.000000", "BET 200.000000"],
  "evs": { "2d2c": [91.074, 73.059, 76.128] }
}
```

Full build recipe (all four steps are required):
1. `apt-get install qtbase5-dev` — master's core needs `QString`; the console
   branch exists precisely to avoid this.
2. Copy the console branch's `CMakeLists.txt`; delete its `test` target
   (master has no `test/test.cpp`).
3. `find_package(Qt5 COMPONENTS Core Widgets REQUIRED)` and link both —
   `include/tools/qdebugstream.h` pulls in `QScrollBar`, so Core alone fails.
4. `include_directories(.)` — master includes as `"include/Card.h"`.
5. Rename `main_backup` → `main` in `src/console.cpp`. Master renamed it so the
   GUI's `main.cpp` could own `main`; linking fails with
   `undefined reference to 'main'` otherwise.

### EV convention — determined empirically, not assumed

At a node offering FOLD, **every** hand's fold EV is exactly **−25.000**, with the
root pot at 50 (contributed 25/25).

**EV is net chips won or lost relative to the start of the subgame**, where
folding forfeits your own contribution to the current pot. It is *not* measured
relative to folding, and *not* a total-stack figure.

Cross-checks on board `Qs Jh 2h`, which confirm the reading:
- `2d2c` is bottom set — root EV +91.07 for checking. Correctly large.
- `4c3c` is air — calling a 200 all-in is −187.42. Correctly catastrophic.

**Consequence for the extractor:** normalise to chips-relative-to-folding with
`evRelative = ev − evFold` before quantizing, so that `EV(fold) ≡ 0` and the
grading bands mean what they say. Assert the fold column is constant across all
hands at every node facing a bet — it is a free, exact integrity check on both
the solve and the extraction.

### Size at `dump_rounds 1`

323 KB for the flop street of an SPR-4 spot — matching the ~300 KB estimate and
confirming that one-street dumps plus re-rooted turn/river solves is the right
architecture.

## 8. Tree size is bounded by RAM, not by patience

The published 172s / 1600MB benchmark is for an **SPR 4** spot (pot 50, stack
200). A 6-max 100bb single-raised pot is **SPR 17.7** (pot 5.5, stack 97.5),
which is a far larger tree, and the difference is not a matter of waiting longer.

Measured on a 16GB machine:

| Tree | Outcome |
|---|---|
| 2 bet sizes + raise + allin on *all three* streets | **SIGKILL by the OOM killer at Iter 0** — exhausted ~15GB while building |
| flop 2 sizes + raise, turn/river 1 size, no raises past flop | ~3.5GB and climbing during tree build |

The failure mode is worth recognising: the process dies with **SIGKILL before
the first iteration**, having printed only `Iter: 0`. That is the OOM killer, not
the thread race from §2 (which segfaults, signal 11, and only with
`set_thread_num > 1`). Distinguishing them matters — the fixes are opposite.

**Design consequence:** the bet-size tree is the primary cost knob, ahead of
`set_accuracy` and `maxIteration`. Spend branching where it teaches something
(flop texture, where sizing choice is the actual lesson) and economise on later
streets. Re-rooted turn and river solves get their detail back cheaply, because
each starts from a narrow range at a much lower SPR.

Budget from a measured pilot on your own hardware before committing to an
overnight batch, and remember that N concurrent single-threaded processes need
N× the peak RSS — four concurrent 3.5GB solves will not fit in 16GB.

## 9. Measured solve economics (the numbers to plan a batch from)

Both measured on this 4-core / 16GB machine, single-threaded, `dump_rounds 1`,
BTN vs BB 100bb. Convergence estimated by power-law fit over the solver's own
checkpoints, warm-up dropped — see `pipeline/convergence.mjs`.

| tree | iters to 1% | s/iter | h/solve | peak RSS | concurrent | 25 flops |
|---|---|---|---|---|---|---|
| one bet size per street | 217 | 11.8 | 0.7 | 2.8GB | 4 | **4.4h** |
| two flop sizes + raise | 182 | 26.6 | 1.3 | 8.1GB | 1 | 33.6h |

The surprise is that the richer tree converges in **fewer** iterations (fitted
exponent 1.60 vs 1.44). More actions give CFR more ways to punish a bad
strategy, so regret shrinks faster per pass. What makes it expensive is cost per
iteration (2.3×) and, far more, peak memory: 8.1GB permits one solve at a time
where 2.8GB permits four. The 7.6× wall-clock gap is mostly the worker count,
not the mathematics.

Memory is therefore the lever that matters. On a 32GB machine the two-size tree
would run three-wide and drop to ~11h for 25 flops; on this box it does not.

**Recommended shape — hybrid.** Breadth and sizing are separable goals, and they
have very different prices:

- 25 single-size flops for board coverage — **4.4h**
- 8 two-size flops as a dedicated sizing drill — **10.8h**
- **~15h total**, and the two halves can run on separate nights.

A single-size tree still teaches bet-or-check, board texture, and defence
frequencies; it just cannot ask "which size". Buying that one lesson across all
25 boards costs 29 extra hours, and buying it on 8 well-chosen boards costs 11.
