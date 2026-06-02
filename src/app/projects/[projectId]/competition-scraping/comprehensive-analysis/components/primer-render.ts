'use client';

// W#2 P-55 Phase 3 part 2 (2026-06-02) — the page-side renderers for the
// teaching "primer". The CONTENT (wording + the project's actual columns) lives
// in the pure, node:tested generator src/lib/.../comprehensive-analysis-primer.ts
// (buildPrimer + renderPrimerToTipTapDoc). This module adds the two things that
// need browser-only libraries / the page's main-table registry:
//   1. buildPrimerFromUrls(rows) — wraps buildPrimer with the main-table fixed
//      columns (TABLE_COLUMN_DEFS) + the project's dynamic category columns
//      derived from the live captures (mirrors the main spreadsheet export).
//   2. renderPrimerToDocxBlob(primer) — a real Word .docx via the `docx` lib,
//      for the Files-box download.
// Both feed off the SAME primer structure, so the .docx download and the
// "Insert primer" editor button stay identical.

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx';
import { authFetch } from '@/lib/authFetch';
import {
  buildPrimer,
  renderPrimerToTipTapDoc,
  type Primer,
} from '@/lib/competition-scraping/comprehensive-analysis-primer';
import {
  buildPrimerDynamicColumnLabels,
  type MainExportUrl,
} from '@/lib/competition-scraping/comprehensive-analysis-exports';
import type { ComprehensiveAnalysisPrimerDoc } from '@/lib/shared-types/competition-scraping';
import { TABLE_COLUMN_DEFS } from '../../components/url-table-columns';

// The main-table fixed columns (id + label), in the page's canonical order —
// the same source the main spreadsheet export reads, so the primer can't drift.
const PRIMER_MAIN_COLUMNS = TABLE_COLUMN_DEFS.map((c) => ({
  id: c.id,
  label: c.label,
}));

/** Build the primer reflecting THIS project's actual columns from a fresh
 *  Competitor-URLs (with captures) read — the same `rows` the Files-box
 *  download handlers fetch. */
export function buildPrimerFromUrls(rows: ReadonlyArray<MainExportUrl>): Primer {
  return buildPrimer({
    mainColumns: PRIMER_MAIN_COLUMNS,
    mainDynamicColumnLabels: buildPrimerDynamicColumnLabels(rows),
  });
}

// ─── Word (.docx) renderer ─────────────────────────────────────────────────

export const PRIMER_DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function plainParagraph(text: string, italics = false): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, italics })] });
}

/** Render the primer to a real Word .docx Blob: the title as the document
 *  title, each spreadsheet as a Heading-1 section with its "what it is" line
 *  and a bulleted, bold-named column glossary. */
export async function renderPrimerToDocxBlob(primer: Primer): Promise<Blob> {
  const children: Paragraph[] = [];
  children.push(new Paragraph({ text: primer.title, heading: HeadingLevel.TITLE }));
  for (const p of primer.intro) children.push(plainParagraph(p));

  children.push(
    new Paragraph({
      text: 'How to read these spreadsheets',
      heading: HeadingLevel.HEADING_1,
    })
  );
  for (const p of primer.howToRead) children.push(plainParagraph(p));

  for (const s of primer.sections) {
    children.push(new Paragraph({ text: s.heading, heading: HeadingLevel.HEADING_1 }));
    children.push(plainParagraph(s.whatItIs));
    for (const c of s.columns) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: `${c.name}: `, bold: true }),
            new TextRun(c.description),
          ],
        })
      );
    }
    if (s.note) children.push(plainParagraph(s.note, true));
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}

// ─── TipTap → Word (.docx) renderer ────────────────────────────────────────
// Renders a SAVED/edited primer (TipTap JSON) to a .docx. The auto-generated
// primer keeps its richer structure renderer above; this path covers whatever
// the director typed in the editor (headings, paragraphs, bullet/number lists,
// bold/italic/underline).

type TTNode = {
  type?: string;
  attrs?: { level?: number };
  content?: TTNode[];
  text?: string;
  marks?: Array<{ type?: string }>;
};

function inlineRuns(nodes: TTNode[] | undefined, prefix?: string): TextRun[] {
  const runs: TextRun[] = [];
  if (prefix) runs.push(new TextRun({ text: prefix }));
  for (const n of nodes ?? []) {
    if (n.type === 'hardBreak') {
      runs.push(new TextRun({ break: 1 }));
      continue;
    }
    if (n.type !== 'text' || typeof n.text !== 'string') continue;
    const marks = new Set((n.marks ?? []).map((m) => m.type));
    runs.push(
      new TextRun({
        text: n.text,
        bold: marks.has('bold'),
        italics: marks.has('italic'),
        underline: marks.has('underline') ? {} : undefined,
      })
    );
  }
  if (runs.length === 0) runs.push(new TextRun(''));
  return runs;
}

