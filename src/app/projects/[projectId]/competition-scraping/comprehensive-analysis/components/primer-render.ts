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
import {
  buildPrimer,
  type Primer,
} from '@/lib/competition-scraping/comprehensive-analysis-primer';
import {
  buildPrimerDynamicColumnLabels,
  type MainExportUrl,
} from '@/lib/competition-scraping/comprehensive-analysis-exports';
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
