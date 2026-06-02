'use client';

// W#2 Detailed User Guide — always-visible inline guide rendered between
// the Status row and the DeliverablesArea on /projects/[projectId]/competition-scraping.
//
// Spec: COMPETITION_SCRAPING_STACK_DECISIONS.md §13.1.1 (install) + §13.1.2 (use)
// + §13.1.3 (implementation). All copy passes the Plain Language test per
// CLAUDE_CODE_STARTER.md Rule 1 — no jargon, no programming terms.
//
// Phase 1: default expanded (admin-solo can collapse). Phase 2+: stays present
// for new workers learning the workflow.
//
// Screenshots: gray placeholder boxes with caption today; real screenshots
// queued for a follow-up session once the extension UI exists. Folder
// public/competition-scraping/guide-screenshots/ is created in this session
// for future image commits.
//
// Print path: a small @media print stylesheet hides everything outside the
// guide block and resets colors to black-on-white; "Print this guide" button
// calls window.print(); user saves to PDF via the browser's native Print
// dialog. No PDF library — STACK_DECISIONS §15 Q8 deferred the library
// choice; the print-stylesheet path requires zero new dependencies and is
// always available regardless of any future library pick.

import { useState } from 'react';
import type { ReactNode } from 'react';

const COLOR_PANEL = '#161b22';
const COLOR_BORDER = '#30363d';
const COLOR_TEXT = '#e6edf3';
const COLOR_MUTED = '#8b949e';
const COLOR_LINK = '#58a6ff';
const COLOR_HEADING = '#f0f6fc';

const SCREENSHOT_PLACEHOLDER_CAPTION_PREFIX = 'Screenshot:';

function ScreenshotPlaceholder({ caption }: { caption: string }) {
  return (
    <figure
      style={{
        margin: '12px 0 16px',
        padding: 0,
      }}
    >
      <div
        style={{
          background: '#0d1117',
          border: `1px dashed ${COLOR_BORDER}`,
          borderRadius: '6px',
          padding: '32px 16px',
          textAlign: 'center',
          color: COLOR_MUTED,
          fontSize: '12px',
          fontStyle: 'italic',
        }}
      >
        {SCREENSHOT_PLACEHOLDER_CAPTION_PREFIX} {caption}
        <div style={{ marginTop: '6px', fontSize: '11px', color: '#6e7681' }}>
          (Image will be added once the extension UI is built.)
        </div>
      </div>
    </figure>
  );
}

function Step({
  n,
  children,
  screenshotCaption,
}: {
  n: number;
  children: ReactNode;
  screenshotCaption?: string;
}) {
  return (
    <li
      style={{
        display: 'flex',
        gap: '12px',
        padding: '10px 0',
        borderBottom: `1px solid ${COLOR_BORDER}`,
        listStyle: 'none',
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
          minWidth: '28px',
          height: '28px',
          padding: '0 8px',
          borderRadius: '14px',
          background: '#21262d',
          color: COLOR_HEADING,
          fontSize: '12px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {n}
      </span>
      <div style={{ flex: '1 1 auto', fontSize: '14px', lineHeight: 1.6 }}>
        <div>{children}</div>
        {screenshotCaption ? <ScreenshotPlaceholder caption={screenshotCaption} /> : null}
      </div>
    </li>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3
      style={{
        margin: '24px 0 8px',
        fontSize: '16px',
        fontWeight: 600,
        color: COLOR_HEADING,
      }}
    >
      {children}
    </h3>
  );
}

function SubsectionHeading({ children }: { children: ReactNode }) {
  return (
    <h4
      style={{
        margin: '18px 0 6px',
        fontSize: '14px',
        fontWeight: 600,
        color: COLOR_HEADING,
      }}
    >
      {children}
    </h4>
  );
}

function Para({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: '6px 0',
        fontSize: '14px',
        lineHeight: 1.6,
        color: COLOR_TEXT,
      }}
    >
      {children}
    </p>
  );
}

