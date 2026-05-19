---
description: Pre-capture Rule 24 search before adding any new ROADMAP item. Greps for the concern keyword across the canonical W#2 + platform-wide doc + code locations. Reports prior treatment found OR confirms genuinely new.
argument-hint: "[concern-keyword or quoted phrase]"
allowed-tools: Bash(grep:*), Bash(find:*), Bash(echo:*), Bash(wc:*), Read
---

Pre-capture Rule 24 search for the concern: **$ARGUMENTS**

Per `docs/HANDOFF_PROTOCOL.md` Rule 24, before capturing any new ROADMAP item I must search for prior treatment to avoid duplicate/contradictory entries.

## Run these searches in parallel + report findings

Search the concern keyword across canonical locations. Use case-insensitive grep + check for obvious synonyms before reporting "genuinely new."

```bash
# 1. ROADMAP (direct grep + line count)
grep -niE '$ARGUMENTS' docs/ROADMAP.md | head -20
echo "---ROADMAP match count:" && grep -ciE '$ARGUMENTS' docs/ROADMAP.md
```

```bash
# 2. Competition Scraping docs (W#2 — most common workflow under active dev)
grep -niE '$ARGUMENTS' docs/COMPETITION_SCRAPING_DESIGN.md docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md docs/COMPETITION_SCRAPING_STACK_DECISIONS.md 2>/dev/null | head -20
```

```bash
# 3. Platform-wide architecture + requirements + data catalog
grep -niE '$ARGUMENTS' docs/PLATFORM_ARCHITECTURE.md docs/PLATFORM_REQUIREMENTS.md docs/DATA_CATALOG.md 2>/dev/null | head -20
```

```bash
# 4. Keyword Clustering docs (graduated W#1) — only relevant if concern overlaps with KW work
grep -niE '$ARGUMENTS' docs/KEYWORD_CLUSTERING_ARCHIVE.md docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md 2>/dev/null | head -20
```

```bash
# 5. CORRECTIONS_LOG (last 10 sessions of architectural insight)
grep -niE '$ARGUMENTS' docs/CORRECTIONS_LOG.md 2>/dev/null | head -10
```

```bash
# 6. Schema + shared types — code-truth check (Rule 3)
grep -niE '$ARGUMENTS' prisma/schema.prisma src/lib/shared-types/*.ts 2>/dev/null | head -20
```

```bash
# 7. Active extension source (for W#2-related concerns)
grep -rniE '$ARGUMENTS' extensions/competition-scraping/src/ --include='*.ts' --include='*.tsx' 2>/dev/null | head -20
```

## Report back to the user

After running the 7 searches, summarize per Rule 24:

**If prior treatment IS found:** Surface it explicitly — *"I found this was already discussed in [doc] [section] on [date]. The prior treatment was: [summary]. Compared to the current proposal: [what's different / what's the same]."* Director then decides whether to (a) update the existing item, (b) create a new related item with cross-reference, or (c) consolidate.

**If prior treatment is NOT found:** Surface the search performed — *"I checked [list of locations searched] and found no prior treatment. Proceeding with new capture."*

Also flag any RELATED CONSTRAINTS that surfaced even if not direct treatment — e.g., a STACK_DECISIONS note that limits the design space, or a PLATFORM_REQUIREMENTS tech-debt entry that the new item might satisfy/scope.

**Then wait for the director's confirmation before drafting the ROADMAP entry text.** The user runs Rule 24, sees the report, and confirms intent before any ROADMAP capture. This is the canonical pre-capture flow per HANDOFF_PROTOCOL.
