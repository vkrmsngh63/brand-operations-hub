/**
 * Variant B ("AI 2") — central versioned prompt registry (plan §4 `prompts.ts`).
 * Pure + deterministic. No AI call here — this only BUILDS prompt strings.
 *
 * Every AI step's prompt is a versioned code constant that, at render time,
 * injects the pinned ASSEMBLED rulebook (universal ∪ active niche ∪ approved
 * candidates) and carries the reserved LESSONS MARKER line — the hook the
 * future Lessons-Learned module writes operator-curated guidance into without
 * editing code (centrally, per task → applies to all projects on that task).
 *
 * Flat-payload non-negotiable: a prompt is built from the pinned rulebook + the
 * single item under analysis only. There is no `topics`/tree parameter anywhere
 * here, so a prompt can never grow with the accumulated canvas.
 */

import type { AssembledRulebook } from './rulebook-assembly.ts';
import type { CarrierCluster, DescriptorProfile } from './types.ts';
import type { DescriptorDef } from './rulebook.ts';
import { buildIntentEnumerationPrompt, INTENT_ENUMERATION_PROMPT_VERSION } from './intent-enumeration.ts';

// ============================================================
// Lessons marker (the fast-follow hook)
// ============================================================

/** The reserved line; everything after it is operator-curated and code never edits it. */
export const LESSONS_MARKER = '### LESSONS — operator-curated guidance (do not remove this line):';

/** Render the Lessons block: the marker line plus any approved lessons (none pre-UI). */
export function lessonsBlock(lessons: string[] = []): string {
  const body = lessons.length ? lessons.map((l) => `- ${l}`) : ['- (none yet)'];
  return [LESSONS_MARKER, ...body].join('\n');
}

// ============================================================
// Shared rulebook-context injection
// ============================================================

function renderDescriptorMenu(descriptors: DescriptorDef[]): string {
  return descriptors
    .map((d) => {
      const vocab = d.valueMenu === 'open' ? '<free text, normalized>' : (d.valueMenu as string[]).join(' | ');
      return `- ${d.key} (${d.group})${d.laddered ? ' [laddered]' : ''}: ${vocab}`;
    })
    .join('\n');
}

function renderZones(rb: AssembledRulebook): string {
  return [...rb.zones]
    .sort((a, b) => a.rank - b.rank)
    .map((z) => `${z.rank}. ${z.key} (${z.name}) — stages: ${z.stages.join(', ')}`)
    .join('\n');
}

/** The shared rulebook context block injected into prompts that need the menu/funnel. */
export function renderRulebookContext(rb: AssembledRulebook): string {
  const nicheLine = rb.nicheSlug
    ? `Niche: "${rb.nicheSlug}"${rb.conditionTerm ? ` (condition term: "${rb.conditionTerm}")` : ''}.`
    : 'No niche layer (universal rulebook only).';
  return [
    `RULEBOOK v${rb.clrVersion}. ${nicheLine}`,
    ``,
    `DESCRIPTOR MENU:`,
    renderDescriptorMenu(rb.descriptors),
    ``,
    `FUNNEL ZONES (vertical order):`,
    renderZones(rb),
  ].join('\n');
}

// ============================================================
// Registry
// ============================================================

export interface RenderedPrompt {
  task: string;
  /** the template version (bump when the constant changes). */
  version: number;
  /** the pinned assembled-rulebook version this prompt was built against. */
  clrVersion: number;
  prompt: string;
  /** chars — used by the flatness test (payload must not scale with the tree). */
  payloadSize: number;
}

/** Compose a final prompt: a task/version/CLR header, the body, then the Lessons block. */
export function composePrompt(
  task: string,
  version: number,
  rb: AssembledRulebook,
  body: string,
  lessons: string[] = [],
): RenderedPrompt {
  const prompt = [`[task=${task} v${version} clr=${rb.clrVersion}]`, ``, body, ``, lessonsBlock(lessons)].join('\n');
  return { task, version, clrVersion: rb.clrVersion, prompt, payloadSize: prompt.length };
}

export interface PromptTemplate<V> {
  task: string;
  version: number;
  render(rb: AssembledRulebook, vars: V, lessons?: string[]): RenderedPrompt;
}

/** Step 3 — intent enumeration (wraps the existing builder, adding the Lessons hook). */
export const intentEnumerationTemplate: PromptTemplate<{ carrier: CarrierCluster }> = {
  task: 'intent-enumeration',
  version: INTENT_ENUMERATION_PROMPT_VERSION,
  render(rb, { carrier }, lessons = []) {
    return composePrompt(this.task, this.version, rb, buildIntentEnumerationPrompt(carrier, rb), lessons);
  },
};

/** Step 4 (assist) — searcher-voice title for an ambiguous profile (deterministic
 *  labeling handles the common case; this is the AI fallback per spec §3 Step 4). */
export const topicTitleTemplate: PromptTemplate<{ profile: DescriptorProfile }> = {
  task: 'topic-title',
  version: 1,
  render(rb, { profile }, lessons = []) {
    const body = [
      renderRulebookContext(rb),
      ``,
      `PROFILE: ${JSON.stringify(profile)}`,
      ``,
      `TASK: Write the topic's title as the searcher would phrase the content they want (searcher voice). If first-person framing is unnatural (clinical / third-party / comparison), use a neutral title. Return JSON: {"title":"...","voice":"searcher|neutral"}.`,
    ].join('\n');
    return composePrompt(this.task, this.version, rb, body, lessons);
  },
};

/** The registry, keyed by task. */
export const PROMPTS = {
  'intent-enumeration': intentEnumerationTemplate,
  'topic-title': topicTitleTemplate,
} as const;
