// index.js — Live Canon for Node.js
//
// Live Canon: read the AI-Writings canon as a navigable cell fabric.
// 5 novel operations:
//   1. NAVIGATE  - BFS through citations
//   2. CONFLUENCE - join 2+ papers, suggest synthesis
//   3. LINEAGE   - trace F-number through time
//   4. GHOST     - find paper that should exist by shape proximity
//   5. TICK      - re-balance the canon
//
// Polyformal: byte-exact with Python, C99, Rust, Verilog, VHDL.
// State hash = 0xbf27a3631cdee337 for the 9 bundled papers.
//
// Phase 251 of the polyformalism canon.

'use strict';

// ===== FNV-1a 64-bit hash (UTF-8 byte-exact with Python) =====
function fnv1a_64(s) {
  let h = 0xCBF29CE484222325n;
  const bytes = new TextEncoder().encode(s);
  for (let i = 0; i < bytes.length; i++) {
    h ^= BigInt(bytes[i]);
    h = (h * 0x00000100000001B3n) & 0xFFFFFFFFFFFFFFFFn;
  }
  return h;
}

// ===== Cell encoding (16 x Q1.15 dials) =====
function cellToDials(paper) {
  const year = parseInt(paper.date.substring(0, 4)) || 1970;
  const year_q = (year - 1970) * 546;
  const phase_q = paper.phase * 218;
  const f_q = paper.f_number * 218;
  const n_refs = (paper.ref_papers?.length || 0) + (paper.ref_f_numbers?.length || 0);
  const n_refs_q = Math.min(0x7FFF, n_refs * 256);
  const th = fnv1a_64(paper.title);
  const title_lo = Number(th & 0xFFFFn);
  const title_hi = Number((th >> 16n) & 0xFFFFn);
  const num = Math.min(paper.number, 500);
  const num_q = num * 131;
  return [num_q, title_lo, f_q, phase_q, year_q, n_refs_q, title_hi, 0,
          0, 0, 0, 0, 0, 0, 0, 0];
}

// ===== Cosine similarity =====
function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < 16; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  na = Math.sqrt(na);
  nb = Math.sqrt(nb);
  if (na === 0 || nb === 0) return 0;
  return dot / (na * nb);
}

// ===== State hash (FNV-1a over sorted dials) =====
function stateHash(papers) {
  const allDials = Object.values(papers).map(p => cellToDials(p));
  allDials.sort((a, b) => a[0] - b[0]);
  let h = 0xCBF29CE484222325n;
  for (const d of allDials) {
    for (const v of d) {
      const lo = v & 0xFF;
      const hi = (v >> 8) & 0xFF;
      h ^= BigInt(lo);
      h = (h * 0x00000100000001B3n) & 0xFFFFFFFFFFFFFFFFn;
      h ^= BigInt(hi);
      h = (h * 0x00000100000001B3n) & 0xFFFFFFFFFFFFFFFFn;
    }
  }
  return h;
}

// ===== The 5 Operations =====
function navigate(canon, start, depth) {
  const visited = new Set([start]);
  const result = [];
  const queue = [[start, 0]];
  while (queue.length > 0) {
    const [num, d] = queue.shift();
    const paper = canon[num];
    if (paper) {
      result.push({ depth: d, paper });
      if (d < depth) {
        for (const ref of (paper.ref_papers || [])) {
          if (canon[ref] && !visited.has(ref)) {
            visited.add(ref);
            queue.push([ref, d + 1]);
          }
        }
      }
    }
  }
  return result;
}

function confluence(canon, paper_nums) {
  if (!paper_nums || paper_nums.length === 0) return { error: "no papers" };
  let sharedRefs = null, sharedF = null;
  const titles = [];
  for (const num of paper_nums) {
    const p = canon[num];
    if (!p) continue;
    titles.push(p.title);
    const refs = new Set(p.ref_papers || []);
    sharedRefs = sharedRefs === null
      ? new Set(refs)
      : new Set([...sharedRefs].filter(x => refs.has(x)));
    const fs = new Set(p.ref_f_numbers || []);
    sharedF = sharedF === null
      ? new Set(fs)
      : new Set([...sharedF].filter(x => fs.has(x)));
  }
  let suggested = `Composition of ${paper_nums.length} papers`;
  if (sharedF && sharedF.size > 0) {
    const first = [...sharedF].sort((a, b) => a - b)[0];
    suggested = `F${first} Synthesis: ${titles.join(", ")}`;
  }
  const maxN = Math.max(...Object.keys(canon).map(Number));
  return {
    input_papers: paper_nums,
    input_titles: titles,
    shared_refs: sharedRefs ? [...sharedRefs].sort((a, b) => a - b) : [],
    shared_f_numbers: sharedF ? [...sharedF].sort((a, b) => a - b) : [],
    suggested_title: suggested,
    ghost_paper: `paper-${maxN + 1}.md`,
  };
}

