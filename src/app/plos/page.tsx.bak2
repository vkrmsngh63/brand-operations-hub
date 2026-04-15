"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════
   DEFAULT CARD DATA — 14 workflow cards
   ═══════════════════════════════════════════════════════════════ */

interface CardData {
  id: string;
  icon: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  badge: "active" | "soon";
  route: string | null;
}

const DEFAULT_CARDS: CardData[] = [
  {
    id: "keyword-analysis",
    icon: "🔑",
    title: "Keyword Analysis & Intent Discovery",
    shortDesc:
      "Import and cluster keywords into intent groups, discover value tool opportunities, and map cross-page narrative potential for conversion funnels.",
    longDesc: `## Keyword Import & Cleaning
- Raw keyword list upload
- Deduplication & normalization
- Volume/CPC/competition data enrichment

## AI Clustering & Intent Grouping
- Semantic clustering into 200–300 intent groups
- Intent group naming & description generation
- Hierarchical topic organization (mindmap structure)

## Intent Interrogation & Enrichment
- Therapeutic demand signal extraction (symptoms, mechanisms, outcomes)
- Product type tagging (oral, topical, device, protocol)
- Customer Moment Portrait generation per intent group
- Multi-intent identification per keyword

## Value Tool Opportunity Discovery
- Free tool/assessment identification per intent group
- Lead magnet concept generation
- App engagement opportunity mapping

## Cross-Page Narrative Potential Mapping
- Intent group flow sequencing (which connects to which)
- Central funnel positioning (which intents form the main narrative spine)
- Branch intent identification

## Review & Approval
- Human review of clusters and enrichment
- Adjustment interface for non-technical workers
- Approval gate before passing to downstream stages`,
    badge: "active",
    route: "/keyword-clustering",
  },
  {
    id: "competition-scraping",
    icon: "🔍",
    title: "Competition Scraping & Deep Analysis",
    shortDesc:
      "Identify competitors, analyze SEO depth, marketplace listings, clinical evidence, and generate competitive landscape reports with gap analysis.",
    longDesc: `## Competitor Product Discovery
- Automated competitor identification per niche
- Product catalog scraping (products, pricing, claims, ingredients)
- Competitor brand mapping

## Competitor SEO Analysis
- Content depth scoring per competitor
- Topical authority assessment
- Ranking analysis for target keyword clusters
- Content gap identification (intents no competitor serves well)

## Marketplace Competitor Analysis
- Amazon listing quality scoring (titles, bullets, A+, images)
- Review analysis (volume, sentiment, common complaints)
- Pricing and positioning analysis
- Multi-platform presence mapping

## Competitor Clinical Evidence Mapping
- Claims inventory per competitor
- Evidence strength assessment
- Claim gap identification (claims we can make that they can't)

## Competitive Landscape Report
- Automated report generation per niche
- Gaps & opportunities summary per intent group
- Strategic recommendations for differentiation
- Review & approval gate`,
    badge: "soon",
    route: null,
  },
  {
    id: "therapeutic-strategy",
    icon: "🧬",
    title: "Therapeutic Strategy & Product Family Design",
    shortDesc:
      "Design product families, prioritize therapeutic claims, plan clinical trials, and create therapeutic engagement protocols.",
    longDesc: `## Product Family Architecture
- Central product design (broadest therapeutic coverage)
- Sister product identification (topicals, devices, additional orals)
- Strength tier design (Mild, Original, Strong, Extra Strong)
- Shared ingredient strategy (one trial supports multiple products)
- Custom formulation trigger criteria

## Therapeutic Claim Prioritization
- Keyword demand × competitive gap × proof feasibility scoring
- Claim ranking and selection
- Regulatory pre-screening of proposed claims

## Clinical Trial Design
- Endpoint selection from keyword demand signals
- Evidence tier assignment (Tier 1–4) per product
- Trial protocol framework
- CRO coordination plan

## Therapeutic Engagement Protocol Design
- Complementary actions discovery (exercises, lifestyle, tracking)
- Companion app protocol specification
- Therapeutic Alliance Loop phase design
- Negative experience interception design
- App/engagement positioning strategy

## Product Family Narrative Logic
- Product relationship mapping
- Therapeutic journey timeline
- Customer-facing explanation framework
- Cross-sell/upsell sequence logic
- Confusion prevention guidelines

## Review & Approval
- Product family sign-off
- Formulation team handoff
- CRO briefing package generation`,
    badge: "soon",
    route: null,
  },
  {
    id: "brand-identity-ip",
    icon: "🏷️",
    title: "Brand Identity & IP",
    shortDesc:
      "Generate brand names, build visual identity, file trademarks and patents, and maintain exit-value asset documentation.",
    longDesc: `## Brand Creation
- AI-assisted brand name generation
- Trademark availability check (batch)
- Domain availability check (batch)
- Final name selection & approval

## Visual Identity
- Color palette generation (algorithmic within aesthetic constraints)
- Typography selection
- Logo concept generation
- Design system parameters
- Packaging design direction

## IP Filing & Management
- USPTO trademark intent-to-use filing
- Domain registration
- Trade secret documentation
- Patent assessment (formulation, method-of-use, device design)
- IP portfolio tracking per brand

## Exit-Value Asset Package
- Transferable asset documentation initiated
- Brand asset inventory (auto-maintained)`,
    badge: "soon",
    route: null,
  },
  {
    id: "conversion-funnel",
    icon: "🎯",
    title: "Conversion Funnel & Narrative Architecture",
    shortDesc:
      "Architect central and custom funnels, design micro-journeys with section-level specs, and integrate email, PPC, and value tools.",
    longDesc: `## Central Funnel Architecture
- Complete narrative arc design (first symptom awareness → loyal advocate)
- Chapter sequencing (which intent groups form the spine)
- Narrative theme and emotional arc specification
- Internal linking topology for topical authority

## Custom Funnel Generation
- Per-intent-group funnel derivation from central funnel
- Subset selection and custom additions
- Branch funnel design and re-merge points

## Micro-Journey Section Design
- Page section architecture (6–12 sections per page)
- Per-section specification: proposition, emotional beat, persuasion mechanism, open loops, micro-CTAs
- Visual presentation parameters per section
- Jump-ahead link placement

## Cross-Page Narrative Threading
- Section-level link specifications (source page/section → target page/section)
- Narrative promise documentation
- Dependency graph management (auto-tracked, AI-verified)

## Email & Engagement Integration
- Email capture point mapping per funnel position
- Lead magnet assignment per intent group
- Nurture sequence trigger design
- App download prompt positioning

## Value Tool Specification
- Free tool/assessment designs per niche
- Placement within funnel
- Technical requirements for build

## PPC Landing Page Rules
- Extraction rules: which sections from SEO page → PPC variant
- PPC page template specification
- Keyword-to-PPC-variant mapping

## Review & Approval
- Central funnel sign-off
- Dependency graph completeness check
- SEO architecture and analytics event specification validation`,
    badge: "soon",
    route: null,
  },
  {
    id: "content-development",
    icon: "✍️",
    title: "Content Development",
    shortDesc:
      "Generate SEO pages, PPC landing pages, marketplace listings, email sequences, and app content with AI quality scoring and compliance review.",
    longDesc: `## Central Narrative Generation
- Overall brand story and customer journey narrative
- AI generation with human strategic review
- Narrative tone, voice, and terminology standards

## SEO Page Generation
- Multi-pass pipeline: section outlines → full page content → integration review
- Per-page prompt assembly (customer moment portrait + narrative context + section specs)

## PPC Landing Page Generation
- Automated extraction from SEO pages using funnel rules
- Conversion-focused restructuring and CTA optimization

## Marketplace Listing Content
- Amazon titles, bullets, backend keywords, A+ text
- Walmart, eBay, Etsy, Google Shopping content per platform template

## Email Sequence Content
- Pre-purchase nurture sequences per intent group
- Post-purchase support and therapeutic alliance content
- Cross-sell/upsell and review request sequences

## App & Engagement Content
- Onboarding scripts and daily engagement micro-content
- Milestone celebration and negative experience interception scripts

## Quality Scoring & Pre-Screening
- AI quality evaluation (pattern interrupts, open loops, evidence, pacing)
- Compliance pre-screening (red flag lexicon, claim checks)
- Regeneration queue for failing content

## MD Credentialing
- Physician review assignment and credentialing badge insertion

## Compliance Review Queue
- Content routed to compliance firms with status tracking
- Revision workflow (feedback → AI regeneration → re-review)

## Content Performance & Prompt Evolution
- Published content performance tracking
- Top/bottom performer analysis and prompt library updates`,
    badge: "soon",
    route: null,
  },
  {
    id: "multimedia-assets",
    icon: "🎬",
    title: "Multi-Media Assets & App Development",
    shortDesc:
      "Create product imagery, medical illustrations, infographics, video content, companion apps, and value assessment tools.",
    longDesc: `## Product & Lifestyle Imagery
- Product photography specifications
- AI-generated lifestyle imagery
- Brand-consistent image treatment

## Medical & Educational Illustrations
- Mechanism of action illustrations
- Anatomical reference images and how-it-works diagrams

## Infographics & Data Visualization
- Clinical data infographics and comparison charts
- Treatment pathway visuals and before/after frameworks

## Marketplace-Specific Assets
- Amazon A+ Content image modules
- Enhanced Brand Content per platform and gallery images

## Video & Audio Content
- Product demonstration videos and mechanism explainer animations
- Testimonial frameworks and podcast/voiceover scripts

## Social Media Assets
- Platform-specific formats and dimensions
- Brand-consistent social templates

## Companion App Build
- PWA core (primary) + native app wrapper (app store presence)
- Therapeutic protocol delivery, progress tracking, Day 7 check-in
- Strength adjustment and custom formulation flows
- Review prompt and deep-link system
- Non-purchaser functionality (value tools, path to purchase)

## Value Tools Build
- Free assessments, calculators, trackers
- Website deployment and app integration`,
    badge: "soon",
    route: null,
  },
  {
    id: "marketplace-launch",
    icon: "🏪",
    title: "Marketplace Optimization & Launch",
    shortDesc:
      "Launch and optimize across Amazon, Walmart, eBay, Etsy, Google Shopping, and your website with multi-platform coordination.",
    longDesc: `## Amazon Launch & Optimization
- Listing creation, A+ Content deployment, Brand Registry setup
- Vine review program enrollment
- Sponsored Products setup and backend keyword optimization

## Walmart Launch & Optimization
- Listing creation per Walmart specs
- Price and fulfillment optimization
- Walmart Fulfillment Services assessment

## eBay Launch & Optimization
- Listing creation, gallery optimization, freshness scheduling

## Etsy Launch & Optimization
- Listing creation with natural/health positioning
- Etsy SEO (tags, attributes, categories)

## Google Shopping
- Product feed creation and optimization
- Merchant Center setup and structured data validation

## Website Launch
- Domain deployment and SEO page publication
- Email capture verification and analytics tracking
- Value tools deployment and MD credentialing badges
- Search Console setup and verification

## Multi-Platform Coordination
- Inventory sync across all channels
- Pricing strategy per channel
- Launch timing coordination`,
    badge: "soon",
    route: null,
  },
  {
    id: "clinical-evidence",
    icon: "🔬",
    title: "Clinical Evidence & Endorsement",
    shortDesc:
      "Manage evidence tiers from case reports to full RCTs, coordinate publications, build research communities, and secure endorsements.",
    longDesc: `## Evidence Tier Management
- Tier 1: Case Reports & N-of-1 Studies (app data collection, consent, drafting)
- Tier 2: Observational Cohort Studies (passive app data, cohort analysis)
- Tier 3: Pilot RCTs (protocol development, ethics submission, CRO execution)
- Tier 4: Full RCTs (ClinicalTrials.gov registration, multi-site coordination, publication)

## Publication Management
- Pre-print submission (medRxiv) and journal submission tracking
- Conference abstract submissions
- Lay summary generation for brand websites

## Clinical Research Community
- Participant recruitment and onboarding with consent management
- Value exchange delivery (priority access, research updates)
- Data anonymization and IRB compliance

## MD Advisory Panel & Credentialing
- Physician recruitment, content review assignment, credential verification
- Review scheduling across content volume

## Practitioner Endorsement
- Target practitioner identification, outreach, and relationship management
- Evidence package distribution and endorsement documentation

## Evidence Database & Claims Repository
- Structured claims catalog (searchable, tagged)
- Evidence strength rating per claim with linked studies
- Content upgrade triggers when new evidence publishes
- Compliance-cleared claims approved for use`,
    badge: "soon",
    route: null,
  },
  {
    id: "therapeutic-engagement",
    icon: "💊",
    title: "Therapeutic Engagement & Review Generation",
    shortDesc:
      "Manage therapeutic alliance loops, multi-channel engagement, negative experience interception, review generation, and referral systems.",
    longDesc: `## Therapeutic Alliance Loop Management
- Active loop dashboard per product (customers at each phase)
- Phase performance metrics (engagement rates, drop-off points)
- Loop optimization controls

## Multi-Channel Engagement Engine
- App, email, SMS coordination with channel preference management
- Cross-channel deduplication (no redundant messages)

## Onboarding & Active Engagement
- Personalized onboarding flow monitoring
- Daily micro-interaction management
- Therapeutic protocol compliance and milestone detection

## Negative Experience Interception
- Disengagement signal detection
- Day 7 check-in management
- Automated personalized outreach sequences
- Strength adjustment and custom formulation routing
- Human escalation (wellness coach, telehealth) queue
- Proactive refund offer triggers

## Review Generation
- Milestone-triggered review prompts
- Platform-specific deep-link generation
- Pre-framed review prompt personalization
- Review submission tracking and response system

## Cross-Sell & Upsell Management
- Sister product introduction timing and bundle offers
- Subscription/auto-refill conversion

## Referral System
- Referral prompt timing, tracking, rewards, and protocol sharing`,
    badge: "soon",
    route: null,
  },
  {
    id: "post-launch-optimization",
    icon: "📈",
    title: "Post-Launch Optimization",
    shortDesc:
      "Monitor SEO and marketplace performance, optimize conversions, detect competitive changes, refresh content, and build cross-brand pattern libraries.",
    longDesc: `## SEO Monitoring Dashboard
- Indexing status, impression trends, CTR tracking per page
- Ranking trajectory per primary keyword
- Content decay detection, alerts, and refresh queue

## Conversion Optimization
- A/B testing management (landing pages, email subjects, CTAs)
- Scroll depth and engagement analytics
- Funnel drop-off analysis and winner deployment

## Marketplace Performance
- Sales velocity tracking per platform
- Review velocity and sentiment tracking
- Buy Box win rate (Amazon) and competitive price monitoring

## Competitive Intelligence
- Competitor content change detection
- New competitor entry alerts
- Competitive positioning shift analysis and response queue

## Content Refresh Pipeline
- Underperforming page identification
- Evidence upgrade integration (new clinical data → content update)
- Seasonal and trend-responsive updates
- Refresh → compliance review → republish workflow

## Knowledge Transfer & Pattern Library
- Cross-brand winning patterns catalog
- Best-performing content structures and funnel designs
- Effective persuasion mechanism log

## Kill / Escalate Decision Dashboard
- 180-day performance assessment
- Dual-signal evaluation (SEO trajectory + marketplace performance)
- Diagnostic recommendations (fix vs. kill)
- Exit routing for killed brands`,
    badge: "soon",
    route: null,
  },
  {
    id: "compliance-risk",
    icon: "⚖️",
    title: "Compliance & Risk Mitigation",
    shortDesc:
      "Maintain compliance rulebooks, automate content pre-screening, manage review queues across firms, and coordinate incident response.",
    longDesc: `## Compliance Rulebook
- Master rulebook management (single standard for all firms)
- FTC advertising claim boundaries and FDA labeling requirements
- Structure/function claim templates (pre-approved)
- Red flag lexicon management
- Platform-specific rules (Amazon, Walmart, Google Shopping)
- International compliance modules with version control

## Automated Pre-Screening
- AI-powered content scan before human review
- Red flag detection and claim verification against approved claims
- Pre-screening results dashboard

## Compliance Review Management
- Queue management across 4+ compliance firms
- Assignment, load balancing, and status tracking
- Revision workflow (feedback → revision → re-review)
- Throughput analytics

## Platform Compliance
- Per-platform prohibited claim monitoring
- Listing compliance audits and policy change alerts

## Incident Response
- FDA warning letter and FTC inquiry response protocols
- Platform suspension response playbook
- Consumer complaint escalation and adverse event reporting
- Product recall procedures and litigation hold protocols

## Compliance Analytics
- Common rejection reasons tracking
- Compliance pass rate by content type
- Firm performance comparison and trend analysis`,
    badge: "soon",
    route: null,
  },
  {
    id: "exit-strategy",
    icon: "🚪",
    title: "Exit Strategy & Portfolio Management",
    shortDesc:
      "Track portfolio health, generate living deal sheets, manage brand selling platforms, monitor valuations, and execute exit strategies.",
    longDesc: `## Portfolio Dashboard
- All brands overview (revenue, traffic, stage, health score)
- Filterable by niche, revenue tier, launch date, performance status
- Resource allocation view and pipeline status

## Living Deal Sheets
- Auto-generated per brand from analytics data
- Revenue trailing 12 months, traffic source breakdown
- Email list size, review count/ratings, clinical data summary
- IP status, content inventory, growth trajectory
- One-click PDF export

## Brand Selling Platform Management
- Brand cards with key metrics
- Bundle builder by buyer investment capacity (Tier 1–4)
- Data room management per brand
- Inquiry and offer tracking
- External listing management (Flippa, Empire Flippers)

## Valuation Tracking
- Estimated sale price per brand (auto-calculated)
- Valuation driver analysis
- Exit-readiness scorecard and optimal exit timing signals

## Exit Execution
- Exit package preparation
- Buyer communication management
- Asset transfer documentation
- Post-sale transition support`,
    badge: "soon",
    route: null,
  },
  {
    id: "analytics-admin",
    icon: "📊",
    title: "Analytics & System Administration",
    shortDesc:
      "Central dashboards, AI prompt management, cross-brand analytics, user permissions, resource planning, and system health monitoring.",
    longDesc: `## Central Measurement Dashboard
- Cross-brand performance overview and aggregate metrics
- Top performers and underperformers
- Trend analysis across portfolio

## AI Performance & Prompt Evolution
- Prompt library management (versioned per stage)
- Performance correlation analysis (which prompts → which outcomes)
- Prompt update deployment and AI cost tracking
- Model performance comparison

## Cross-Brand Pattern Analytics
- Winning content structures identification
- Best-converting funnel designs and persuasion mechanisms
- Niche performance comparison
- Knowledge transfer recommendations

## User & Permissions Management
- Role-based access control
- Per-brand and per-stage permissions
- Activity logging (who did what, when)
- Approval workflow management

## Resource Capacity Planning
- Pipeline throughput tracking (products per week through each stage)
- Bottleneck identification
- Compliance firm and CRO capacity monitoring
- Launch scheduling optimization

## System Health
- API usage and costs
- Database performance
- Marketplace API connection status
- Email deliverability metrics
- Error and failure monitoring`,
    badge: "soon",
    route: null,
  },
];