function MutedNote({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: '6px 0',
        fontSize: '13px',
        lineHeight: 1.55,
        color: COLOR_MUTED,
      }}
    >
      {children}
    </p>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        background: '#0d1117',
        border: `1px solid ${COLOR_BORDER}`,
        borderRadius: '4px',
        padding: '1px 6px',
        fontSize: '12px',
        fontFamily: "'IBM Plex Mono', monospace",
        color: COLOR_HEADING,
      }}
    >
      {children}
    </code>
  );
}

export function DetailedUserGuide() {
  const [expanded, setExpanded] = useState(false);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <section
      className="duguide-block"
      aria-labelledby="duguide-heading"
      style={{
        marginBottom: '24px',
        background: COLOR_PANEL,
        border: `1px solid ${COLOR_BORDER}`,
        borderRadius: '8px',
      }}
    >
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .duguide-block, .duguide-block * { visibility: visible !important; }
          .duguide-block {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            border: none !important;
            padding: 16px !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .duguide-block * {
            color: black !important;
            background: transparent !important;
            border-color: #ccc !important;
            box-shadow: none !important;
          }
          .duguide-block h2,
          .duguide-block h3,
          .duguide-block h4 {
            color: black !important;
          }
          .duguide-no-print { display: none !important; }
        }
      `}</style>

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: expanded ? `1px solid ${COLOR_BORDER}` : 'none',
        }}
      >
        <h2
          id="duguide-heading"
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: COLOR_HEADING,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span aria-hidden="true">📖</span>
          Detailed User Guide
        </h2>
        <div className="duguide-no-print" style={{ display: 'flex', gap: '8px' }}>
          {expanded ? (
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'transparent',
                border: `1px solid ${COLOR_BORDER}`,
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '12px',
                color: COLOR_LINK,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              aria-label="Print this guide (opens browser print dialog; choose Save as PDF to save a copy)"
            >
              🖨 Print this guide
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="duguide-body"
            style={{
              background: 'transparent',
              border: `1px solid ${COLOR_BORDER}`,
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              color: COLOR_TEXT,
              cursor: 'pointer',
              fontFamily: 'inherit',
              minWidth: '92px',
            }}
          >
            {expanded ? 'Hide guide ▾' : 'Show guide ▸'}
          </button>
        </div>
      </header>

      {expanded ? (
        <div
          id="duguide-body"
          style={{
            padding: '16px 22px 22px',
          }}
        >
          <Para>
            This guide has three parts. <strong>Part 1</strong> installs the Competition
            Scraping browser extension. <strong>Part 2</strong> uses the extension to capture
            competitor URLs, text, images, videos, screenshots, and reviews into PLOS.{' '}
            <strong>Part 3</strong> covers everything you do here on the PLOS website
            (vklf.com) once things are captured — organizing the tables, reviewing each
            competitor in detail, running the AI review summaries, and downloading the
            finished analysis files. The extension and this website work together: you capture
            with the extension, then come back here to view, edit, analyze, and export.
          </Para>
          <MutedNote>
            New to this workflow? Read top-to-bottom. Coming back to look something up? Use
            the section headings below — each one is self-contained.
          </MutedNote>

          <SectionHeading>What you&rsquo;ll need before you start</SectionHeading>
          <ul
            style={{
              margin: '6px 0 0',
              paddingLeft: '20px',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>A computer running Chrome (the extension is Chrome-only for now).</li>
            <li>Your PLOS sign-in email and password.</li>
            <li>
              The Competition Scraping zip file — download it from the &ldquo;Download
              Extension&rdquo; button below this guide.
            </li>
          </ul>

          <SectionHeading>Part 1 — Install the extension</SectionHeading>
          <Para>
            You only do this once per computer. When a newer version is released, you&rsquo;ll
            repeat the same steps with the new zip — see the note at the end of this section.
          </Para>
          <ol style={{ paddingLeft: 0, margin: '12px 0 0' }}>
            <Step
              n={1}
              screenshotCaption="The 'Download Extension (zip)' button on the Competition Scraping page."
            >
              On this page, find the <strong>Download Extension</strong> button below this
              guide and click it. Your browser saves a file named{' '}
              <Kbd>competition-scraping-LATEST.zip</Kbd> (usually to your Downloads folder).
            </Step>
            <Step
              n={2}
              screenshotCaption="Right-click menu showing 'Extract All' on Windows; double-click on Mac."
            >
              Find the zip file on your computer and unzip it.
              <ul style={{ marginTop: '6px', paddingLeft: '18px' }}>
                <li>
                  <strong>Windows:</strong> right-click the file and pick{' '}
                  <strong>Extract All&hellip;</strong> Click <strong>Extract</strong>.
                </li>
                <li>
                  <strong>Mac:</strong> double-click the file. A new folder appears next to it.
                </li>
              </ul>
              You&rsquo;ll end up with a <em>folder</em> (not a zip). Remember where you put
              this folder — you&rsquo;ll point Chrome at it in step 6.
            </Step>
            <Step
              n={3}
              screenshotCaption="Chrome address bar with chrome://extensions typed in."
            >
              Open Chrome. In the address bar at the top of the window, type{' '}
              <Kbd>chrome://extensions</Kbd> and press Enter. (You can also paste it.) The
              Extensions page opens.
            </Step>
            <Step
              n={4}
              screenshotCaption="The 'Developer Mode' toggle highlighted in the top-right."
            >
              In the top-right of the Extensions page, find the toggle labeled{' '}
              <strong>Developer Mode</strong>. Click it so it turns blue (on). New buttons
              appear on the left.
            </Step>
            <Step
              n={5}
              screenshotCaption="The 'Load unpacked' button highlighted in the top-left."
            >
              Click <strong>Load unpacked</strong> in the top-left. A file picker opens.
            </Step>
            <Step
              n={6}
              screenshotCaption="File picker open at the unzipped folder; user about to click 'Select Folder'."
            >
              In the file picker, find the unzipped folder from step 2 (the folder, not the zip
              file). Click it once to highlight it, then click <strong>Select Folder</strong>{' '}
              (Windows) or <strong>Open</strong> (Mac). Chrome loads the extension.
            </Step>
            <Step
              n={7}
              screenshotCaption="Chrome puzzle-piece menu open with the pin icon next to 'Competition Scraping'."
            >
              The <strong>Competition Scraping</strong> extension now appears in your
              Extensions list. Pin it to your toolbar so you can reach it easily: click the{' '}
              <strong>puzzle-piece icon</strong> in the top-right of Chrome, find{' '}
              <strong>Competition Scraping</strong> in the dropdown, and click the{' '}
              <strong>pin icon</strong> next to its name. The extension&rsquo;s icon now sits
              in your toolbar permanently.
            </Step>
          </ol>

          <SubsectionHeading>When a new version is released</SubsectionHeading>
          <Para>
            We&rsquo;ll send you a new zip. Repeat the same steps above with the new zip:
            unzip it, then in <Kbd>chrome://extensions</Kbd> click <strong>Load unpacked</strong>{' '}
            and pick the new folder. Chrome replaces the old version automatically.
          </Para>
          <MutedNote>
            You can keep the old folder around if you want to roll back, but you don&rsquo;t
            have to.
          </MutedNote>

          <SectionHeading>Part 2 — Use the extension</SectionHeading>
          <Para>
            Once the extension is installed, every flow below starts the same way: click the{' '}
            <strong>Competition Scraping</strong> icon in your Chrome toolbar to open the
            extension popover.
          </Para>

          <SubsectionHeading>Sign in</SubsectionHeading>
          <Para>
            Click the extension icon in your toolbar. The first time you open it,
            you&rsquo;ll see a sign-in screen. Type your PLOS email and password, then click{' '}
            <strong>Sign in</strong>. The extension remembers you on this computer until you
            sign out.
          </Para>
          <ScreenshotPlaceholder caption="Extension popover sign-in screen with email and password fields." />

          <SubsectionHeading>Pick a Project and a platform</SubsectionHeading>
          <Para>
            After signing in, the extension asks two questions:
          </Para>
          <ol style={{ paddingLeft: '24px', margin: '6px 0', fontSize: '14px', lineHeight: 1.7 }}>
            <li>
              <strong>Which Project are you working on?</strong> Pick from the dropdown of
              Projects you have access to.
            </li>
            <li>
              <strong>Which source platform?</strong> Pick the website you&rsquo;re browsing —
              Amazon, Ebay, Etsy, Walmart, Google Shopping, Google Ads, or Independent
              Website.
            </li>
          </ol>
          <Para>
            You can switch either of these any time from the extension popover.
          </Para>
          <ScreenshotPlaceholder caption="Project + platform pickers in the extension popover." />

          <SubsectionHeading>Set up Highlight Terms (optional but useful)</SubsectionHeading>
          <Para>
            Highlight Terms make important words on competitor pages stand out in color so you
            spot them faster while you browse. In the extension popover, open the{' '}
            <strong>Highlight Terms</strong> section. Type each term you&rsquo;re looking for
            on a new line, and pick a color for each from the swatch grid. Anywhere those
            words appear on a competitor page, the extension highlights them in your chosen
            color.
          </Para>
          <ScreenshotPlaceholder caption="Highlight Terms list with two terms and a color swatch grid." />

          <SubsectionHeading>Capture a competitor URL</SubsectionHeading>
          <ol style={{ paddingLeft: 0, margin: '6px 0 0' }}>
            <Step n={1}>
              In Chrome, go to your chosen platform and search for relevant products.
            </Step>
            <Step
              n={2}
              screenshotCaption="A product link on a competitor page with the floating '+ Add' button hovering near it."
            >
              Hover your mouse over a product link in the search results. A small floating{' '}
              <strong>+ Add</strong> button appears next to the link.
            </Step>
            <Step n={3}>
              Click <strong>+ Add</strong>. A small form opens, pre-filled with the URL.
            </Step>
            <Step n={4}>
              Review the URL. Optionally fill in <strong>Competition Category</strong>,{' '}
              <strong>Product Name</strong>, and <strong>Brand Name</strong> — or leave them
              blank and fill them in later from the PLOS page.
            </Step>
            <Step n={5}>
              Click <strong>Save</strong>. The URL is captured into PLOS for the Project and
              platform you picked.
            </Step>
          </ol>
          <MutedNote>
            You can capture as many URLs as you want — the extension keeps a small running
            count in its toolbar icon so you can see how many you&rsquo;ve added today.
          </MutedNote>

          <SubsectionHeading>Add Sizes / Options and prices</SubsectionHeading>
          <Para>
            After a URL is saved, you can add the product&rsquo;s size or option list (e.g.{' '}
            <em>Small / Medium / Large</em> or <em>50ml / 100ml</em>) along with each
            variant&rsquo;s price and shipping cost.
          </Para>
          <ol style={{ paddingLeft: '24px', margin: '6px 0', fontSize: '14px', lineHeight: 1.7 }}>
            <li>Open the URL&rsquo;s detail page on PLOS (click the row in the URL list).</li>
            <li>
              Find the <strong>Sizes / Options</strong> section. Click <strong>+ Add row</strong>.
            </li>
            <li>Type the size or option name, the price, and the shipping cost. Press Enter.</li>
          </ol>
          <ScreenshotPlaceholder caption="Sizes / Options table on a URL detail page with one row being added." />

          <SubsectionHeading>Capture text from a competitor page</SubsectionHeading>
          <ol style={{ paddingLeft: 0, margin: '6px 0 0' }}>
            <Step n={1}>
              On the competitor page, highlight the text you want to capture (drag your mouse
              across it).
            </Step>
            <Step
              n={2}
              screenshotCaption="Highlighted text with the extension popover open and the 'Add Text' button visible."
            >
              Click the extension icon in your toolbar to open the popover. Click{' '}
              <strong>Add Text</strong>.
            </Step>
            <Step n={3}>
              Pick a <strong>Content Category</strong> from the dropdown (e.g.{' '}
              <em>Product description</em>, <em>Customer review</em>, <em>Product spec</em>).
            </Step>
            <Step n={4}>
              Click <strong>Save</strong>. The text is captured against the URL you currently
              have open in your browser tab.
            </Step>
          </ol>

          <SubsectionHeading>Capture a regular product image</SubsectionHeading>
          <ol style={{ paddingLeft: 0, margin: '6px 0 0' }}>
            <Step n={1}>On the competitor page, find the image you want to capture.</Step>
            <Step
              n={2}
              screenshotCaption="Right-click context menu on an image showing 'Add to PLOS — Image'."
            >
              Right-click the image. From the menu that appears, pick{' '}
              <strong>Add to PLOS &mdash; Image</strong>.
            </Step>
            <Step n={3}>
              Pick the <strong>Image Category</strong> when the extension prompts you. Click{' '}
              <strong>Save</strong>. The image uploads in the background.
            </Step>
          </ol>
          <MutedNote>
            If your internet drops mid-upload, the extension keeps the image in a queue and
            uploads it once you&rsquo;re back online — you don&rsquo;t need to retry.
          </MutedNote>

          <SubsectionHeading>Capture an A+ Content Module (region screenshot)</SubsectionHeading>
          <Para>
            Some product pages include rich layout blocks where text and images overlay each
            other (often called &ldquo;A+ Content&rdquo; on Amazon). To capture the whole
            block as a single image:
          </Para>
          <ol style={{ paddingLeft: 0, margin: '6px 0 0' }}>
            <Step
              n={1}
              screenshotCaption="Extension popover with 'Region screenshot' button highlighted."
            >
              Click the extension icon to open the popover. Click <strong>Region screenshot</strong>.
              Your cursor becomes a crosshair.
            </Step>
            <Step n={2}>
              Click and drag a rectangle around the entire content block (image + overlay
              text). Release the mouse when the rectangle covers everything you want.
            </Step>
            <Step n={3}>
              Pick the <strong>Image Category</strong>. Click <strong>Save</strong>. The
              region is saved as one image against the URL you have open.
            </Step>
          </ol>

          <SubsectionHeading>Capture a video</SubsectionHeading>
          <Para>
            You can save a competitor&rsquo;s video two ways, depending on whether it&rsquo;s
            an online video you can point at or something playing on the page you want to
            record.
          </Para>
          <ol style={{ paddingLeft: 0, margin: '6px 0 0' }}>
            <Step
              n={1}
              screenshotCaption="Right-click menu on a video showing 'Add to PLOS — Captured Video' and 'Record video for PLOS'."
            >
              <strong>To save an online video:</strong> right-click the video and pick{' '}
              <strong>Add to PLOS &mdash; Captured Video</strong>. The extension grabs the
              video&rsquo;s link.
            </Step>
            <Step n={2}>
              <strong>To record what&rsquo;s on screen instead:</strong> right-click and pick{' '}
              <strong>Record video for PLOS</strong>, then drag a rectangle around the part of
              the page you want. Recording starts; click <strong>Stop</strong> when
              you&rsquo;re done (recordings are capped at about three minutes).
            </Step>
            <Step n={3}>
              Pick the <strong>Video Category</strong> when prompted, then click{' '}
              <strong>Save</strong>. The video is saved against the URL you have open and shows
              up in that competitor&rsquo;s detail page on PLOS (see Part 3).
            </Step>
          </ol>

          <SubsectionHeading>Capture a competitor&rsquo;s reviews</SubsectionHeading>
          <Para>
            On supported shopping platforms, the extension can pull a competitor&rsquo;s
            customer reviews in for you so you can analyze them later on PLOS.
          </Para>
          <ol style={{ paddingLeft: 0, margin: '6px 0 0' }}>
            <Step n={1}>
              Open the competitor&rsquo;s product page that you already captured as a URL.
            </Step>
            <Step
              n={2}
              screenshotCaption="Right-click menu showing 'Scrape reviews for this URL', with the small progress indicator running."
            >
              Right-click anywhere on the page and pick{' '}
              <strong>Scrape reviews for this URL</strong>. A small progress indicator appears
              while the extension reads through the review pages.
            </Step>
            <Step n={3}>
              When it finishes, the reviews are saved against that URL. You can read, edit, and
              summarize them on PLOS — see <strong>Capture &amp; manage reviews</strong> and{' '}
              <strong>The Reviews Analysis tables</strong> in Part 3.
            </Step>
          </ol>
          <MutedNote>
            You can also add a single review by hand on the competitor&rsquo;s detail page in
            PLOS (the <strong>+ Add review</strong> button) if you ever need to.
          </MutedNote>

          <SubsectionHeading>Browse what you&rsquo;ve captured</SubsectionHeading>
          <Para>
            You can see what you&rsquo;ve captured in two places:
          </Para>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>From the extension popover</strong> — click <strong>Browse Captured</strong>{' '}
              for a quick mini-table of recent captures.
            </li>
            <li>
              <strong>From PLOS (this page)</strong> — scroll below this guide to the
              full sortable, filterable, searchable view of every URL, text row, and image
              for this Project across every platform.
            </li>
          </ul>

          <SubsectionHeading>Edit any captured row</SubsectionHeading>
          <Para>
            Anything you captured can be changed later:
          </Para>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>From PLOS:</strong> click the row in the URL list to open its detail
              page. Click the small <strong>✎</strong> next to any field, change the value,
              and click <strong>✓</strong> to save (or press Enter).
            </li>
            <li>
              <strong>From the extension:</strong> click the row in <strong>Browse Captured</strong>;
              the same small edit fields appear.
            </li>
          </ul>

          <SubsectionHeading>Sign out or reset the extension</SubsectionHeading>
          <Para>
            Open the extension popover and go to the <strong>Settings</strong> tab.
          </Para>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>Sign out</strong> ends your session on this computer. Next time you open
              the extension, it asks for your email and password again.
            </li>
            <li>
              <strong>Reset extension</strong> clears the extension&rsquo;s local state on
              this computer (sign-in, picked Project, picked platform, queued uploads,
              Highlight Terms). Your captured data on PLOS is{' '}
              <strong>not affected</strong> — it stays exactly as it was. Use this if the
              extension feels stuck and you want a clean slate.
            </li>
          </ul>

          <SectionHeading>Part 3 — On the PLOS website (vklf.com)</SectionHeading>
          <Para>
            Everything you capture flows into this website, where you organize it, dig into
            each competitor, have the AI summarize their reviews, and download finished
            analysis files to share. Across the top of the Competition Scraping area there are
            five tabs.
          </Para>

          <SubsectionHeading>The five tabs</SubsectionHeading>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>Competitor Content Table</strong> — the main list of every competitor URL
              you&rsquo;ve captured, with all its details.
            </li>
            <li>
              <strong>Competitor Reviews Analysis Table</strong> — every competitor&rsquo;s
              reviews, with AI summaries.
            </li>
            <li>
              <strong>Reviews Analysis By Competitor Category Table</strong> — the same reviews,
              grouped by the category you gave each competitor.
            </li>
            <li>
              <strong>Reviews Analysis By Competitor Type Table</strong> — the same reviews,
              grouped by type.
            </li>
            <li>
              <strong>Comprehensive Analysis</strong> — download-ready spreadsheets, a teaching
              primer, and a space to write your overall summary.
            </li>
          </ul>

          <SubsectionHeading>The Competitor Content Table (main page)</SubsectionHeading>
          <Para>
            Each row is one competitor URL you captured. This is where you tidy everything up
            and find what you need.
          </Para>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>Open a competitor&rsquo;s full detail page</strong> — click the small{' '}
              <strong>↗</strong> at the right of the Product Name, or click anywhere on the row.
            </li>
            <li>
              <strong>Show or hide columns</strong> — use the <strong>Columns</strong> box to
              turn any column on or off. Your choice is remembered.
            </li>
            <li>
              <strong>Filter by platform</strong> — use the <strong>Platforms</strong> box to
              show only Amazon, Etsy, and so on.
            </li>
            <li>
              <strong>Search</strong> — type in the search box to find competitors by any text.
            </li>
            <li>
              <strong>Change the text size</strong> — use the font-size buttons if the table
              feels too small or too large.
            </li>
            <li>
              <strong>Sort</strong> — click a column heading to sort by it; click again to
              reverse the order.
            </li>
            <li>
              <strong>Filter one column</strong> — click the small funnel on a column heading
              to pick exactly which values to show.
            </li>
            <li>
              <strong>Reorder columns</strong> — drag a column heading by its grip handle to
              move it. The order is shared for the whole Project.
            </li>
            <li>
              <strong>Reorder rows</strong> — drag a row by its <strong>⠿</strong> handle on the
              left to put competitors in the order you want.
            </li>
            <li>
              <strong>Group the rows</strong> — use the <strong>Sort By</strong> box to group
              competitors by Platform, Category, or Type into banner sections.
            </li>
            <li>
              <strong>Category columns appear automatically</strong> — as you tag captured text,
              images, and videos with categories, matching columns show up so you can compare
              them side by side.
            </li>
            <li>
              <strong>Add a URL by hand</strong> — the <strong>+ Add URL</strong> button.
            </li>
            <li>
              <strong>Delete a competitor</strong> — the trash icon on the row. Because this
              also removes everything captured for it, PLOS tells you how many texts, images,
              videos, and reviews will be removed before you confirm.
            </li>
          </ul>
          <ScreenshotPlaceholder caption="The Competitor Content Table with the Columns, Platforms, and Sort By boxes." />

          <SubsectionHeading>A competitor&rsquo;s detail page</SubsectionHeading>
          <Para>
            Open it with the <strong>↗</strong> icon (or by clicking a row). This is the deep
            view of one competitor.
          </Para>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>Edit any detail</strong> — click the <strong>✎</strong> next to a field
              (product name, brand, category, stars, and so on), change it, and it saves.
            </li>
            <li>
              <strong>Captured Text, Images, Videos, and Reviews</strong> each have their own
              section. You can change the category on any item, edit it, or delete it with its
              trash button.
            </li>
            <li>
              <strong>Click an image thumbnail</strong> to see it full-size.
            </li>
            <li>
              <strong>Your Analysis box</strong> — every captured item has one. Type your own
              notes about it and they save automatically.
            </li>
            <li>
              <strong>Category labels</strong> show as little pills. Each pill has a small{' '}
              <strong>✕</strong> — clicking it removes that category label across the whole
              Project. Because that can affect many items, PLOS first tells you exactly how many
              will be removed and asks you to confirm.
            </li>
            <li>
              <strong>Overall Competitor Analysis box</strong> — at the bottom, a space for your
              own summary of this competitor. It saves automatically.
            </li>
          </ul>
          <ScreenshotPlaceholder caption="A competitor detail page with the Text, Images, Videos, and Reviews sections." />

          <SubsectionHeading>Capture &amp; manage reviews</SubsectionHeading>
          <Para>
            Reviews come in from the extension (Part 2), or you can add one by hand. You work
            with them on the competitor&rsquo;s detail page:
          </Para>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>Read or edit any review</strong> — click it to change the stars, title,
              body, or tags.
            </li>
            <li>
              <strong>Delete a review</strong> with its trash button, or tick several and use{' '}
              <strong>Delete selected</strong>.
            </li>
            <li>
              <strong>Add one by hand</strong> with <strong>+ Add review</strong>.
            </li>
            <li>
              <strong>Give each review your own note</strong> in its{' '}
              <strong>Your Analysis</strong> box.
            </li>
          </ul>
          <Para>
            Once reviews are in, the three Reviews Analysis tabs let the AI summarize them for
            you.
          </Para>

          <SubsectionHeading>The Reviews Analysis tables (and the AI summaries)</SubsectionHeading>
          <Para>
            Three tabs show the same reviews three ways — per competitor, grouped by category,
            and grouped by type. Each one can have the AI read the reviews and write summaries
            for you.
          </Para>
          <Para>
            <strong>What the AI gives you</strong> (each comes as tidy bullet points, and most
            also have a plain-paragraph version if you prefer prose):
          </Para>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>Per-review summary</strong> — a one-line gist of each individual review.
            </li>
            <li>
              <strong>Per-competitor summary</strong> — pulls all of one competitor&rsquo;s
              reviews into a set of themed points (what customers praise and complain about).
            </li>
            <li>
              <strong>By-category and by-type summaries</strong> — the same themed points, but
              combined across all the competitors in a category or a type, so you see the big
              picture for a whole group.
            </li>
            <li>
              <strong>All-competitors summary</strong> — one overall summary spanning every
              competitor.
            </li>
          </ul>
          <Para>
            <strong>To run one:</strong> open the tab you want, find the AI button on a
            competitor&rsquo;s row (or on a category/type banner), and click it. A small window
            opens; confirm, and the summary fills into the table as it&rsquo;s generated. You can
            edit a summary afterward, or clear it and run it again.
          </Para>
          <Para>The tables also let you:</Para>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>Drag to reorder</strong> competitors (and, on the grouped tabs, whole
              categories or types).
            </li>
            <li>
              <strong>Hide a row or group</strong> you don&rsquo;t want to look at — it&rsquo;s
              only hidden on that page, never deleted, and a panel lets you bring it back.
            </li>
            <li>
              <strong>Export to Excel</strong> — download the table as a spreadsheet.
            </li>
          </ul>
          <ScreenshotPlaceholder caption="A Reviews Analysis table with the AI summary buttons and a generated summary." />

          <SubsectionHeading>The Comprehensive Analysis page</SubsectionHeading>
          <Para>This is where you pull everything together and hand it off.</Para>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>Download finished files</strong> — the <strong>Files</strong> box gives
              you ready-made spreadsheets of every table. There are also slimmer versions{' '}
              &ldquo;without individual reviews&rdquo; if you only want the summaries, and a{' '}
              <strong>Download all</strong> button that bundles everything into one zip.
            </li>
            <li>
              <strong>A teaching primer</strong> — a short Word document that explains how to
              read the files. You can drop it into your write-up with{' '}
              <strong>Insert primer</strong>, or open <strong>Edit</strong> to change the
              wording, <strong>Save</strong> your own version, and <strong>Reset to default</strong>{' '}
              any time.
            </li>
            <li>
              <strong>Your overall write-up</strong> — a rich-text space to write your
              competitive analysis for the whole Project. It saves as you go.
            </li>
          </ul>
          <ScreenshotPlaceholder caption="The Comprehensive Analysis page with the Files box and the primer controls." />

          <SectionHeading>Tips</SectionHeading>
          <ul
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              fontSize: '14px',
              lineHeight: 1.7,
              color: COLOR_TEXT,
            }}
          >
            <li>
              <strong>Capture first, organize later.</strong> You can always come back to PLOS
              and fill in Brand, Category, and other fields. Don&rsquo;t let the form slow you
              down while you&rsquo;re browsing.
            </li>
            <li>
              <strong>The extension and PLOS stay in sync automatically.</strong> Anything
              you capture in the extension shows up on PLOS within a few seconds. If your
              internet drops, the extension queues your captures and sends them once
              you&rsquo;re back online.
            </li>
            <li>
              <strong>Stuck?</strong> Try reset the extension (Settings tab). Your PLOS data
              is safe — only the extension&rsquo;s local state clears.
            </li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