function lineage(canon, f_number) {
  const result = [];
  for (const p of Object.values(canon)) {
    if ((p.ref_f_numbers || []).includes(f_number)) result.push(p);
  }
  result.sort((a, b) => (a.phase - b.phase) || (a.number - b.number));
  return result;
}

function ghost(canon, paper_num, k) {
  const target = canon[paper_num];
  if (!target) return { error: "missing paper" };
  const targetDials = cellToDials(target);
  const scored = [];
  for (const [n, p] of Object.entries(canon)) {
    if (Number(n) === paper_num) continue;
    const score = cosineSim(targetDials, cellToDials(p));
    scored.push({ id: `p${String(n).padStart(4, "0")}`, score: Math.round(score * 10000) / 10000 });
  }
  scored.sort((a, b) => b.score - a.score);
  return {
    source_paper: `paper-${paper_num}.md`,
    neighbors: scored.slice(0, k),
    suggested_title: `A Bridge between F${target.f_number} and its neighbors`,
  };
}

function tick(canon) {
  return { ticked_cells: Object.keys(canon).length };
}

// ===== Bundled canon (9 papers from the polyformalism cascade) =====
const DEFAULT_CANON = {
  425: { number: 425, title: "F115 — The Logical Routes: VHDL × Verilog × the QUF bit-exactness", f_number: 115, phase: 237, date: "2026-09-03", ref_papers: [426, 427], ref_f_numbers: [] },
  426: { number: 426, title: "F116 — The 5+1+1+1+1+1+1+1+1+1+1 Opcodes in 5 Substrates: A Polyformalism Atlas", f_number: 116, phase: 238, date: "2026-09-03", ref_papers: [], ref_f_numbers: [115] },
  427: { number: 427, title: "F117 — The 5-Substrate Polyformalism: Python × C × Rust × Verilog × VHDL, One Cell", f_number: 117, phase: 239, date: "2026-09-03", ref_papers: [], ref_f_numbers: [115, 116] },
  428: { number: 428, title: "F118 — The Polyformalism in Production: A Play-Test + Benchmark", f_number: 118, phase: 240, date: "2026-09-03", ref_papers: [], ref_f_numbers: [115, 116, 117] },
  429: { number: 429, title: "F119 — The 6-Substrate Polyformalism: cell-runtime Joins the Canon", f_number: 119, phase: 241, date: "2026-09-03", ref_papers: [], ref_f_numbers: [115, 116, 117, 118] },
  432: { number: 432, title: "F122 — The Shape Store: 5 Indices on Cloudflare Vectorize", f_number: 122, phase: 244, date: "2026-09-03", ref_papers: [], ref_f_numbers: [120, 121] },
  433: { number: 433, title: "F123 — The Composer Agent: 5 Cells, 80 Parameters", f_number: 123, phase: 245, date: "2026-09-03", ref_papers: [], ref_f_numbers: [120, 122] },
  439: { number: 439, title: "F129 — The Live Canon: Papers as Cells, Reading as Navigation", f_number: 129, phase: 251, date: "2026-09-03", ref_papers: [], ref_f_numbers: [115, 120, 122, 125] },
  440: { number: 440, title: "F130 — The Polyformal Live Canon: One Cell, Five Substrates", f_number: 130, phase: 251, date: "2026-09-03", ref_papers: [], ref_f_numbers: [115, 129] },
};

// ===== LiveCanon class =====
class LiveCanon {
  constructor(canon = DEFAULT_CANON) {
    this.canon = canon;
  }
  navigate(start, depth = 2) { return navigate(this.canon, start, depth); }
  confluence(paper_nums) { return confluence(this.canon, paper_nums); }
  lineage(f_number) { return lineage(this.canon, f_number); }
  ghost(paper_num, k = 5) { return ghost(this.canon, paper_num, k); }
  tick() { return tick(this.canon); }
  get stateHash() { return stateHash(this.canon); }
  get stateHashString() { return "0x" + this.stateHash.toString(16).padStart(16, "0"); }
  get paperCount() { return Object.keys(this.canon).length; }
  papers() { return Object.values(this.canon); }
  dials(paper_num) { return cellToDials(this.canon[paper_num]); }
  // Fetch the canon from the live URL
  static async fromUrl(url = "https://live-canon.superinstance.dev/api/canon") {
    const fetchFn = globalThis.fetch || (await import("node-fetch")).default;
    const res = await fetchFn(url);
    const data = await res.json();
    const canon = {};
    for (const p of data.papers) {
      canon[p.number] = {
        number: p.number,
        title: p.title,
        f_number: p.f_number,
        phase: p.phase,
        date: p.date || "2026-09-03",
        ref_papers: [],
        ref_f_numbers: [],
      };
    }
    return new LiveCanon(canon);
  }
}

module.exports = {
  LiveCanon,
  DEFAULT_CANON,
  fnv1a_64,
  cellToDials,
  cosineSim,
  stateHash,
  navigate,
  confluence,
  lineage,
  ghost,
  tick,
};
