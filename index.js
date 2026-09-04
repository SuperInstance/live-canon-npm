// index.js — Live Canon: AI-Writings as a navigable cell fabric
// 14 papers, byte-exact with Python, C, Rust, Verilog, VHDL, JavaScript

const FNV_OFFSET = 0xCBF29CE484222325n;
const FNV_PRIME  = 0x00000100000001B3n;
const MASK       = 0xFFFFFFFFFFFFFFFFn;

function fnv1a_64(s) {
  let h = FNV_OFFSET;
  const enc = new TextEncoder();
  const bytes = enc.encode(s);
  for (const b of bytes) {
    h ^= BigInt(b);
    h = (h * FNV_PRIME) & MASK;
  }
  return h;
}

function cellToDials(p) {
  const year = parseInt((p.date || '1970-01-01').slice(0, 4)) || 1970;
  const yearQ = (year - 1970) * 546;
  const phaseQ = (p.phase || 0) * 218;
  const fQ = (p.f_number || 0) * 218;
  const nRefs = (p.ref_papers || []).length + (p.ref_f_numbers || []).length;
  const nRefsQ = Math.min(0x7FFF, nRefs * 256);
  const th = fnv1a_64(p.title || '');
  const titleLo = Number(th & 0xFFFFn);
  const titleHi = Number((th >> 16n) & 0xFFFFn);
  const num = Math.min(p.number || 0, 500);
  const numQ = num * 131;
  return [numQ, titleLo, fQ, phaseQ, yearQ, nRefsQ, titleHi, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

function stateHash(papers) {
  const dials = Object.values(papers).map(cellToDials);
  dials.sort((a, b) => a[0] - b[0]);
  let h = FNV_OFFSET;
  for (const d of dials) {
    for (const v of d) {
      const lo = v & 0xFF;
      const hi = (v >> 8) & 0xFF;
      h ^= BigInt(lo);
      h = (h * FNV_PRIME) & MASK;
      h ^= BigInt(hi);
      h = (h * FNV_PRIME) & MASK;
    }
  }
  return h;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < 16; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  na = Math.sqrt(na);
  nb = Math.sqrt(nb);
  return na && nb ? dot / (na * nb) : 0;
}

// Default 14-paper canon (F115-F135)
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
  441: { number: 441, title: "F131 — The 3-Package Polyformalism: One Cell, Three Registries", f_number: 131, phase: 252, date: "2026-09-03", ref_papers: [], ref_f_numbers: [115, 130] },
  442: { number: 442, title: "F132 — Operational Fictions as Concrete System-Prompt Noun-Phrases", f_number: 132, phase: 253, date: "2026-09-03", ref_papers: [], ref_f_numbers: [] },
  443: { number: 443, title: "F133 — Operational Fictions as Falsifiable Claims (avg divergence 0.861)", f_number: 133, phase: 254, date: "2026-09-03", ref_papers: [], ref_f_numbers: [132] },
  444: { number: 444, title: "F134 — The Quilt Cowboy: Orchestrator Over 12 Cheap Voices", f_number: 134, phase: 254, date: "2026-09-03", ref_papers: [], ref_f_numbers: [132, 133] },
  445: { number: 445, title: "F135 — The Wheelhouse Test: Scoring Fictions for 0300-in-a-Gale Tolerability", f_number: 135, phase: 254, date: "2026-09-03", ref_papers: [], ref_f_numbers: [132, 133] },
  446: { number: 446, title: "F136 — The Edge of the Doctrine — 6 Experiments", f_number: 136, phase: 254, date: "2026-09-03", ref_papers: [], ref_f_numbers: [132, 133, 134, 135] },
  447: { number: 447, title: "F137 — The Word-Level Metric is Broken (semantic divergence is real)", f_number: 137, phase: 254, date: "2026-09-03", ref_papers: [], ref_f_numbers: [133, 136] },
  448: { number: 448, title: "F138 — The Real Numbers — 12 Pairs with Semantic Divergence (0.231 vs 0.171)", f_number: 138, phase: 254, date: "2026-09-03", ref_papers: [], ref_f_numbers: [133, 137] },
  449: { number: 449, title: "F139 — Wearable Neural Devices + Quilt — The Synergy of Signaling-as-Play", f_number: 139, phase: 256, date: "2026-09-03", ref_papers: [], ref_f_numbers: [129, 130, 131] },
  450: { number: 450, title: "F140 — The Negative Space: Decomposition × Composition × Double-Entry Bookkeeping of the Self", f_number: 140, phase: 257, date: "2026-09-03", ref_papers: [], ref_f_numbers: [129, 133, 137, 138, 139] },
  451: { number: 451, title: "F141 — The Co-Captain: A Symbiotic Digital Twin with a Hand-On / Hands-Off Dial", f_number: 141, phase: 258, date: "2026-09-03", ref_papers: [], ref_f_numbers: [129, 140, 139] },
  452: { number: 452, title: "F142 — The Back-Deck Game: Multi-Dimensional Scoring for Industrial Operations", f_number: 142, phase: 258, date: "2026-09-03", ref_papers: [], ref_f_numbers: [140, 141, 143] },
  453: { number: 453, title: "F143 — The Mudra-Band Emulator: Webcam-Based Hand Pose for Industrial Training", f_number: 143, phase: 258, date: "2026-09-03", ref_papers: [], ref_f_numbers: [140, 141, 142] },
  454: { number: 454, title: "F144 — The Co-Captain in 5 Substrates: A Polyformalism Atlas", f_number: 144, phase: 259, date: "2026-09-03", ref_papers: [], ref_f_numbers: [141, 143] },
  455: { number: 455, title: "F145 — Bottle-Router → Cell-Router: Lifting A2A Bottles into Quilt Cells", f_number: 145, phase: 259, date: "2026-09-03", ref_papers: [], ref_f_numbers: [141, 144] },
  456: { number: 456, title: "F146 — Real MediaPipe Hands in the Back-Deck Game: From Simulator to Production", f_number: 146, phase: 259, date: "2026-09-03", ref_papers: [], ref_f_numbers: [142, 143] },
  457: { number: 457, title: "F150 — Tetris + F140: The Audit Game", f_number: 150, phase: 260, date: "2026-09-03", ref_papers: [], ref_f_numbers: [140, 141, 142, 151] },
  458: { number: 458, title: "F151 — The Wheelhouse Game: Weather Routing as an F140 Audit", f_number: 151, phase: 260, date: "2026-09-03", ref_papers: [], ref_f_numbers: [140, 141, 142, 150] },
  459: { number: 459, title: "F149 — Quilt for the Crew: A Non-Technical Handbook", f_number: 149, phase: 260, date: "2026-09-03", ref_papers: [], ref_f_numbers: [140, 141, 142, 143, 144, 145, 146, 150, 151] },
  // F148 expansion: 9 older papers
  408: { number: 408, title: "F98 — The 165-Test Polyformalism Conformance Suite", f_number: 98, phase: 222, date: "2026-09-03", ref_papers: [], ref_f_numbers: [97] },
  409: { number: 409, title: "F99 — The Quilt Atlas: 47 Repositories, 280K Lines of Code, 1500+ Tests", f_number: 99, phase: 223, date: "2026-09-03", ref_papers: [], ref_f_numbers: [100, 115] },
  410: { number: 410, title: "F100 — Anatomy of quilt-substrate: 11 Primitives, 4 Properties, 19 Openers, 405 Tests", f_number: 100, phase: 224, date: "2026-09-03", ref_papers: [], ref_f_numbers: [99, 104, 115] },
  414: { number: 414, title: "F104 — Polyformalism Benchmark: 1.71 µs/step (C) vs 228 µs/step (Python)", f_number: 104, phase: 228, date: "2026-09-03", ref_papers: [], ref_f_numbers: [100, 115, 116, 117] },
  417: { number: 417, title: "F107 — Forecasts as Durable Semantic Objects: Multi-Agent CRDT Merge", f_number: 107, phase: 231, date: "2026-09-03", ref_papers: [], ref_f_numbers: [95, 100] },
  419: { number: 419, title: "F109 — The Playtest Workflow: End-to-End Verification of AI Systems", f_number: 109, phase: 233, date: "2026-09-03", ref_papers: [], ref_f_numbers: [98, 100, 115] },
  420: { number: 420, title: "F110 — Polyformalism: When the Same Cell Shape Works in C, Python, Rust, and Beyond", f_number: 110, phase: 234, date: "2026-09-03", ref_papers: [], ref_f_numbers: [100, 104, 115, 116, 117, 118] },
  423: { number: 423, title: "F113 — QUF: Quilt Universal Format — The 6th Cutting-Edge Adoption", f_number: 113, phase: 235, date: "2026-09-03", ref_papers: [], ref_f_numbers: [100, 115, 116] },
  424: { number: 424, title: "F114 — Verilog Cells Meet Time-Series Forecasters: The q_cell × TimeCell Synergy", f_number: 114, phase: 236, date: "2026-09-03", ref_papers: [], ref_f_numbers: [100, 113, 115, 116, 117] },
  461: { number: 461, title: "F152 — The Co-Captain REST API: From Local to Fleet", f_number: 152, phase: 261, date: "2026-09-03", ref_papers: [], ref_f_numbers: [141, 144, 145] },
  462: { number: 462, title: "F153 — The 5-Substrate Echo Test: Polyformalism as a Deployment Substrate", f_number: 153, phase: 261, date: "2026-09-03", ref_papers: [], ref_f_numbers: [144] },
  463: { number: 463, title: "F154 — The Cowbell: A Persistent Crew-Member Notification System", f_number: 154, phase: 261, date: "2026-09-03", ref_papers: [], ref_f_numbers: [141, 142, 149, 151] },
  464: { number: 464, title: "F155 — The Canon Zoo: A System Prompt for Inspiration Through Play", f_number: 155, phase: 262, date: "2026-09-03", ref_papers: [], ref_f_numbers: [140, 152, 154, 110, 115] },
  465: { number: 465, title: "F156 — The Algebra of the 4-Move Pipeline: R ∘ D ∘ C ∘ L", f_number: 156, phase: 263, date: "2026-09-03", ref_papers: [], ref_f_numbers: [140, 141, 144, 152, 154] },
  466: { number: 466, title: "F157 — Canon Expansion II: Lifting F120-F139 from AI-Writings to Live Canon", f_number: 157, phase: 263, date: "2026-09-03", ref_papers: [], ref_f_numbers: [148, 110, 130, 150, 300] },
  467: { number: 467, title: "F158 — The Mechanic Doctrine: Agent Priming for Vibe-Coders", f_number: 158, phase: 264, date: "2026-09-03", ref_papers: [], ref_f_numbers: [110, 140, 152, 154, 156] },
};

class LiveCanon {
  constructor(canon = null) {
    this.canon = canon || { ...DEFAULT_CANON };
  }

  get stateHashBigInt() {
    return stateHash(this.canon);
  }

  get stateHashString() {
    return '0x' + this.stateHashBigInt.toString(16).padStart(16, '0');
  }

  get paperCount() {
    return Object.keys(this.canon).length;
  }

  papers() { return Object.values(this.canon); }

  navigate(start, depth = 2) {
    const visited = new Set([start]);
    const result = [];
    const queue = [[start, 0]];
    while (queue.length) {
      const [num, d] = queue.shift();
      const paper = this.canon[num];
      if (paper) {
        result.push({ depth: d, paper });
        if (d < depth) {
          for (const ref of paper.ref_papers || []) {
            if (this.canon[ref] && !visited.has(ref)) {
              visited.add(ref);
              queue.push([ref, d + 1]);
            }
          }
        }
      }
    }
    return result;
  }

  confluence(paperNums) {
    if (!paperNums || !paperNums.length) return { error: "no papers" };
    let sharedRefs = null, sharedF = null;
    const titles = [];
    for (const num of paperNums) {
      const p = this.canon[num];
      if (!p) continue;
      titles.push(p.title);
      const refs = new Set(p.ref_papers || []);
      sharedRefs = sharedRefs === null ? new Set(refs) : new Set([...sharedRefs].filter(x => refs.has(x)));
      const fs = new Set(p.ref_f_numbers || []);
      sharedF = sharedF === null ? new Set(fs) : new Set([...sharedF].filter(x => fs.has(x)));
    }
    let suggested = `Composition of ${paperNums.length} papers`;
    if (sharedF && sharedF.size) {
      const first = Math.min(...sharedF);
      suggested = `F${first} Synthesis: ${titles.join(', ')}`;
    }
    const maxN = Math.max(...Object.keys(this.canon).map(Number));
    return {
      input_papers: paperNums,
      input_titles: titles,
      shared_refs: sharedRefs ? [...sharedRefs].sort() : [],
      shared_f_numbers: sharedF ? [...sharedF].sort() : [],
      suggested_title: suggested,
      ghost_paper: `paper-${maxN + 1}.md`,
    };
  }

  lineage(fNumber) {
    return this.papers()
      .filter(p => (p.ref_f_numbers || []).includes(fNumber))
      .sort((a, b) => (a.phase || 0) - (b.phase || 0));
  }

  ghost(paperNum, k = 5) {
    const target = this.canon[paperNum];
    if (!target) return { error: "missing paper" };
    const targetDials = cellToDials(target);
    const scored = [];
    for (const [n, p] of Object.entries(this.canon)) {
      if (n == paperNum) continue;
      const score = cosine(targetDials, cellToDials(p));
      scored.push({ id: `p${String(n).padStart(4, '0')}`, score: Math.round(score * 10000) / 10000 });
    }
    scored.sort((a, b) => b.score - a.score);
    return {
      source_paper: `paper-${paperNum}.md`,
      neighbors: scored.slice(0, k),
      suggested_title: `A Bridge between F${target.f_number || 0} and its neighbors`,
    };
  }

  tick() {
    return { ticked_cells: this.paperCount };
  }
}

module.exports = { LiveCanon, fnv1a_64, stateHash, cellToDials, DEFAULT_CANON };
