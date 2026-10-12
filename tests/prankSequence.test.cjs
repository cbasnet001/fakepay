const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function harness(random = () => 0, settings) {
  let now = 0;
  let id = 0;
  const timers = new Map();
  const callbacks = [];
  const states = [];
  let haptics = 0;
  const settingsModule = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/prankSettings.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, settingsModule);
  const context = { exports: {}, require: () => settingsModule.exports, setTimeout(callback, delay) {
    callbacks.push(callback);
    timers.set(++id, { at: now + delay, callback });
    return id;
  }, clearTimeout(key) { timers.delete(key); } };
  const source = fs.readFileSync('src/utils/prankSequence.ts', 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  const sequence = context.exports.createPrankSequence((state) => states.push(state), () => haptics++, random, settings);
  return { sequence, states, callbacks, timers, messages: context.exports.errorMessages,
    get haptics() { return haptics; },
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const due = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        now = due[1].at;
        timers.delete(due[0]);
        due[1].callback();
      }
      now = end;
    },
  };
}

function openDemo(h) {
  h.sequence.start(); h.advance(2500); h.sequence.usePasscode();
}
function enterFour(h) { for (let i = 0; i < 4; i++) h.sequence.tapDigit(); }

function reach(h, stage) {
  h.sequence.start();
  if (stage === 'authenticating') return;
  h.advance(2500);
  if (stage === 'waiting') return;
  h.sequence.usePasscode();
  if (stage === 'demoPasscode') return;
  enterFour(h);
  if (stage === 'processing') return;
  h.advance(900);
}

test('2.5 seconds reveals fallback controls and waits indefinitely without auto advancing', () => {
  const h = harness();
  h.sequence.start(); h.sequence.start(); h.sequence.usePasscode();
  assert.equal(h.timers.size, 1);
  h.advance(2499);
  assert.equal(h.states.at(-1).status, 'authenticating');
  assert.equal(h.states.at(-1).waiting, false);
  assert.equal(h.states.at(-1).canUsePasscode, false);
  h.advance(1);
  assert.equal(h.states.at(-1).waiting, true);
  assert.equal(h.states.at(-1).canUsePasscode, true);
  assert.equal(h.timers.size, 0);
  h.advance(60000);
  assert.equal(h.states.at(-1).status, 'authenticating');
  assert.equal(h.haptics, 0);
});

test('retry restarts the 2.5-second scan and keeps passcode available on subsequent attempts', () => {
  const h = harness(); h.sequence.start(); h.advance(2500);
  h.sequence.retryScan(); h.sequence.retryScan();
  assert.equal(h.states.at(-1).attempt, 2);
  assert.equal(h.states.at(-1).waiting, false);
  assert.equal(h.states.at(-1).canUsePasscode, true);
  assert.equal(h.timers.size, 1);
  h.advance(2500);
  assert.equal(h.states.at(-1).waiting, true);
  assert.equal(h.states.at(-1).canUsePasscode, true);
  h.advance(60000);
  assert.equal(h.states.at(-1).status, 'authenticating');
});

test('four taps process once, then wait near reader before one error haptic', () => {
  const h = harness(); openDemo(h);
  for (let i = 1; i < 4; i++) {
    h.sequence.tapDigit();
    assert.equal(h.states.at(-1).filled, i);
    assert.equal(Object.keys(h.states.at(-1)).sort().join(','), 'filled,status');
  }
  h.sequence.tapDigit(); h.sequence.tapDigit(); h.sequence.start();
  assert.equal(h.states.at(-1).status, 'processing');
  assert.equal(h.timers.size, 1);
  h.advance(899); assert.equal(h.states.at(-1).status, 'processing');
  h.advance(1); assert.equal(h.states.at(-1).status, 'readyForReader');
  h.advance(2499); assert.equal(h.states.at(-1).status, 'readyForReader');
  h.advance(1); assert.equal(h.states.at(-1).message, h.messages[0]);
  assert.equal(h.haptics, 1);
  h.advance(10000); assert.equal(h.haptics, 1);
});

test('delete and cancel discard demo progress; reentry starts with empty dots', () => {
  const h = harness(); openDemo(h);
  h.sequence.deleteDigit(); assert.equal(h.states.at(-1).filled, 0);
  h.sequence.tapDigit(); h.sequence.tapDigit(); h.sequence.deleteDigit();
  assert.equal(h.states.at(-1).filled, 1);
  h.sequence.cancelPasscode();
  assert.equal(h.states.at(-1).status, 'authenticating');
  assert.equal(h.states.at(-1).waiting, true);
  h.sequence.usePasscode();
  assert.equal(h.states.at(-1).filled, 0);
  h.advance(60000); assert.equal(h.states.at(-1).status, 'demoPasscode');
});

test('entering demo during retry cancels the scan threshold and rejects stale callbacks', () => {
  const h = harness(); h.sequence.start(); h.advance(2500); h.sequence.retryScan();
  const stale = h.callbacks.at(-1);
  h.sequence.usePasscode(); stale();
  assert.equal(h.states.at(-1).status, 'demoPasscode');
  assert.equal(h.timers.size, 0);
});

test('close cancels every stage; stale callbacks cannot change a restarted scan', () => {
  for (const stage of ['authenticating', 'waiting', 'demoPasscode', 'processing', 'readyForReader']) {
    const h = harness(); reach(h, stage);
    const stale = h.callbacks.at(-1);
    h.sequence.close();
    assert.equal(h.states.at(-1).status, 'idle');
    assert.equal(h.timers.size, 0);
    h.sequence.start(); stale();
    assert.equal(h.states.at(-1).status, 'authenticating');
    assert.equal(h.states.at(-1).waiting, false);
    assert.equal(h.haptics, 0);
  }
});

test('disposal prevents callbacks, input, retries, and haptics at every stage', () => {
  for (const stage of ['authenticating', 'waiting', 'demoPasscode', 'processing', 'readyForReader']) {
    const h = harness(); reach(h, stage);
    const stale = h.callbacks.at(-1);
    const count = h.states.length;
    h.sequence.dispose(); stale(); h.sequence.start(); h.sequence.retryScan();
    h.sequence.usePasscode(); h.sequence.tapDigit(); h.sequence.cancelPasscode(); h.sequence.close();
    h.advance(60000);
    assert.equal(h.states.length, count);
    assert.equal(h.haptics, 0);
    assert.equal(h.timers.size, 0);
  }
});

test('random errors remain selectable and error retry starts a new session', () => {
  for (let index = 0; index < 4; index++) {
    const h = harness(() => (index + 0.5) / 4); openDemo(h); enterFour(h); h.advance(3400);
    assert.equal(h.states.at(-1).message, h.messages[index]);
    h.sequence.start(); assert.equal(h.states.at(-1).attempt, 1);
    assert.equal(h.states.at(-1).canUsePasscode, false);
  }
});

test('fixed errors and haptics Off survive the demo path; scan threshold is always 2.5 seconds', () => {
  const errors = ['Authentication unavailable', 'Connection timed out', 'Card unavailable', 'Service temporarily unavailable'];
  for (const authenticationDelay of [2, 4, 6]) {
    for (const error of errors) {
      const h = harness(() => { throw new Error('Fixed error must not use randomness'); }, { error, authenticationDelay, haptics: false });
      openDemo(h); assert.equal(h.states.at(-1).status, 'demoPasscode');
      enterFour(h); h.advance(3400);
      assert.equal(h.states.at(-1).message, error);
      assert.equal(h.haptics, 0);
    }
  }
});
