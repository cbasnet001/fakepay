const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/prankSettings.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { parseSettings, defaultSettings } = context.exports;
const plain = (value) => JSON.parse(JSON.stringify(value));

test('settings survive storage serialization with haptics Off', () => {
  const settings = { error: 'Connection timed out', authenticationDelay: 6, haptics: false };
  assert.deepEqual(plain(parseSettings(JSON.stringify(settings))), settings);
});

test('missing, malformed, or invalid stored settings recover safe defaults', () => {
  for (const value of [null, '', '{', 'null', '[]', '42', '{}', '{"error":"obsolete","authenticationDelay":-1,"haptics":"false"}']) {
    assert.deepEqual(plain(parseSettings(value)), plain(defaultSettings));
  }
});

test('valid fields survive partial corruption or an older preferences schema', () => {
  assert.deepEqual(plain(parseSettings('{"error":"Card unavailable","authenticationDelay":5,"haptics":false}')), {
    error: 'Card unavailable', authenticationDelay: 2, haptics: false,
  });
});
