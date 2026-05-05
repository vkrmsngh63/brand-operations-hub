// Pure-logic split from reset-confirm-dialog.tsx so the match logic is
// testable via node --test --experimental-strip-types (which can't process
// .tsx files).
//
// The match logic is what gates the destructive reset action; tests pin
// the strict-match semantics so a future refactor doesn't accidentally
// loosen them.

// Returns true only if the typed value EXACTLY matches the project name
// (case-sensitive, no leading / trailing whitespace). The strict match is
// intentional — reset is destructive and ambiguity is a bug not a feature.
export function projectNameMatches(typed: string, projectName: string): boolean {
  return typed === projectName;
}
