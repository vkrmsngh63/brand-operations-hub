'use strict';

/**
 * ESLint rule: no-prop-reads-in-runloop
 *
 * Codifies the AutoAnalyze.tsx:163 invariant as a build-time gate.
 *
 * Inside any function annotated `@runloop-reachable`, the four prop names
 * tracked by the runLoop's *Ref.current pattern — `nodes`, `allKeywords`,
 * `sisterLinks`, `pathways` — MUST NOT be read directly. They must be read
 * via `*Ref.current` (e.g., `nodesRef.current`) or shadow-bound at function
 * entry (`const allKeywords = keywordsRef.current`).
 *
 * Without this rule the line-163 convention is comment-only — the
 * 2026-04-28 closure-staleness regression at AutoAnalyze.tsx:830 was
 * exactly that pattern: `for (const kw of allKeywords)` reading the
 * closure-frozen prop instead of the always-fresh ref. This rule turns the
 * convention into a CI gate so the same class of regression cannot land.
 *
 * The rule fires only on functions explicitly annotated with the
 * `@runloop-reachable` JSDoc tag; other functions are unchecked. UI
 * rendering reads `nodes` directly all the time and that's fine — those
 * functions don't carry the annotation.
 *
 * Allowed patterns inside an @runloop-reachable function:
 *   - `nodesRef.current` (the canonical fresh-state read)
 *   - `const allKeywords = keywordsRef.current` followed by reads of
 *     `allKeywords` (the local shadow-binding resolves to the local, not
 *     the prop)
 *   - `obj.allKeywords` (member-property access; not a prop read)
 *   - `{ allKeywords: ... }` (object-literal key)
 *
 * Forbidden:
 *   - `for (const kw of allKeywords)` directly inside the annotated
 *     function body, with no shadow-binding above it — the prop is read
 *     via closure.
 *
 * See `docs/DEFENSE_IN_DEPTH_AUDIT_DESIGN.md` §2 for the locked design.
 */

const ALLOW_LIST = new Set(['nodes', 'allKeywords', 'sisterLinks', 'pathways']);

function refNameFor(name) {
  // The runLoop's ref-naming convention isn't perfectly mechanical:
  // `allKeywords` → `keywordsRef`, everything else → `<name>Ref`.
  if (name === 'allKeywords') return 'keywordsRef';
  return name + 'Ref';
}

function getAnnotation(node, sourceCode) {
  // Function declarations carry leading comments directly.
  // Arrow / function expressions assigned to a const/let carry the
  // comment on the surrounding VariableDeclaration. Walk up so we
  // recognise both shapes.
  let target = node;
  while (
    target.parent &&
    (target.parent.type === 'VariableDeclarator' ||
      target.parent.type === 'AssignmentExpression' ||
      target.parent.type === 'Property')
  ) {
    target = target.parent;
  }
  if (target.parent && target.parent.type === 'VariableDeclaration') {
    target = target.parent;
  }
  if (target.parent && target.parent.type === 'ExpressionStatement') {
    target = target.parent;
  }
  const comments = sourceCode.getCommentsBefore(target);
  return comments.some((c) => c.value.includes('@runloop-reachable'));
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Forbid direct reads of the four runLoop-tracked prop names " +
        "(nodes/allKeywords/sisterLinks/pathways) inside any function " +
        "annotated @runloop-reachable. Read via *Ref.current or " +
        "shadow-bind at function entry.",
    },
    schema: [],
    messages: {
      directRead:
        "Prop '{{name}}' read directly inside an @runloop-reachable " +
        "function. Read via '{{ref}}.current' or shadow-bind at entry " +
        "(`const {{name}} = {{ref}}.current`). " +
        "See AutoAnalyze.tsx:163 invariant.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    // Stack of { fn, guarded } per function we've entered. Only the top
    // matters for "is this Identifier inside a guarded function." Pushing
    // both annotated and non-annotated functions lets a non-annotated
    // inner helper inside doApplyV3 stay unchecked (per design §2.5).
    const fnStack = [];

    function enterFn(node) {
      fnStack.push({ fn: node, guarded: getAnnotation(node, sourceCode) });
    }
    function exitFn() {
      fnStack.pop();
    }
    function currentGuarded() {
      if (fnStack.length === 0) return null;
      const top = fnStack[fnStack.length - 1];
      return top.guarded ? top.fn : null;
    }

    return {
      FunctionDeclaration: enterFn,
      'FunctionDeclaration:exit': exitFn,
      FunctionExpression: enterFn,
      'FunctionExpression:exit': exitFn,
      ArrowFunctionExpression: enterFn,
      'ArrowFunctionExpression:exit': exitFn,

      Identifier(node) {
        const guardedFn = currentGuarded();
        if (!guardedFn) return;
        if (!ALLOW_LIST.has(node.name)) return;

        const parent = node.parent;
        if (!parent) return;

        // Skip member-expression property: `obj.allKeywords`
        if (
          parent.type === 'MemberExpression' &&
          parent.property === node &&
          !parent.computed
        ) {
          return;
        }
        // Skip object-literal/property keys: `{ allKeywords: 1 }`
        if (
          (parent.type === 'Property' ||
            parent.type === 'PropertyDefinition' ||
            parent.type === 'MethodDefinition') &&
          parent.key === node &&
          !parent.computed
        ) {
          return;
        }
        // Skip JSX attribute names: `<Foo allKeywords={x} />`
        if (parent.type === 'JSXAttribute' && parent.name === node) {
          return;
        }
        // Skip TS type-system children that just happen to share a name
        // (TSPropertySignature key, TSTypeReference typeName, etc.).
        if (
          typeof parent.type === 'string' &&
          parent.type.startsWith('TS') &&
          parent.type !== 'TSAsExpression' &&
          parent.type !== 'TSNonNullExpression'
        ) {
          return;
        }

        // Resolve via the scope manager. If the identifier resolves to a
        // declaration inside the guarded function (a shadow-binding), it's
        // allowed. If it resolves outside (the prop in the enclosing
        // component scope), it's the forbidden case.
        const scope = sourceCode.getScope(node);
        const ref = scope.references.find((r) => r.identifier === node);
        if (!ref) return; // declarations / writes only — skip
        if (ref.init) return; // initializer of a binding, not a read
        if (!ref.isRead || !ref.isRead()) return;
        if (!ref.resolved) return; // unresolved global — out of scope

        const def = ref.resolved.defs[0];
        if (!def || !def.node || !def.node.range) return;

        const guardedRange = guardedFn.range;
        const declRange = def.node.range;
        const declInsideGuarded =
          declRange[0] >= guardedRange[0] && declRange[1] <= guardedRange[1];

        if (declInsideGuarded) return; // shadow-binding — allowed

        context.report({
          node,
          messageId: 'directRead',
          data: { name: node.name, ref: refNameFor(node.name) },
        });
      },
    };
  },
};

module.exports = rule;
