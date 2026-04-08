
---

## 9. MANDATORY SAFETY PROTOCOL

### Rules for Claude (every chat must follow these)

**RULE 1 — BACKUP BEFORE REPLACE**
Before replacing ANY existing file, always run a backup first:
```bash
cp path/to/file path/to/file.bak
```

**RULE 2 — NEVER PROVIDE PARTIAL FILES AS REPLACEMENTS**
If replacing a file, the new file MUST contain ALL content — not just additions or changes. A partial file that overwrites a complete one destroys work. This is the #1 most dangerous mistake Claude can make on this project.

**RULE 3 — VERIFY AFTER UPLOAD**
After the user uploads a replacement file, always verify the line count is reasonable:
```bash
wc -l path/to/file
```
Compare to the expected size. If a 200-line file suddenly has 30 lines, something went wrong.

**RULE 4 — BUILD BEFORE PUSH**
Always run `npx next build 2>&1 | tail -10` and confirm it passes before telling the user to push.

**RULE 5 — GIT IS THE SAFETY NET**
If something goes wrong after a push, revert immediately:
```bash
git log --oneline -5        # find the last good commit
git revert HEAD             # undo the last commit
```

**RULE 6 — VISUAL SPOT-CHECK ON DEPLOY**
After every Vercel deploy, always ask the user to confirm the page looks correct before moving on to new work. Never assume a deploy succeeded just because the build passed.

### Recovery commands (for the user)
- Restore a backup: `cp path/to/file.bak path/to/file`
- Undo last git commit (before push): `git reset --soft HEAD~1`
- Undo last git commit (after push): `git revert HEAD && git push`
- See recent changes: `git diff HEAD~1`
- See what files changed: `git log --oneline --name-only -3`