const LS_KEY = "plos_workflow_cards";

function loadCards(): CardData[] {
  if (typeof window === "undefined") return DEFAULT_CARDS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<CardData>[];
      return DEFAULT_CARDS.map((def) => {
        const match = saved.find((s) => s.id === def.id);
        if (!match) return def;
        return {
          ...def,
          title: match.title || def.title,
          shortDesc: match.shortDesc || def.shortDesc,
          longDesc: match.longDesc || def.longDesc,
        };
      });
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_CARDS;
}

function saveCards(cards: CardData[]) {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify(
      cards.map(({ id, title, shortDesc, longDesc }) => ({
        id,
        title,
        shortDesc,
        longDesc,
      }))
    )
  );
}

/* ═══════════════════════════════════════════════════════════════
   LONG DESCRIPTION RENDERER
   ═══════════════════════════════════════════════════════════════ */

function LongDescRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("## ")) {
      elements.push(
        <div
          key={key++}
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#c9d1d9",
            marginTop: elements.length > 0 ? "10px" : "0",
            marginBottom: "4px",
          }}
        >
          {trimmed.slice(3)}
        </div>
      );
    } else if (trimmed.startsWith("- ")) {
      elements.push(
        <div
          key={key++}
          style={{
            fontSize: "11px",
            color: "#8b949e",
            lineHeight: 1.5,
            paddingLeft: "12px",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "2px",
              color: "#484f58",
            }}
          >
            •
          </span>
          {trimmed.slice(2)}
        </div>
      );
    } else {
      elements.push(
        <div
          key={key++}
          style={{ fontSize: "11px", color: "#8b949e", lineHeight: 1.5 }}
        >
          {trimmed}
        </div>
      );
    }
  }

  return <>{elements}</>;
}

