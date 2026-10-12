const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function harness() {
  const states = []; let callback; let delay; let shakes = 0;
  const context = { exports: {}, setTimeout(fn, ms) { callback = fn; delay = ms; return 1; }, clearTimeout() {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/demoPasscode.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  const sequence = context.exports.createDemoPasscode((filled, locked) => states.push({ filled, locked }), () => shakes++);
  return { sequence, states, fire: () => callback(), get delay() { return delay; }, get shakes() { return shakes; } };
}
test('six taps lock input, delay shake by 200ms, and reset only after animation completion', () => {
  const h = harness();
  for (let i = 1; i <= 6; i++) { h.sequence.tap(); assert.equal(h.states.at(-1).filled, i); }
  assert.equal(h.delay, 200); assert.equal(h.shakes, 0);
  h.sequence.tap(); h.sequence.delete();
  assert.equal(h.states.at(-1).filled, 6); assert.equal(h.states.at(-1).locked, true);
  h.fire(); assert.equal(h.shakes, 1); assert.equal(h.states.at(-1).filled, 6);
  h.sequence.finishShake(); assert.equal(h.states.at(-1).filled, 0); assert.equal(h.states.at(-1).locked, false);
  h.sequence.tap(); assert.equal(h.states.at(-1).filled, 1);
});
test('delete works and reset/disposal reject stale shake callbacks', () => {
  for (const action of ['reset', 'dispose']) {
    const h = harness(); h.sequence.tap(); h.sequence.delete(); h.sequence.delete();
    assert.equal(h.states.at(-1).filled, 0);
    for (let i = 0; i < 6; i++) h.sequence.tap();
    h.sequence[action](); h.fire(); assert.equal(h.shakes, 0);
    if (action === 'dispose') { const count = h.states.length; h.sequence.tap(); h.sequence.finishShake(); assert.equal(h.states.length, count); }
    else assert.equal(h.states.at(-1).filled, 0);
  }
});
