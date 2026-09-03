# @superinstance/live-canon

**Live Canon — read the AI-Writings canon as a navigable cell fabric.**

[![npm](https://img.shields.io/npm/v/@superinstance/live-canon)](https://www.npmjs.com/package/@superinstance/live-canon)
[![State hash](https://img.shields.io/badge/state_hash-0xbf27a3631cdee337-brightgreen)](https://live-canon.superinstance.dev)
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
console.log(canon.stateHashString);  // 0xbf27a3631cdee337

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

The package bundles 9 papers from the polyformalism cascade (F115-F130).
For the full canon, fetch from the live URL:

```js
const canon = await LiveCanon.fromUrl('https://live-canon.superinstance.dev/api/canon');
```

## Polyformalism

The Live Canon is byte-exact across 6 substrates:

| Substrate | Status | State hash |
|---|---|---|
| Python (this) | reference | `0xbf27a3631cdee337` |
| JavaScript (npm) | this package | `0xbf27a3631cdee337` |
| JavaScript (Cloudflare Worker) | live | `0xbf27a3631cdee337` |
| C99 | `live_canon.c` | `0xbf27a3631cdee337` |
| Rust | `live-canon` crate | (same) |
| Verilog-2005 | `live_canon.v` | (same) |
| VHDL-2008 | `live_canon.vhdl` | (same) |

The 16-dial encoding is shared: `num_q = number*131`, `f_q = f*218`,
`phase_q = phase*218`, `year_q = (year-1970)*546`, `title_lo/hi = FNV-1a(title)`.

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