/* ═══════════════════════════════════════════════════════════════
   EDIT MODAL
   ═══════════════════════════════════════════════════════════════ */

function EditModal({
  card,
  onSave,
  onClose,
}: {
  card: CardData;
  onSave: (title: string, shortDesc: string, longDesc: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [shortDesc, setShortDesc] = useState(card.shortDesc);
  const [longDesc, setLongDesc] = useState(card.longDesc);
  const backdropRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "12px",
          padding: "32px",
          width: "600px",
          maxWidth: "90vw",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,.7)",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#e6edf3",
            marginBottom: "24px",
          }}
        >
          Edit Card — {card.icon} {card.title}
        </h3>

        {/* Title */}
        <label style={labelStyle}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />

        {/* Short Description */}
        <label style={labelStyle}>Short Description</label>
        <textarea
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          rows={3}
          style={{ ...textareaStyle, marginBottom: "18px" }}
        />

        {/* Long Description */}
        <label style={labelStyle}>
          Long Description{" "}
          <span style={{ fontWeight: 400, color: "#484f58", letterSpacing: 0, textTransform: "none" }}>
            (use ## for headers, - for bullets)
          </span>
        </label>
        <textarea
          value={longDesc}
          onChange={(e) => setLongDesc(e.target.value)}
          rows={12}
          style={{ ...textareaStyle, marginBottom: "24px", fontFamily: "'IBM Plex Mono', 'IBM Plex Sans', monospace", fontSize: "12px" }}
        />

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={btnSecondary}>
            Cancel
          </button>
          <button
            onClick={() => onSave(title.trim(), shortDesc.trim(), longDesc.trim())}
            style={btnPrimary}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 600,
  color: "#8b949e",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: "6px",
  color: "#e6edf3",
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: "18px",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: "6px",
  color: "#e6edf3",
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: "13px",
  lineHeight: 1.5,
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 18px",
  background: "#1f6feb",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const btnSecondary: React.CSSProperties = {
  padding: "8px 18px",
  background: "transparent",
  border: "1px solid #30363d",
  borderRadius: "6px",
  color: "#8b949e",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'IBM Plex Sans', sans-serif",
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function PLOSLandingPage() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardData[]>(DEFAULT_CARDS);
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
      } else {
        setCards(loadCards());
        setLoading(false);
      }
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleCardClick(card: CardData) {
    if (card.badge === "active" && card.route) {
      router.push(card.route);
    } else {
      setToast(`${card.title} — coming soon`);
      setTimeout(() => setToast(""), 2000);
    }
  }

  function toggleExpand(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSaveCard(title: string, shortDesc: string, longDesc: string) {
    if (!editingCard) return;
    const updated = cards.map((c) =>
      c.id === editingCard.id
        ? {
            ...c,
            title: title || c.title,
            shortDesc: shortDesc || c.shortDesc,
            longDesc: longDesc || c.longDesc,
          }
        : c
    );
    setCards(updated);
    saveCards(updated);
    setEditingCard(null);
  }

  const expandAll = useCallback(() => {
    setExpandedCards(new Set(cards.map((c) => c.id)));
  }, [cards]);

  const collapseAll = useCallback(() => {
    setExpandedCards(new Set());
  }, []);

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
          color: "#8b949e",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  const isOverview = viewMode === "overview";
  const gridCols = isOverview ? "repeat(3, 1fr)" : "repeat(2, 1fr)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
        overflowY: "auto",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: isOverview ? "1100px" : "960px",
          margin: "0 auto",
          padding: "40px 32px 64px",
          transition: "max-width .3s ease",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button onClick={() => router.push("/dashboard")} style={btnSecondary}>
            ← Back
          </button>
          <button onClick={handleLogout} style={btnSecondary}>
            Sign Out
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>
            🚀
          </span>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#e6edf3", margin: "0 0 6px" }}>
            Product Launch Operating System
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "#8b949e",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Select a workflow to continue
          </p>
        </div>

        {/* View Toggle Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            padding: "0 2px",
          }}
        >
          {/* View mode toggle */}
          <div
            style={{
              display: "flex",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #30363d",
            }}
          >
            <button
              onClick={() => { setViewMode("overview"); collapseAll(); }}
              style={{
                padding: "7px 16px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "'IBM Plex Sans', sans-serif",
                border: "none",
                cursor: "pointer",
                background: isOverview ? "#1f6feb" : "#161b22",
                color: isOverview ? "#fff" : "#8b949e",
                transition: "all .2s",
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              style={{
                padding: "7px 16px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "'IBM Plex Sans', sans-serif",
                border: "none",
                borderLeft: "1px solid #30363d",
                cursor: "pointer",
                background: !isOverview ? "#1f6feb" : "#161b22",
                color: !isOverview ? "#fff" : "#8b949e",
                transition: "all .2s",
              }}
            >
              Detailed
            </button>
          </div>

          {/* Expand/Collapse all — only in Detailed view */}
          {!isOverview && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={expandAll} style={{ ...btnSecondary, padding: "5px 12px", fontSize: "11px" }}>
                Expand All
              </button>
              <button onClick={collapseAll} style={{ ...btnSecondary, padding: "5px 12px", fontSize: "11px" }}>
                Collapse All
              </button>
            </div>
          )}
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: "16px",
            alignItems: "start",
            transition: "all .3s ease",
          }}
        >
          {cards.map((card) => {
            const isHovered = hovered === card.id;
            const isActive = card.badge === "active";
            const isExpanded = expandedCards.has(card.id);

            return (
              <div
                key={card.id}
                onMouseEnter={() => setHovered(card.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleCardClick(card)}
                style={{
                  position: "relative",
                  background: isHovered && isActive ? "#1c2333" : "#161b22",
                  border: `1px solid ${isHovered && isActive ? "#1f6feb" : "#30363d"}`,
                  borderRadius: "10px",
                  padding: isOverview ? "20px 18px" : "24px 22px",
                  cursor: isActive ? "pointer" : "not-allowed",
                  opacity: isActive ? 1 : 0.55,
                  display: "flex",
                  flexDirection: "column",
                  gap: isOverview ? "8px" : "10px",
                  transition: "all .2s ease",
                  transform: isHovered && isActive ? "translateY(-2px)" : "none",
                  boxShadow: isHovered && isActive ? "0 8px 24px rgba(0,0,0,.35)" : "none",
                }}
              >
                {/* Edit button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCard(card);
                  }}
                  title="Edit card"
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "transparent",
                    border: "none",
                    color: "#484f58",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: "3px 5px",
                    borderRadius: "4px",
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity .2s",
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#e6edf3";
                    e.currentTarget.style.background = "rgba(255,255,255,.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#484f58";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  ✏️
                </button>

                {/* Title Row */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: isOverview ? "18px" : "22px", flexShrink: 0 }}>
                    {card.icon}
                  </span>
                  <span
                    style={{
                      fontSize: isOverview ? "12.5px" : "14px",
                      fontWeight: 700,
                      color: "#e6edf3",
                      lineHeight: 1.3,
                    }}
                  >
                    {card.title}
                  </span>
                  <span
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "2px 7px",
                      borderRadius: "3px",
                      marginLeft: "auto",
                      flexShrink: 0,
                      background: isActive ? "rgba(31,111,235,.2)" : "rgba(139,148,158,.15)",
                      color: isActive ? "#58a6ff" : "#8b949e",
                    }}
                  >
                    {isActive ? "Active" : "Coming Soon"}
                  </span>
                </div>

                {/* Short Description */}
                <div
                  style={{
                    fontSize: isOverview ? "10.5px" : "11.5px",
                    color: "#8b949e",
                    lineHeight: 1.55,
                  }}
                >
                  {card.shortDesc}
                </div>

                {/* Long Description — only in Detailed view */}
                {!isOverview && (
                  <>
                    {/* Expand/Collapse toggle */}
                    <button
                      onClick={(e) => toggleExpand(card.id, e)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "none",
                        border: "none",
                        color: "#58a6ff",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        padding: "2px 0",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          transition: "transform .2s ease",
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                          fontSize: "10px",
                        }}
                      >
                        ▶
                      </span>
                      {isExpanded ? "Hide details" : "Show details"}
                    </button>

                    {/* Collapsible long description */}
                    <div
                      style={{
                        overflow: "hidden",
                        maxHeight: isExpanded ? "2000px" : "0px",
                        opacity: isExpanded ? 1 : 0,
                        transition: "max-height .4s ease, opacity .3s ease",
                        borderTop: isExpanded ? "1px solid #21262d" : "1px solid transparent",
                        paddingTop: isExpanded ? "10px" : "0",
                        marginTop: isExpanded ? "2px" : "0",
                      }}
                    >
                      <LongDescRenderer text={card.longDesc} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "10px 20px",
            color: "#e6edf3",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(0,0,0,.5)",
            zIndex: 1000,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          {toast}
        </div>
      )}

      {/* Edit Modal */}
      {editingCard && (
        <EditModal
          card={editingCard}
          onSave={handleSaveCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
