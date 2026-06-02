// W#2 P-55 Phase 3 (2026-06-02) — the teaching "primer" for the
// /comprehensive-analysis page. A pure, node:tested generator that describes
// each of the four Comprehensive Competitive Analysis Files spreadsheets + its
// columns, so the director can feed it (alongside the spreadsheets) to an AI of
// their choice. The primer reflects the project's ACTUAL columns (the four
// table column registries + the project's dynamic category columns).
//
// This module returns a STRUCTURED primer (title + intro paragraphs + a
// "how to read the rows" note + one section per spreadsheet, each a heading +
// a what-it-is line + a list of {column, description}). The page renders that
// structure two ways: a Word .docx for the Files box, and TipTap nodes for the
// "Insert primer" button. Keeping the structure pure here lets node:test pin
// the wording + the column coverage without docx/JSDOM.

// The category/type registries live in src/lib (node:test-reachable). The main
// table registry lives in src/app (its `@/` import can't resolve in the bare
// node:test runner), so the main columns are passed IN — mirroring how the
// export lib receives `fixedColumns` from the page.
import { CATEGORY_TABLE_COLUMNS } from './category-table-columns.ts';
import { TYPE_TABLE_COLUMNS } from './type-table-columns.ts';

// One main-table column passed in from the page's TABLE_COLUMN_DEFS (id+label).
export interface PrimerMainColumn {
  id: string;
  label: string;
}

export interface PrimerColumn {
  name: string;
  description: string;
}
export interface PrimerSection {
  heading: string;
  whatItIs: string;
  columns: PrimerColumn[];
  note?: string;
}
export interface Primer {
  title: string;
  intro: string[];
  howToRead: string[];
  sections: PrimerSection[];
}

export interface BuildPrimerOptions {
  // The main-table fixed columns (the page's TABLE_COLUMN_DEFS, id+label).
  mainColumns: ReadonlyArray<PrimerMainColumn>;
  // The project's dynamic category column labels on the main table (the
  // captured-content value columns + their paired analysis columns), in the
  // order they appear. Reflects the ACTUAL custom category columns the project
  // has. When empty, the main-table section notes there are none yet.
  mainDynamicColumnLabels?: ReadonlyArray<string>;
}

// ─── per-column descriptions (one concise line each) ──────────────────────
// Keyed by the registry column id. Shared ids (platform, competitionCategory,
// …) describe the competitor's identity consistently across every table.
const SHARED_IDENTITY: Record<string, string> = {
  platform: 'Which marketplace or website this competitor was found on.',
  competitionCategory: "The category you assigned this competitor to (your own grouping).",
  type: 'The product type you assigned this competitor to (your own grouping).',
  productName: "The competitor product's name or title.",
  resultsPageRank: 'Where this competitor appeared in the search results (1 = top).',
  competitionScore: 'A score you use to rank how strong a competitor this is.',
  url: "A link to the competitor's listing.",
};

const MAIN_DESCRIPTIONS: Record<string, string> = {
  ...SHARED_IDENTITY,
  isSponsoredAd: 'Whether the listing was a sponsored / paid ad (Yes or No).',
  brandName: "The competitor's brand name.",
  description1: "The competitor listing's primary description text.",
  description2: 'Additional description text from the competitor listing.',
  price: "The competitor's listed price.",
  productStarRating: "The product's average customer star rating.",
  numProductReviews: 'How many customer reviews the product has.',
  sellerStarRating: "The seller's average rating.",
  numSellerReviews: 'How many ratings the seller has.',
  scrapingStatus: 'The status of data capture for this competitor (internal).',
  overallCompetitorAnalysis: 'Your own written overall assessment of this competitor.',
  addedAt: 'The date this competitor was added to your list.',
};

// The flat Competition Reviews Analysis spreadsheet (one row per captured
// review). Columns mirror comprehensive-analysis-exports REVIEWS_ANALYSIS_HEADER.
const REVIEWS_COLUMNS: PrimerColumn[] = [
  { name: 'Platform', description: SHARED_IDENTITY.platform },
  { name: 'Category', description: SHARED_IDENTITY.competitionCategory },
  { name: 'Type', description: SHARED_IDENTITY.type },
  { name: 'Product Name', description: SHARED_IDENTITY.productName },
  { name: 'Results Rank', description: SHARED_IDENTITY.resultsPageRank },
  { name: 'Comp. Score', description: SHARED_IDENTITY.competitionScore },
  { name: 'URL', description: SHARED_IDENTITY.url },
  {
    name: 'Reviews Summary',
    description:
      "How many of this competitor's captured reviews have an AI summary (e.g. “3 of 5 summarized”).",
  },
  { name: 'Stars', description: 'The star rating the customer gave in this review.' },
  { name: 'Review', description: "The full text of the customer's review." },
  { name: 'Reviewer', description: "The reviewer's name, if captured." },
  { name: 'Date', description: 'The date of the review, if captured.' },
  { name: 'Review Summary', description: 'A short AI summary of this single review.' },
  {
    name: 'Comprehensive (bulleted)',
    description:
      "An AI summary of all this competitor's reviews, organized as themed bullet-point issues.",
  },
  {
    name: 'Comprehensive (non-bulleted)',
    description: "An AI summary of all this competitor's reviews, written as plain paragraphs.",
  },
];

