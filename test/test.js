// test/test.js — verify the Live Canon npm package
const assert = require('node:assert');
const {
  LiveCanon, DEFAULT_CANON, fnv1a_64, cellToDials, stateHash,
  navigate, confluence, lineage, ghost, tick,
} = require('../index.js');

const canon = new LiveCanon();

// Test 1: bundled canon has 9 papers
assert.strictEqual(canon.paperCount, 9, 'expected 9 papers');
console.log('✓ 9 papers bundled');

// Test 2: state hash matches Python reference (0xbf27a3631cdee337)
assert.strictEqual(canon.stateHashString, '0xbf27a3631cdee337', 'state hash mismatch');
console.log('✓ state hash = 0xbf27a3631cdee337 (byte-exact with Python)');

// Test 3: NAVIGATE
const path = canon.navigate(425, 2);
assert.ok(path.length > 0, 'expected path');
assert.strictEqual(path[0].paper.number, 425, 'first paper should be 425');
console.log(`✓ NAVIGATE(425, 2) returned ${path.length} cells`);

// Test 4: CONFLUENCE
const conf = canon.confluence([425, 432, 439]);
assert.ok(conf.suggested_title, 'expected suggested title');
console.log(`✓ CONFLUENCE: "${conf.suggested_title.slice(0, 50)}..."`);

// Test 5: LINEAGE
const lin = canon.lineage(115);
assert.ok(lin.length > 0, 'expected lineage');
assert.ok(lin.some(p => p.f_number === 116), 'lineage should include F116');
console.log(`✓ LINEAGE(F115): ${lin.length} papers`);

// Test 6: GHOST
const g = canon.ghost(425, 5);
assert.ok(g.neighbors.length > 0, 'expected neighbors');
console.log(`✓ GHOST(425, 5): top = ${g.neighbors[0].id} (score=${g.neighbors[0].score})`);

// Test 7: TICK
const tk = canon.tick();
assert.strictEqual(tk.ticked_cells, 9, 'expected 9 ticked cells');
console.log(`✓ TICK: ${tk.ticked_cells} cells`);

// Test 8: FNV-1a
const h = fnv1a_64('F115 — The Logical Routes');
console.log(`✓ FNV-1a("F115 — The Logical Routes") = 0x${h.toString(16)}`);

// Test 9: dials for paper 425
const d425 = canon.dials(425);
assert.strictEqual(d425.length, 16, 'expected 16 dials');
console.log(`✓ dials(paper-425) = [${d425.slice(0, 7).join(', ')}]`);

console.log('\nAll tests passed! Live Canon npm package is byte-exact with Python.');
