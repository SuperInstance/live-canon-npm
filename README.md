# @superinstance/live-canon

**Live Canon — read the AI-Writings canon as a navigable cell fabric.**

[![npm](https://img.shields.io/npm/v/@superinstance/live-canon)](https://www.npmjs.com/package/@superinstance/live-canon)
[![State hash](https://img.shields.io/badge/state_hash-0x445185a3a99fd2e7-brightgreen)](https://live-canon.superinstance.dev)
[![Polyformalism](https://img.shields.io/badge/polyformal-6_substrates-blueviolet)](https://github.com/SuperInstance/quilt-cowboy)

## What it does

Live Canon reads the AI-Writings canon (1700+ papers) as a navigable
cell fabric. Each paper = 1 cell. Each citation = 1 edge. The canon
exposes 5 novel operations:

1. **NAVIGATE** — BFS through citations
2. **CONFLUENCE** — join 2+ papers, suggest a synthesis
3. **LINEAGE** — trace a concept (F-number) through time
4. **GHOST** — find a paper that should exist by shape proximity
5. **TICK** — re-balance the canon

## Install

```bash
npm install @superinstance/live-canon
```

## Usage

```js
const { LiveCanon } = require('@superinstance/live-canon');

const canon = new LiveCanon();

// State hash (byte-exact with Python/C/Rust/Verilog/VHDL/JS-Worker)
console.log(canon.stateHashString);  // 0x445185a3a99fd2e7

// 1. NAVIGATE — BFS from a paper
const path = canon.navigate(425, 2);
console.log(`Found ${path.length} cells in the citation graph`);

// 2. CONFLUENCE — join 2+ papers
const synth = canon.confluence([425, 432, 439]);
console.log(`Suggested: ${synth.suggested_title}`);

// 3. LINEAGE — trace F115 through time
const lineage = canon.lineage(115);
console.log(`${lineage.length} papers cite F115`);

// 4. GHOST — find a paper that should exist
const ghost = canon.ghost(425, 5);
console.log(`Top neighbor: ${ghost.neighbors[0].id} (score=${ghost.neighbors[0].score})`);

// 5. TICK — re-balance the canon
console.log(canon.tick());
```

## Live data

The package bundles **71 papers** — the full committed corpus
(live-canon-gh `data.json` @ master, F98–F165). For the moving frontier,
fetch from the live URL:

```js
const canon = await LiveCanon.fromUrl('https://live-canon.superinstance.dev/api/canon');
```

## Polyformalism — honest drift dashboard (2026-09-20)

The canon moved: the state hash is now the **canonical serialization**
(`0x01 ‖ id(u64 LE) ‖ 16 dials(u16 LE) ‖ neighbors(u64 LE)`, one FNV-1a
pass over sorted cells), not the retired v0.2.0 dial-vectors-only hash.
The old number `0xbf27a3631cdee337` is **stranded** — it was the dial-only
algorithm over a retired 9-paper bundle and no corpus under the current
algorithm can reach it. See quilt-floor `classifyTargetProvenance`.

| Substrate | Status | State hash (71 papers) |
|---|---|---|
| Python (this package, ≥0.9.0) | **converged** | `0x445185a3a99fd2e7` |
| JavaScript (npm, ≥0.9.0) | **converged** | `0x445185a3a99fd2e7` |
| quilt-floor instrument | **converged** | `0x445185a3a99fd2e7` |
| live-canon-gh `data.json` | **converged** | `0x445185a3a99fd2e7` (canonical) |
| Cloudflare Worker | drift → converged on merge | `0x445185a3a99fd2e7` (branch `canon-71-full-corpus`) |
| C99 / Rust / Verilog / VHDL | **pending port** | — |

The 16-dial encoding is unchanged: `num_q = number*131`, `f_q = f*218`,
`phase_q = phase*218`, `year_q = (year-1970)*546`, `title_lo/hi =
FNV-1a(title)`. The serialization now also binds paper id and citation
edges — that is what moved the number.

## Live API

The Cloudflare Worker exposes the same operations as a REST API:

```
GET https://live-canon.superinstance.dev/api/canon
GET https://live-canon.superinstance.dev/api/canon/navigate?paper=425&depth=2
GET https://live-canon.superinstance.dev/api/canon/confluence?papers=425,432,439
GET https://live-canon.superinstance.dev/api/canon/lineage?f=115
GET https://live-canon.superinstance.dev/api/canon/ghost?paper=425&k=5
GET https://live-canon.superinstance.dev/api/canon/tick
GET https://live-canon.superinstance.dev/api/canon/hash
```

## Related

- **F129 (paper-439)**: The Live Canon: Papers as Cells, Reading as Navigation
- **F130 (paper-440)**: The Polyformal Live Canon: One Cell, Five Substrates
- **F131 (paper-441)**: The 6-Package Polyformalism (this package)
- **GitHub**: github.com/SuperInstance/quilt-live-canon
- **Live URL**: live-canon.superinstance.dev

## License

MIT

## Phase 251 of the polyformalism canon.

The cell is the unit. The hash is the address. The chart grows because
the cowboy rides.
