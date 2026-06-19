/**
 * Variant B ("AI 2") — provenance index (spec §1.8 / Step 7 index build).
 * Pure + deterministic. No AI, no DB, no React.
 *
 * Builds the traceability index over the finished, placed tree:
 *   - `byKeyword`: for each PRIMARY keyword, where its intent landed
 *     (intentInstanceId, topicId, zone/stage/verticalRank, and the topic's
 *     horizontal sibling neighbors up/down for navigation);
 *   - `byTopic`: each topic's primary + inherited (secondary) keywords;
 *   - `nicheDedupTotalVolume`: total reach with each keyword counted ONCE
 *     (de-duplicated across the intents/topics it fans out to);
 *   - `volumeFullByTopic`: per-topic reach = the full volume of every keyword
 *     feeding the topic, primary AND inherited (each keyword's full volume is
 *     credited to every topic it feeds — so this intentionally double-counts a
 *     keyword across the topics it reaches, unlike `nicheDedupTotalVolume`).
 *
 * Note on volumes: `Topic.volumeFull` (set in Step 5) is the topic's OWN primary
 * reach and drives sibling ordering; `volumeFullByTopic` here is the fuller
 * reach-incl-inherited per spec §1.7. They are kept separate on purpose.
 */

import type { Topic } from './conservative-merge.ts';

export interface ProvenanceEntry {
  intentInstanceId: string;
  topicId: string;
  zone: string | null;
  stage: string | null;
  verticalRank: number | null;
  /** previous sibling (higher in horizontal order), or null. */
  neighborUp: string | null;
  /** next sibling (lower in horizontal order), or null. */
  neighborDown: string | null;
}

export interface TopicProvenance {
  primaryKeywords: string[];
  inheritedKeywords: string[];
}

export interface ProvenanceIndex {
  byKeyword: Record<string, ProvenanceEntry[]>;
  byTopic: Record<string, TopicProvenance>;
  nicheDedupTotalVolume: number;
  volumeFullByTopic: Record<string, number>;
}

/** prev/next sibling id for each topic, derived from parentId + siblingOrder. */
function buildNeighbors(topics: Topic[]): Map<string, { up: string | null; down: string | null }> {
  const groups = new Map<string, Topic[]>();
  for (const t of topics) {
    const key = t.parentId ?? '';
    const g = groups.get(key);
    if (g) g.push(t);
    else groups.set(key, [t]);
  }
  const neighbors = new Map<string, { up: string | null; down: string | null }>();
  for (const siblings of groups.values()) {
    const ordered = [...siblings].sort((a, b) => (a.siblingOrder ?? 0) - (b.siblingOrder ?? 0));
    ordered.forEach((t, i) => {
      neighbors.set(t.id, {
        up: i > 0 ? ordered[i - 1].id : null,
        down: i < ordered.length - 1 ? ordered[i + 1].id : null,
      });
    });
  }
  return neighbors;
}

/** Per unique keyword, its full (carrier) volume — counted once. */
function keywordVolumes(topics: Topic[]): Map<string, number> {
  const vol = new Map<string, number>();
  for (const t of topics) {
    for (const m of t.memberInstances) {
      // instances of one keyword carry the same full volume; keep the max defensively.
      const prev = vol.get(m.sourceKeyword);
      if (prev === undefined || m.searchVolume > prev) vol.set(m.sourceKeyword, m.searchVolume);
    }
  }
  return vol;
}

/** Build the provenance index over the finished, placed tree. Pure. */
export function buildProvenance(topics: Topic[]): ProvenanceIndex {
  const neighbors = buildNeighbors(topics);
  const kwVol = keywordVolumes(topics);

  const byKeyword: Record<string, ProvenanceEntry[]> = {};
  const byTopic: Record<string, TopicProvenance> = {};
  const volumeFullByTopic: Record<string, number> = {};

  for (const t of topics) {
    const n = neighbors.get(t.id) ?? { up: null, down: null };

    // by_keyword: one entry per primary member instance.
    for (const m of t.memberInstances) {
      const entry: ProvenanceEntry = {
        intentInstanceId: m.id,
        topicId: t.id,
        zone: t.zone ?? null,
        stage: t.stage ?? null,
        verticalRank: t.funnelVerticalRank ?? null,
        neighborUp: n.up,
        neighborDown: n.down,
      };
      (byKeyword[m.sourceKeyword] ??= []).push(entry);
    }

    // by_topic: primary + inherited keywords.
    const primaryKeywords = [...t.primaryKeywords];
    const inheritedKeywords = [...(t.inheritedKeywords ?? [])];
    byTopic[t.id] = { primaryKeywords, inheritedKeywords };

    // reach = full volume of every keyword feeding the topic (primary ∪ inherited).
    const feeding = new Set<string>([...primaryKeywords, ...inheritedKeywords]);
    let reach = 0;
    for (const kw of feeding) reach += kwVol.get(kw) ?? 0;
    volumeFullByTopic[t.id] = reach;
  }

  // niche-deduped total: each unique keyword counted once.
  let nicheDedupTotalVolume = 0;
  for (const v of kwVol.values()) nicheDedupTotalVolume += v;

  return { byKeyword, byTopic, nicheDedupTotalVolume, volumeFullByTopic };
}