// The grouped (By Category / By Type) spreadsheets share a column shape; only
// the grouping word differs. `g` is 'Category' or 'Type' (capitalized).
function groupedColumnDescription(id: string, g: 'Category' | 'Type'): string {
  const gl = g.toLowerCase();
  switch (id) {
    case 'competitionCategory':
      return g === 'Category'
        ? 'The category these competitors are grouped under.'
        : SHARED_IDENTITY.competitionCategory;
    case 'type':
      return g === 'Type'
        ? 'The type these competitors are grouped under.'
        : SHARED_IDENTITY.type;
    case 'platform':
      return SHARED_IDENTITY.platform;
    case 'productName':
      return SHARED_IDENTITY.productName;
    case 'resultsPageRank':
      return SHARED_IDENTITY.resultsPageRank;
    case 'competitionScore':
      return SHARED_IDENTITY.competitionScore;
    case 'url':
      return SHARED_IDENTITY.url;
    case 'stars':
      return 'The star rating for this review.';
    case 'reviewsSummary':
      return 'A short AI summary of this single review.';
    case 'compBulleted':
      return "An AI summary of this one competitor's reviews, organized as themed bullets.";
    case 'compNonBulleted':
      return "An AI summary of this one competitor's reviews, written as plain paragraphs.";
    case 'catBulleted':
    case 'typeBulleted':
      return `An AI summary across ALL competitors in this ${gl}, organized as themed bullets.`;
    case 'catSourceReviews':
    case 'typeSourceReviews':
      return `For each ${gl}-wide issue, the individual reviews it came from (product, stars, review text), each on its own row.`;
    case 'catNonBulleted':
    case 'typeNonBulleted':
      return `The ${gl}-wide summary written as plain paragraphs.`;
    default:
      return '';
  }
}

function mainTableSection(
  mainColumns: ReadonlyArray<PrimerMainColumn>,
  dynamicLabels: ReadonlyArray<string>
): PrimerSection {
  const columns: PrimerColumn[] = mainColumns.map((c) => ({
    name: c.label,
    description: MAIN_DESCRIPTIONS[c.id] ?? '',
  }));
  for (const label of dynamicLabels) {
    columns.push({
      name: label,
      description:
        'A captured-content column (or its paired analysis) for one of your custom content / image / video categories.',
    });
  }
  const note =
    dynamicLabels.length > 0
      ? 'The captured content / image / video category columns above are specific to this project. Where a competitor has several captured items in one category, each item is split onto its own row.'
      : 'If you add captured content / image / video categories, each becomes its own column-pair (the captured content + your analysis), split one item per row.';
  return {
    heading: 'Competition Content Overview',
    whatItIs:
      'Your full competitor list — every competitor you are tracking, one per row (rows repeat where a competitor has several captured items), with all of their captured details and your analysis.',
    columns,
    note,
  };
}

function groupedSection(g: 'Category' | 'Type'): PrimerSection {
  const registry = g === 'Category' ? CATEGORY_TABLE_COLUMNS : TYPE_TABLE_COLUMNS;
  const columns: PrimerColumn[] = registry.map((c) => ({
    name: c.label,
    description: groupedColumnDescription(c.id, g),
  }));
  const gl = g.toLowerCase();
  return {
    heading: `Reviews Analysis By Competitor ${g}`,
    whatItIs: `Customer reviews grouped by ${gl}: for each ${gl}, the AI's ${gl}-wide review summary and the reviews behind each issue, followed by each competitor in that ${gl} and its individual reviews.`,
    columns,
    note: `Each individual review is its own row; each review behind a ${gl}-wide issue is its own row; the ${gl}-level and competitor-level values repeat down their rows. A summary-only companion, "Reviews Analysis By Competitor ${g} without individual reviews", drops the per-review columns (Stars, Reviews Summary, Source Reviews) so each ${gl} shows one banner row of its two Comprehensive summaries above one row per competitor.`,
  };
}

/**
 * Build the structured primer reflecting the project's actual columns. Pure +
 * node:tested. The page renders the result to a .docx and to editor content.
 */
