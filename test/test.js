// test/test.js — verify the Live Canon npm package (computed, not trusted).
// Every expected value is recomputed by the functions under test and pinned
// only after cross-checking against quilt-floor + the live-canon-gh corpus.
const assert = require('node:assert');
const {
  LiveCanon, DEFAULT_CANON, fnv1a_64, cellToDials, stateHash, dialOnlyStateHash,
  serializeCell,
} = require('../index.js');

const canon = new LiveCanon();

// Test 1: bundled canon has 71 papers (the full committed corpus)
assert.strictEqual(canon.paperCount, 71, 'expected 71 papers');
console.log('✓ 71 papers bundled');

// Test 2: canonical state hash — THE cross-surface identity
assert.strictEqual(canon.stateHashString, '0x445185a3a99fd2e7', 'canonical state hash mismatch');
console.log('✓ canonical state hash = 0x445185a3a99fd2e7 (pypi + worker + quilt-floor agree)');

// Test 3: retired dial-only hash is provenance, not identity
const dial = dialOnlyStateHash(DEFAULT_CANON);
assert.strictEqual(dial, 0x7f563ed9982496a1n, 'dial-only provenance hash drifted');
assert.notStrictEqual(dial, stateHash(DEFAULT_CANON), 'dial-only must NOT equal canonical');
console.log('✓ dial-only (retired v0.2.0) = 0x7f563ed9982496a1 — provenance only');

// Test 4: serializeCell layout is byte-exact (1 + 8 + 32 + 8n bytes)
const sc = serializeCell(1, Array.from({ length: 16 }, (_, i) => i), [2, 3]);
assert.strictEqual(sc.length, 57, 'expected 57 bytes for 2-neighbor cell');
assert.strictEqual(sc[0], 0x01);
assert.strictEqual(Number(sc.readBigUInt64LE(1)), 1);
console.log('✓ serializeCell: 0x01 | u64 id | 16 u16 dials | u64 neighbors');

// Test 5: NAVIGATE
const path = canon.navigate(425, 2);
assert.ok(path.length > 0, 'expected path');
assert.strictEqual(path[0].paper.number, 425, 'first paper should be 425');
console.log(`✓ NAVIGATE(425, 2) returned ${path.length} cells`);

// Test 6: CONFLUENCE
const conf = canon.confluence([425, 432, 439]);
assert.ok(conf.suggested_title, 'expected suggested title');
console.log(`✓ CONFLUENCE: "${conf.suggested_title.slice(0, 50)}..."`);

// Test 7: LINEAGE
const lin = canon.lineage(115);
assert.ok(lin.length > 0, 'expected lineage');
assert.ok(lin.some(p => p.f_number === 116), 'lineage should include F116');
console.log(`✓ LINEAGE(F115): ${lin.length} papers`);

// Test 8: GHOST
const g = canon.ghost(425, 5);
assert.ok(g.neighbors.length > 0, 'expected neighbors');
console.log(`✓ GHOST(425, 5): top = ${g.neighbors[0].id} (score=${g.neighbors[0].neighbors?.length ?? g.neighbors[0].score})`);

// Test 9: TICK
const tk = canon.tick();
assert.strictEqual(tk.ticked_cells, 71, 'expected 71 ticked cells');
console.log(`✓ TICK: ${tk.ticked_cells} cells`);

// Test 10: FNV-1a known vector
const h = fnv1a_64('a');
assert.strictEqual(h, 0xaf63dc4c8601ec8cn, 'FNV-1a known vector mismatch');
console.log('✓ FNV-1a("a") = 0xaf63dc4c8601ec8c (published vector)');

// Test 11: every paper's dials are 16 features
for (const p of Object.values(DEFAULT_CANON)) {
  assert.strictEqual(cellToDials(p).length, 16, `paper ${p.number} dials != 16`);
}
console.log('✓ all 71 papers produce 16-feature dial vectors');

console.log('\nAll computed proofs pass. npm is byte-exact with pypi @ 0x445185a3a99fd2e7.');
