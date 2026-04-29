/**
 * Unit tests for the `no-prop-reads-in-runloop` ESLint rule.
 *
 * Run with:
 *   node --test eslint-rules/no-prop-reads-in-runloop.test.mjs
 *
 * Uses `node:test` + `node:assert/strict` with ESLint's `Linter` class to
 * lint plain-JS snippets directly. No mocha, no jest, no @typescript-eslint
 * parser — the rule walks plain ESTree nodes (Identifier, FunctionDeclaration,
 * etc.) which espree produces, so plain JS samples exercise the same code
 * paths as the TS-parsed AutoAnalyze.tsx will hit at integration time.
 *
 * The integration test (running `npm run lint` against the real codebase
 * after the @runloop-reachable annotations land) confirms TS+JSX path.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rule = require('./no-prop-reads-in-runloop.js');

const linter = new Linter();
const config = {
  plugins: { local: { rules: { 'no-prop-reads-in-runloop': rule } } },
  rules: { 'local/no-prop-reads-in-runloop': 'error' },
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
};

function lint(code) {
  return linter.verify(code, config, { filename: 'test.js' });
}

/* ── Allow paths ───────────────────────────────────────────────────── */

test('allows: no annotation → direct prop read is fine', () => {
  const code = `
    function AutoAnalyze({ allKeywords, nodes }) {
      function helper() {
        for (const kw of allKeywords) console.log(kw);
        return nodes.length;
      }
    }
  `;
  assert.deepEqual(lint(code), []);
});

test('allows: annotated function reading via *Ref.current', () => {
  const code = `
    function AutoAnalyze({ allKeywords, nodes }) {
      const keywordsRef = { current: allKeywords };
      const nodesRef = { current: nodes };
      /** @runloop-reachable */
      async function doApplyV3() {
        const a = keywordsRef.current;
        const n = nodesRef.current;
        return [a, n];
      }
    }
  `;
  assert.deepEqual(lint(code), []);
});

test('allows: shadow-bind at function entry, then read the local name', () => {
  const code = `
    function AutoAnalyze({ allKeywords, pathways, nodes, sisterLinks }) {
      const keywordsRef = { current: allKeywords };
      const pathwaysRef = { current: pathways };
      /** @runloop-reachable */
      async function doApplyV3() {
        const allKeywords = keywordsRef.current;
        const pathways = pathwaysRef.current;
        for (const kw of allKeywords) console.log(kw);
        return pathways.map(p => p.id);
      }
    }
  `;
  assert.deepEqual(lint(code), []);
});

test('allows: member-property access (obj.allKeywords) inside guarded fn', () => {
  const code = `
    function AutoAnalyze({ allKeywords }) {
      /** @runloop-reachable */
      function f() {
        const config = { allKeywords: [], nodes: [] };
        return config.allKeywords.length + config.nodes.length;
      }
    }
  `;
  assert.deepEqual(lint(code), []);
});

test('allows: object-literal key with the prop name', () => {
  const code = `
    function AutoAnalyze({ allKeywords }) {
      /** @runloop-reachable */
      function f() {
        return { allKeywords: 1, nodes: 2 };
      }
    }
  `;
  assert.deepEqual(lint(code), []);
});

test('allows: nested non-annotated inner function inside annotated outer (per design §2.5)', () => {
  // doApplyV3 is annotated and shadow-binds allKeywords. An inner forEach
  // arrow that reads `allKeywords` is NOT checked — the design accepts
  // this trade-off because the outer shadow-binding already redirects
  // any inner read to the safe local.
  const code = `
    function AutoAnalyze({ allKeywords }) {
      const keywordsRef = { current: allKeywords };
      /** @runloop-reachable */
      function outer() {
        const allKeywords = keywordsRef.current;
        [].forEach(() => {
          const x = allKeywords;
          return x;
        });
      }
    }
  `;
  assert.deepEqual(lint(code), []);
});

/* ── Flag paths ────────────────────────────────────────────────────── */

test('flags: direct prop read inside annotated function (the 2026-04-28 bug pattern)', () => {
  const code = `
    function AutoAnalyze({ allKeywords }) {
      /** @runloop-reachable */
      async function doApplyV3() {
        for (const kw of allKeywords) console.log(kw);
      }
    }
  `;
  const messages = lint(code);
  assert.equal(messages.length, 1);
  assert.match(messages[0].message, /allKeywords.+read directly/);
  assert.match(messages[0].message, /keywordsRef\.current/);
});

test('flags: each of the four prop names', () => {
  const code = `
    function AutoAnalyze({ allKeywords, nodes, sisterLinks, pathways }) {
      /** @runloop-reachable */
      function f() {
        return [allKeywords, nodes, sisterLinks, pathways];
      }
    }
  `;
  const messages = lint(code);
  const flagged = messages.map(m => m.message.match(/Prop '(\w+)'/)[1]).sort();
  assert.deepEqual(flagged, ['allKeywords', 'nodes', 'pathways', 'sisterLinks']);
});

test('flags: prop read in annotated function, even when used in argument position', () => {
  const code = `
    function AutoAnalyze({ allKeywords }) {
      function compute(arr) { return arr.length; }
      /** @runloop-reachable */
      function f() {
        return compute(allKeywords);
      }
    }
  `;
  const messages = lint(code);
  assert.equal(messages.length, 1);
  assert.match(messages[0].message, /allKeywords/);
});

test('flags: ref-suggestion uses keywordsRef for allKeywords', () => {
  const code = `
    function AutoAnalyze({ allKeywords }) {
      /** @runloop-reachable */
      function f() { return allKeywords; }
    }
  `;
  const [m] = lint(code);
  assert.match(m.message, /'keywordsRef\.current'/);
});

test('flags: ref-suggestion uses nodesRef / pathwaysRef / sisterLinksRef for the others', () => {
  for (const [name, refName] of [
    ['nodes', 'nodesRef'],
    ['pathways', 'pathwaysRef'],
    ['sisterLinks', 'sisterLinksRef'],
  ]) {
    const code = `
      function AutoAnalyze({ ${name} }) {
        /** @runloop-reachable */
        function f() { return ${name}; }
      }
    `;
    const [m] = lint(code);
    assert.match(m.message, new RegExp(`'${refName}\\.current'`));
  }
});

/* ── Edge cases ────────────────────────────────────────────────────── */

test('does not flag: shadow-binding declaration LHS itself', () => {
  // `const allKeywords = ...` — the LHS `allKeywords` is a declaration,
  // not a read. The rule must not fire on declarations.
  const code = `
    function AutoAnalyze({ allKeywords }) {
      const keywordsRef = { current: allKeywords };
      /** @runloop-reachable */
      function f() {
        const allKeywords = keywordsRef.current;
        return allKeywords;
      }
    }
  `;
  assert.deepEqual(lint(code), []);
});

test('does not flag: function parameter with a guarded name', () => {
  // A parameter declaration with a name in the allow-list: e.g.,
  // a helper that explicitly takes `allKeywords` as a param. This is
  // an explicit pass-in, not a closure read — should not flag.
  const code = `
    function AutoAnalyze() {
      /** @runloop-reachable */
      function f(allKeywords) {
        return allKeywords;
      }
    }
  `;
  assert.deepEqual(lint(code), []);
});