export function buildPrimer(opts: BuildPrimerOptions): Primer {
  const dynamicLabels = opts.mainDynamicColumnLabels ?? [];
  return {
    title: 'Competitive Analysis Primer',
    intro: [
      'This primer explains the spreadsheets in the Comprehensive Competitive Analysis Files. Read it first, then use the spreadsheets to analyze the competition.',
      'Each spreadsheet is exported from a competition-research tool. Together they describe a set of competitor products and what their customers say about them.',
      'Seven spreadsheets are provided: the four described below in full, plus "summary-only" versions of the three reviews spreadsheets (their file names end in "without individual reviews"). The summary-only versions keep each competitor’s identity columns and the AI review summaries but leave out the individual customer reviews — use them when you want the high-level picture without the per-review detail, and use the full versions when you need the underlying reviews.',
      'You can focus the analysis however the goal requires — for example, analyze only a particular product Type or Category, or only competitors above a certain Competition Score. Use the columns below to decide what to include and what to ignore.',
    ],
    howToRead: [
      'The spreadsheets are flat grids: wherever the on-screen tool stacks several items in one place (a competitor’s reviews, a category’s issues and their source reviews, captured items in a column), each item is split onto its own row.',
      'When an item is split across rows, the values it shares (the competitor’s details, a group-wide summary) are repeated on each of those rows, so every row is self-contained.',
    ],
    sections: [
      mainTableSection(opts.mainColumns, dynamicLabels),
      {
        heading: 'Competition Reviews Analysis',
        whatItIs:
          "Every captured customer review, one per row, grouped under its competitor, with the AI's per-review and per-competitor summaries.",
        columns: REVIEWS_COLUMNS,
        note: 'Each review is its own row; the competitor-level columns and the per-competitor summaries repeat down that competitor’s rows. A summary-only companion, "Competition Reviews Analysis without individual reviews", drops every per-review column (Stars, Reviews Summary, Review, Reviewer, Date, Review Summary) to give one row per competitor — just the identity columns and the two Comprehensive summaries.',
      },
      groupedSection('Category'),
      groupedSection('Type'),
    ],
  };
}

// Render the primer to plain text (used for the wording preview + as a simple
// fallback). The .docx renderer lives in the page (it needs the docx lib); the
// editor renderer below is pure JSON so node:test can pin its shape.
export function renderPrimerToPlainText(primer: Primer): string {
  const lines: string[] = [primer.title, ''];
  for (const p of primer.intro) lines.push(p, '');
  lines.push('HOW TO READ THESE SPREADSHEETS', '');
  for (const p of primer.howToRead) lines.push(p, '');
  for (const s of primer.sections) {
    lines.push('', `— ${s.heading} —`, s.whatItIs, '', 'Columns:');
    for (const c of s.columns) lines.push(`  • ${c.name}: ${c.description}`);
    if (s.note) lines.push('', s.note);
    lines.push('');
  }
  return lines.join('\n').trim();
}

// ─── TipTap / ProseMirror renderer (the "Insert primer" button) ────────────
// Pure: builds the same document the .docx renders, as TipTap JSON, so the
// editor's insertContent can drop it at the cursor. Headings use levels 1-2
// (the 'full' editor variant enables 1-3); each spreadsheet's columns become a
// bullet list with the column name in bold. Returned as a full `doc` node —
// editor.insertContent inserts its content at the cursor.

type TipTapNode = Record<string, unknown>;

function textNode(text: string): TipTapNode {
  return { type: 'text', text };
}
function boldTextNode(text: string): TipTapNode {
  return { type: 'text', marks: [{ type: 'bold' }], text };
}
function paragraph(children: TipTapNode[]): TipTapNode {
  return { type: 'paragraph', content: children };
}
function heading(level: 1 | 2 | 3, text: string): TipTapNode {
  return { type: 'heading', attrs: { level }, content: [textNode(text)] };
}
// One bullet whose first run (the column name) is bold, then ": description".
function columnBullet(name: string, description: string): TipTapNode {
  return {
    type: 'listItem',
    content: [paragraph([boldTextNode(`${name}: `), textNode(description)])],
  };
}

export function renderPrimerToTipTapDoc(primer: Primer): Record<string, unknown> {
  const content: TipTapNode[] = [];
  content.push(heading(1, primer.title));
  for (const p of primer.intro) content.push(paragraph([textNode(p)]));
  content.push(heading(2, 'How to read these spreadsheets'));
  for (const p of primer.howToRead) content.push(paragraph([textNode(p)]));
  for (const s of primer.sections) {
    content.push(heading(2, s.heading));
    content.push(paragraph([textNode(s.whatItIs)]));
    content.push({
      type: 'bulletList',
      content: s.columns.map((c) => columnBullet(c.name, c.description)),
    });
    if (s.note) content.push(paragraph([textNode(s.note)]));
  }
  return { type: 'doc', content };
}