function headingLevelFor(level: number | undefined) {
  if (level === 2) return HeadingLevel.HEADING_2;
  if (level === 3) return HeadingLevel.HEADING_3;
  return HeadingLevel.HEADING_1;
}

function blockToParagraphs(node: TTNode): Paragraph[] {
  switch (node.type) {
    case 'heading':
      return [
        new Paragraph({
          heading: headingLevelFor(node.attrs?.level),
          children: inlineRuns(node.content),
        }),
      ];
    case 'paragraph':
    case 'codeBlock':
      return [new Paragraph({ children: inlineRuns(node.content) })];
    case 'bulletList':
    case 'orderedList': {
      const ordered = node.type === 'orderedList';
      const out: Paragraph[] = [];
      let i = 0;
      for (const li of node.content ?? []) {
        i += 1;
        for (const child of li.content ?? []) {
          if (child.type === 'paragraph') {
            // Ordered lists get a manual "n. " prefix (keeps us off docx's
            // numbering config, which can't break a download).
            out.push(
              new Paragraph({
                children: inlineRuns(child.content, ordered ? `${i}. ` : undefined),
                bullet: ordered ? undefined : { level: 0 },
              })
            );
          } else {
            out.push(...blockToParagraphs(child));
          }
        }
      }
      return out;
    }
    default: {
      if (node.content) return node.content.flatMap(blockToParagraphs);
      return [];
    }
  }
}

export async function tipTapToDocxBlob(
  doc: { content?: TTNode[] }
): Promise<Blob> {
  const children = (doc.content ?? []).flatMap(blockToParagraphs);
  if (children.length === 0) children.push(new Paragraph({ children: [new TextRun('')] }));
  return Packer.toBlob(new Document({ sections: [{ children }] }));
}

// ─── Resolve the CURRENT primer (saved override → else auto-generated) ──────
// One place that decides which primer to use, so the download, the editor
// insert, and the Edit modal all agree. Always fetched fresh at call time.

export type ResolvedPrimer =
  | { kind: 'saved'; doc: Record<string, unknown> }
  | { kind: 'generated'; primer: Primer };

async function fetchSavedPrimer(
  projectId: string
): Promise<Record<string, unknown> | null> {
  const res = await authFetch(
    `/api/projects/${projectId}/competition-scraping/comprehensive-analysis/primer`
  );
  if (!res.ok) return null; // treat any failure as "no override"
  const body = (await res.json()) as ComprehensiveAnalysisPrimerDoc;
  return body && typeof body.primerJson === 'object' ? body.primerJson : null;
}

async function fetchUrlsForPrimer(projectId: string): Promise<MainExportUrl[]> {
  const res = await authFetch(
    `/api/projects/${projectId}/competition-scraping/urls?withCaptures=1`
  );
  if (!res.ok) {
    throw new Error(`Couldn’t load the competitor data (HTTP ${res.status}).`);
  }
  const body = (await res.json()) as MainExportUrl[];
  return Array.isArray(body) ? body : [];
}

/** The current primer: the director's saved edit if one exists, else the
 *  auto-generated primer reflecting this project's current columns. */
export async function resolveCurrentPrimer(projectId: string): Promise<ResolvedPrimer> {
  const saved = await fetchSavedPrimer(projectId);
  if (saved) return { kind: 'saved', doc: saved };
  const rows = await fetchUrlsForPrimer(projectId);
  return { kind: 'generated', primer: buildPrimerFromUrls(rows) };
}

/** A resolved primer as a full TipTap doc (for the editor / Insert button). */
export function resolvedPrimerToTipTapDoc(
  resolved: ResolvedPrimer
): Record<string, unknown> {
  return resolved.kind === 'saved'
    ? resolved.doc
    : renderPrimerToTipTapDoc(resolved.primer);
}

/** A resolved primer as a .docx Blob (saved → TipTap renderer; generated →
 *  the richer structure renderer). */
export function resolvedPrimerToDocxBlob(resolved: ResolvedPrimer): Promise<Blob> {
  return resolved.kind === 'saved'
    ? tipTapToDocxBlob(resolved.doc as { content?: TTNode[] })
    : renderPrimerToDocxBlob(resolved.primer);
}
