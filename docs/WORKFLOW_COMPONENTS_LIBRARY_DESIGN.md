# WORKFLOW COMPONENTS LIBRARY — DESIGN DOC
## A bottom-up library of shared React components and hooks that workflows import and compose freely

**Created:** 2026-05-04 (`session_2026-05-04_workflow-tool-scaffold-design` — a session that began as scaffold-shell design and pivoted mid-session to components-library design after director directives surfaced that most workflows have entirely unique UIs)

**Audience:** Claude reading this at component-build sessions; future workflow design interviews referencing the components library at Q14; the director when reviewing decisions or revisiting a decision later.

**Status:** Designed — build not yet started. The first build session ships the components needed to unblock W#2's PLOS-side build (`useWorkflowContext()`, `<WorkflowTopbar>`, `<StatusBadge>`, `<DeliverablesArea>` with Resources sub-section, `<CompanionDownload>`, `<ResetWorkflowButton>` + `<ResetConfirmDialog>`); Phase 2 components are built when Phase 2 turn-on is scheduled.

**Doc shape — §A and §B (per `HANDOFF_PROTOCOL.md` Rule 18):**
- **§A — Initial Design.** Frozen at end of this design session. The authoritative initial spec.
- **§B — In-flight refinements.** Append-only. Every future build session that adjusts a decision drops a dated entry here. Never edit prior entries.

**Architectural pivot context (READ FIRST).** This doc was originally drafted as `WORKFLOW_SCAFFOLD_DESIGN.md` — a top-down "scaffold shell" that workflows would plug into. Mid-session, the director's directives ("most workflows will have a unique setup and UI after the user clicks into it" + "I feel like you are applying a blanket rule where one might not need to exist") surfaced that the scaffold-shell framing was over-prescribing structure where workflows actually differ. The architecture pivoted to a **bottom-up Shared Workflow Components Library**: a toolkit of reusable React components and hooks that workflows import and compose freely. There is no required shell. There is no scaffold-waiver concept. Workflows compose their own page layouts. The library captures the **shared chrome concerns** (workflow-status display, reset confirmation, deliverables UX, companion downloads, Phase 2 review/audit infrastructure); each workflow's **content area** is its own custom React component, designed specifically for that workflow's needs.

This pivot updates `PLATFORM_REQUIREMENTS.md §12` (rewritten in this same session) and `HANDOFF_PROTOCOL.md` Rule 20 (reframed in this same session). Project memory `project_scaffold_pivot_to_components_library.md` carries the architectural pivot across future sessions.

**Cross-references:**
- `PLATFORM_REQUIREMENTS.md §12` — the components library spec this doc fleshes out (REWRITTEN 2026-05-04)
- `PLATFORM_REQUIREMENTS.md §3` (concurrency), §4 (review cycle), §5 (audit), §6 (readiness), §7 (reset) — platform-wide rules the components integrate with
- `PLATFORM_REQUIREMENTS.md §12.6` (currently on `workflow-2-competition-scraping` branch only; will reframe + merge to `main` per deferred task #8) — three patterns surfaced by W#2 that the library implements: always-visible deliverables, custom React content components, external-client companion pattern
- `COMPETITION_SCRAPING_DESIGN.md §A.14` — W#2's components-library-fit answers (W#2 will be the FIRST workflow to import library components; deferred task #8 reframes from "Scaffold Fit" to "Components Library Fit")
- `KEYWORD_CLUSTERING_ACTIVE.md` — W#1 doesn't need to "retrofit" anything; it imports library components piecemeal if convenient (e.g., `<StatusBadge>` once Phase 2 review states wire up; `<ResetConfirmDialog>` once W#1 reset is built). No waiver required.
- `HANDOFF_PROTOCOL.md` Rule 20 — reframed 2026-05-04 to align with the components-library architecture
- Project memory `project_future_workflows_custom_ui.md` — the "custom-is-norm" directive that drove §3's content-area framing
- Project memory `feedback_avoid_over_prescribing.md` — the "structural decisions frozen, signature details provisional" lens that drove §3.10's audit-helper framing

---

## §A — INITIAL DESIGN (frozen at end of session_2026-05-04_workflow-tool-scaffold-design)

### §1. Purpose and scope

#### §1.1 What the components library is

A library of reusable React components and hooks that PLOS workflow tools (workflow #2 through workflow #14) import to handle **shared chrome concerns** — workflow-status display, admin reset UX, file upload/download, topbar with back-to-Project navigation, companion-artifact downloads, Phase 2 review controls, Phase 2 audit emission. The library does NOT impose a layout. Workflows compose their own pages by importing the components they need and arranging them however they want.

The actual **content area** inside the workflow page — the multi-table viewer for W#2, the canvas for W#1, whatever each future workflow needs — is the workflow's own custom React component, NOT part of the library.

**Posture (canonical, captured in project memory `project_future_workflows_custom_ui.md` 2026-05-04):** the library captures consistency in the chrome, NOT consistency in the content. Most workflows #3-#14 will have entirely unique UIs once the user clicks in. The library should not push toward uniformity of content; only of chrome.

#### §1.2 Why a library and not a shell

A top-down required shell would force a single layout on every workflow. That fits if workflows are mostly-similar (e.g., "form + file upload + review"); it doesn't fit if workflows are mostly-unique. The director's lived experience is the latter — `PLATFORM_REQUIREMENTS.md §12.1`'s earlier "most remaining workflows are genuinely simpler" framing was inaccurate. A bottom-up library captures the shared-value concerns (centralized status component per `§4.6`; shared reset confirmation per `§7`; consistent deliverables UX) without imposing structural uniformity. Workflows compose freely.

#### §1.3 Why a library is not just "shared components" handed out informally

The library is documented (this doc), versioned, and treated as an architectural commitment per `PLATFORM_REQUIREMENTS.md §12`. New components are added deliberately, not informally. Each component has a clear contract (props, behaviors, Phase 1/Phase 2 differences). Adding a new shared component is an explicit decision, not a side-effect of "I happened to need this in workflow #3."

This formal posture is what makes platform-wide changes (e.g., adding Phase 2 review-cycle states to the status badge) a one-place update instead of a 13-workflow update. Without the formal library, "shared components" drifts into bespoke-per-workflow over time.

#### §1.4 What's NOT in scope for this design

- **No code.** This session produces decisions only. Build sessions follow.
- **No `prisma/schema.prisma` edits.** W#2 has the schema-change-in-flight flag set "Yes" as of 2026-05-04; today's design-only session does not touch schema. Schema work for any component (mostly Phase 2 — `Assignment.reviewState`, `AuditEvent` table) is deferred to the build session for that component.
- **No retrofit of W#1 (Keyword Clustering).** W#1 may adopt library components piecemeal if convenient (e.g., `<StatusBadge>`, `<ResetConfirmDialog>`) — but it doesn't have to. There's no shell to retrofit into; there's no waiver to claim.
- **No specific styling / brand palette work.** Visual design conventions (color, spacing, typography) inherit from the existing PLOS app shell. Component-specific styling is in scope only where a component's behavior depends on it (e.g., the status badge's color states).

### §2. Audience and user model

Per `PLATFORM_REQUIREMENTS.md §2`, two user types interact with workflow pages:

- **Admin (Phase 1 — director only; Phase 3 — also support staff).** Sees every component a workflow renders. Has access to admin-only controls (reset button, review controls). In Phase 1 admin-solo mode, admin is also the only worker — so worker-facing controls are visible to admin but the review cycle is short-circuited (admin self-review per `PLATFORM_REQUIREMENTS.md §4.4`).

- **Worker (Phase 2 onward).** Sees the components a workflow renders for their role on their assigned (Project, sub-scope). Does NOT see admin-only components (reset, admin review). Sees the worker-facing completion button.

Each component below documents which roles see it. Components that are admin-only check `userRole === 'admin'` internally — workflows don't have to gate them at the call site.

**Phasing.** Phase 1 (current) is admin-solo. Worker-facing and review-cycle components are designed now and built when Phase 2 turn-on is scheduled. Build order in §8.

---

### §3. The components

The library's initial set. Listed in dependency-ish order (hooks first; chrome components next; phase-2-only last). New components are added additively as workflows surface concrete needs (per §1.3).

#### §3.1 `useWorkflowContext()` hook

**What it is.** A React hook every workflow page calls at the top to get auth + project + role + workflow-status loaded. Replaces ~40 lines of boilerplate that today's W#1 `page.tsx` has inline (Supabase session check, redirect-if-not-logged-in, fetch the Project's summary, fetch the user's role, fetch the workflow status).

**Return shape (provisional — finalized at first build session per the over-prescribing-avoidance lens):**

```
{
  userId: string                  // current logged-in user's id; null triggers redirect to login
  userRole: 'admin' | 'worker'    // Phase 1 = always admin; Phase 2 introduces workers
  project: { id, name, slug }     // current Project summary
  workflowSlug: string            // current workflow's slug (for components that need it)
  workflowStatus: 'inactive' | 'active' | 'completed'
                                  // Phase 2 also: 'submitted-for-review' | 'revision-requested'
  workflowAssignment: Assignment | null
                                  // Phase 2 only; Phase 1 = always null
  readyToStart: boolean           // true if upstream-readiness rule (§6) is satisfied for this Project
  requestStatusChange: (newStatus) => Promise<void>
                                  // callback to flip workflow status; validates transitions + persists
  emitAuditEvent: (eventType, payload) => Promise<void>
                                  // Phase 2 only; opt-in; absent for workflows that didn't declare audit
}
```

**Provisional zone:** the field set above is the design-time sketch. Specific field names + types finalize at the first build session after reading the relevant Next.js docs in `node_modules/next/dist/docs/` (per `AGENTS.md` directive — this is NOT the Next.js the model knows from training data) and after the first concrete component-build experience surfaces edge cases.

**Used by:** every workflow page that imports any other library component, plus the workflow's own custom content component.

#### §3.2 `<WorkflowTopbar>`

**What it is.** A horizontal band rendered at the top of a workflow page. Three regions left-to-right: workflow title + breadcrumb on the left (clickable back-to-Project link); empty center (reserved for future workflow-specific quick-action area); admin-only reset button on the right.

**Props (provisional):**
- `title: string` — workflow title (e.g., "Keyword Clustering")
- `projectName: string` — for the breadcrumb (typically passed from `useWorkflowContext().project.name`)
- `onReset: () => void` — callback for the admin reset button (typically wired through `<ResetWorkflowButton>` — see §3.6)
- `userRole: 'admin' | 'worker'` — controls reset-button visibility

**Behavior.** Renders the title and breadcrumb for everyone. Renders the admin reset button only when `userRole === 'admin'`. Clicking the breadcrumb navigates to the Project page. Clicking reset triggers the supplied `onReset` callback.

**Why status badge does NOT live in the topbar.** Per Cluster 1 Decision 1A, the workflow-status indicator is its own component (`<StatusBadge>`, §3.3) rendered separately by the workflow's page composition. This gives Phase 2's review-cycle states the visual room they'll need without redesigning the topbar.

**Used by:** workflows that want the standard topbar pattern. A workflow with an unusual chrome (e.g., W#1's full-screen canvas mode) may skip `<WorkflowTopbar>` and render its own.

#### §3.3 `<StatusBadge>`

**What it is.** A small colored badge with a label that displays the current workflow status. Same component used on workflow pages AND on the Projects-page workflow cards (per `PLATFORM_REQUIREMENTS.md §4.6` design implication: "tool UIs should display workflow status via a centralized component that can expand to show more states later without per-tool rewrites").

**State set (Decision 1B):**

| State | Color | Label | Phase |
|---|---|---|---|
| `inactive` | gray | "Not started" | Phase 1 + Phase 2 |
| `active` | yellow | "In progress" | Phase 1 + Phase 2 |
| `completed` | green | "Completed" | Phase 1 + Phase 2 |
| `submitted-for-review` | blue | "Awaiting review" | Phase 2 only |
| `revision-requested` | orange | "Revisions requested" | Phase 2 only |

The component is built knowing all 5 states from day one. Phase 1 only ever sees the first three; the last two are dormant code paths until Phase 2 wires the worker/admin review controls.

**Source of truth.** `ProjectWorkflow.status` for the workflow-level "where are we" answer. Phase 2 may add `Assignment.reviewState` per `PLATFORM_REQUIREMENTS.md §4.5` for per-assignment review state — `<StatusBadge>` reads from whichever the workflow tells it to via prop.

**Re-render behavior.** Phase 1: on page load only (admin-solo, no concurrent users). Phase 2: re-rendered when the underlying status field changes server-side — push-vs-poll pattern decision deferred to the build session that wires the worker-facing controls.

**Used by:** every workflow that wants its status displayed. Also used by the Projects page on each workflow card.

#### §3.4 `<DeliverablesArea>`

**What it is.** A bordered region of the workflow page where files relevant to this workflow live. Two optional sub-sections:

| Sub-section | What it shows | Same across all Projects? |
|---|---|---|
| **Resources** | Files attached to the workflow itself, not to any specific Project. Examples: W#2's downloadable Chrome extension; "Detailed User Guide" PDF; template Excel sheets. **This is `PLATFORM_REQUIREMENTS.md §12.6` pattern #1 — always-visible deliverables.** | Yes — same files for every Project running this workflow. |
| **Project deliverables** | Files generated, uploaded, or produced specifically for THIS Project's run of this workflow. Examples: a competitor-research PDF for Project X; an exported W#2-captures dataset. | No — different per Project. |

Workflow declares which sub-sections it uses (one, the other, or both). If neither is declared, the component renders nothing (workflows without files don't import it at all).

**Props (provisional):**
- `resources?: ResourceItem[]` — array of always-visible items if any
- `projectDeliverables?: { bucketName, allowUpload, allowDelete }` — config for the per-Project sub-section if any
- `userRole: 'admin' | 'worker'` — for permission gating

**File source.** Files in either sub-section are stored in Supabase storage using the same signed-URL upload pattern W#2 settled on (`COMPETITION_SCRAPING_STACK_DECISIONS.md` Q3). Each workflow declares its own bucket name(s); the component provides the upload + download wiring against whatever the workflow declares.

**Permissions (provisional sketch — finalized per workflow at design time per `PLATFORM_REQUIREMENTS.md §2`):**
- Phase 1 admin-solo: admin can upload, download, delete in either sub-section.
- Phase 2: per-workflow declaration on the "Project deliverables" sub-section — typically worker can upload + download for their assigned (Project, sub-scope), admin can do everything; "Resources" sub-section is admin-managed regardless.

**Used by:** workflows that have files to surface — most workflows, probably.

#### §3.5 `<CompanionDownload>`

**What it is.** A UI block that surfaces a downloadable companion artifact (browser extension, mobile app, desktop tool) the user installs and runs separately from the PLOS website. **This is `PLATFORM_REQUIREMENTS.md §12.6` pattern #3 — external-client companion pattern.** W#2's Chrome extension is the FIRST exerciser; future workflows may follow.

**Posture.** Chrome around the companion, not the companion itself. The component says nothing about how the companion is built, what framework it uses, how it authenticates to PLOS, or how it talks to the API — those are the workflow's own concerns.

**Placement (Decision 4A).** `<CompanionDownload>` is rendered as one item INSIDE the `<DeliverablesArea>`'s Resources sub-section, alongside user guides and templates. Not a standalone region in Phase 1. (Future workflows that surface concrete need for richer treatment — version display, connection status, dedicated region — extend the library additively then.)

**Props — STRUCTURAL DECISION (frozen) (Decision 4B):**
- `label: string` — button text, e.g., "Download Extension"
- `url: string` — where the companion lives (ZIP, installer, Chrome Web Store listing, etc.)
- `description: string` — one-liner under the button explaining what it is

**Richer features — PROVISIONAL (NOT FROZEN).** Per `feedback_avoid_over_prescribing.md`. Anticipated for some future workflow but NOT prescribed now: version display, connection-status indicator, type-specific UI (Chrome Web Store badge, App Store badge), update prompts, dedicated region. Add additively when a workflow concretely needs them.

**Used by:** workflows that ship a companion — W#2 first; future browser-extension / mobile-app / desktop-app workflows.

#### §3.6 `<ResetWorkflowButton>` + `<ResetConfirmDialog>`

**What they are.** A pair of components implementing the admin reset UX per `PLATFORM_REQUIREMENTS.md §7`.

**`<ResetWorkflowButton>`.** Admin-only button (renders nothing for workers). Click opens `<ResetConfirmDialog>`. Typically rendered inside `<WorkflowTopbar>` via its `onReset` prop, but workflows can place it anywhere.

**`<ResetConfirmDialog>`.** The "type the project name to confirm — this will permanently delete all <workflow> data for Project X" dialog. Standardized across all workflows that use it (consistency on a destructive operation is high-value chrome). The dialog calls back to the workflow's own `resetWorkflowData(projectId)` function — the actual data deletion is per-workflow per `PLATFORM_REQUIREMENTS.md §7.3`; the confirmation UX is shared.

**Props (provisional):**
- `projectName: string` — for the type-to-confirm match
- `workflowName: string` — for the dialog copy ("delete all <workflowName> data for Project X")
- `onConfirm: () => Promise<void>` — workflow's `resetWorkflowData(projectId)` wired here

**Used by:** every workflow with a reset action (per `§7.1`, every workflow needs reset). W#1 will adopt this when its reset is built (currently a known gap on the W#1 roadmap per `§7.5`).

#### §3.7 `<NotReadyBanner>`

**What it is.** A banner rendered at the top of the workflow page when the workflow's upstream-readiness rule (per `PLATFORM_REQUIREMENTS.md §6`) is NOT satisfied for the current Project. Explains what's missing and links to the upstream workflow. (Decision 1C in Cluster 1 frames the not-ready handling.)

**Props (provisional):**
- `missingDependency: { workflowName, status, linkUrl }` — what upstream workflow is needed and where to go
- `customExplanation?: string` — workflow can override the default message

**Behavior.** Not-ready handling is consistent across the platform via this component. Workflows include it conditionally on `useWorkflowContext().readyToStart === false`. When `readyToStart === true`, the banner does not render. Per `PLATFORM_REQUIREMENTS.md §6.2` ("not an entry gate"), the banner does NOT block the page — admin can still look around the workflow's layout while readiness is pending; "start work" controls inside the workflow's content component should disable themselves when `readyToStart === false`.

**Used by:** workflows that declare upstream-readiness rules (per `§6.5`). Workflows with no upstream dependencies (W#1, W#2) don't import it.

#### §3.8 `<WorkerCompletionButton>` (Phase 1 + Phase 2)

**What it is.** The button the user clicks to advance the workflow status forward. Phase 1: flips `active → completed`. Phase 2 with `reviewCycle: 'standard'`: flips `active → submitted-for-review`. Phase 2 with `reviewCycle: 'skip'`: flips `active → completed` directly (no review).

**Posture.** Per Decision 3B, completion is **always button-driven**. There's no data-driven completion mode at the library level. State transitions are explicit user actions — unambiguous and surprise-free for admin debugging. Workflows that have richer per-sub-scope completion semantics (e.g., W#2's per-platform "I'm done with [platform]" buttons) handle those internally inside their custom content component; the library-level button is for the overall workflow-level completion.

**Required prop — `reviewCycle: 'standard' | 'skip'` (Decision 3A).** Each workflow declares this as part of its design (per `HANDOFF_PROTOCOL.md` Rule 18 Q9). The component renders the appropriate label + transition behavior:
- `'standard'`: button label defaults to "I'm done — please review"; click flips status to `submitted-for-review` (in Phase 2; Phase 1 always flips to `completed` per `§4.4`).
- `'skip'`: button label defaults to "Mark complete"; click flips status to `completed` directly.

**Optional prop — `label: string`** — workflow can override the default label (e.g., W#2 uses workflow-specific phrasing).

**Disabled state.** When `useWorkflowContext().readyToStart === false`, the button renders disabled (the `<NotReadyBanner>` already explains why; the disabled button is visual reinforcement).

**Used by:** every workflow that uses the components-library status flow.

#### §3.9 `<AdminReviewControls>` (Phase 2 only)

**What it is.** Admin-facing review controls that render only when (1) Phase 2 is live; (2) the workflow declared `reviewCycle: 'standard'`; (3) current status is `'submitted-for-review'` or `'revision-requested'`; (4) `userRole === 'admin'`. If any of those four is false, the component renders nothing.

**Behavior.**
- **"Accept"** button — flips status to `completed`.
- **"Request revisions"** button — flips status to `revision-requested`. Requires admin to write notes (rich-text editor reuses the existing Admin Notes editor pattern per `PLATFORM_REQUIREMENTS.md §4.2`); notes are surfaced to the worker on their next view.

**Re-opening completed workflows.** A separate `<ReopenWorkflowButton>` (admin-only, renders when `workflowStatus === 'completed'`) flips status back to `active` per `§4.3`. Available for all workflows regardless of `reviewCycle` declaration. (May be a sub-component of `<AdminReviewControls>` or standalone — finalized at Phase 2 build time.)

**Used by:** Phase 2 workflows with `reviewCycle: 'standard'`. W#2 doesn't import it (W#2 declared `'skip'`).

#### §3.10 `useEmitAuditEvent()` hook (Phase 2 only — opt-in)

**What it is — STRUCTURAL DECISION (frozen).** Per `PLATFORM_REQUIREMENTS.md §5`, audit-trail is opt-in per workflow. Workflows that declared audit-trail requirements (Q10 of the design interview) import this hook + call it when interesting things happen. Workflows that did not declare audit-trail requirements do not import it (clean tree-shaking — workflows can't accidentally emit audit events they shouldn't).

**Helper signature + AuditEvent schema — PROVISIONAL (NOT FROZEN — see note below).**

The current sketch — to be finalized when the FIRST workflow declaring audit requirements brings concrete needs:

```
useEmitAuditEvent() returns:
  emitAuditEvent: (eventType: string, payload: object) => Promise<void>

AuditEvent table (sketch — per PLATFORM_REQUIREMENTS.md §5.5):
  id, workflowType, projectId, userId, timestamp, eventType, payload (JSON)
  indexes: (projectId, workflowType), (userId, timestamp)
```

**Why provisional.** Captured 2026-05-04 director directive (cross-reference `feedback_avoid_over_prescribing.md`): no workflow has yet declared concrete audit requirements; prescribing the exact field set + helper signature now risks forcing the first workflow that actually needs audit into a shape that doesn't match its real needs. Structural decisions above (opt-in via hook import; shared `AuditEvent` table; per-workflow event vocabulary) are frozen. Signature details + schema are PROVISIONAL — they finalize at the build session for the first workflow declaring audit-trail requirements. That session will:
1. Surface the concrete audit requirements from that workflow.
2. Compare against the provisional sketch.
3. Adjust signature/schema as needed before building.
4. Update this section with the FROZEN signature + schema once that build session ships.

**Per-workflow event vocabulary.** Each workflow declares its own `eventType` strings and `payload` shapes inside its own design doc — the library does NOT enforce a centralized enum across workflows. Adding a new workflow with audit requirements is a self-contained declaration, not an edit to library-shared code.

---

### §4. The three patterns from `PLATFORM_REQUIREMENTS.md §12.6` (NEW patterns surfaced by W#2)

`PLATFORM_REQUIREMENTS.md §12.6` (added by the W#2 first-session Platform-Truths Audit, currently on the W#2 branch) names three patterns that the components library must support. Each is captured below by cross-reference to its component(s) above.

(NOTE: §12.6 itself currently lives only on `workflow-2-competition-scraping`. When that branch merges to `main`, §12.6's framing must be reframed from "scaffold extension-points" to "shared component patterns" — deferred task #8 covers it. The patterns themselves are unchanged; only the framing is reframed.)

#### §4.1 Pattern #1 — Always-visible deliverables

Implemented by `<DeliverablesArea>`'s "Resources" sub-section (§3.4 above). W#2 will be the FIRST workflow to use it (extension files + user guide). Future workflows that need always-available downloads (templates, reference PDFs, companion installers) declare the "Resources" sub-section and populate it.

#### §4.2 Pattern #2 — Custom React content components

The library deliberately provides NO content-area component. Each workflow's content area is its own custom React component, designed specifically for that workflow's needs. The components library captures the chrome (everything in §3 above), not the content. This is the canonical implementation of the custom-is-norm posture (project memory `project_future_workflows_custom_ui.md`).

W#2's `<CompetitionScrapingViewer />` (multi-table viewer with platform/URL/category navigation) is the FIRST custom content component. W#1's existing canvas + dual-state UI is implicitly another (it predates this design but conforms — W#1 just doesn't import most library components). Workflows #3-#14 are expected to follow.

#### §4.3 Pattern #3 — External-client companion pattern

Implemented by `<CompanionDownload>` (§3.5 above), placed inside `<DeliverablesArea>`'s Resources sub-section. W#2's Chrome extension is the FIRST instance.

---

### §5. Workflow declarations + composition

What every workflow that uses the library declares in its own design doc, and what the workflow's page does with those declarations.

**Required declarations:**
- `name`, `slug`, `icon` — workflow card metadata
- `readinessRule` — per `PLATFORM_REQUIREMENTS.md §6.5` (or null if always-ready)
- `reviewCycle: 'standard' | 'skip'` — for `<WorkerCompletionButton>` + `<AdminReviewControls>` (§3.8 + §3.9)
- `resetWorkflowData(projectId)` — function `<ResetConfirmDialog>` calls to perform the reset (§3.6); per `PLATFORM_REQUIREMENTS.md §7.3`

**Optional declarations (if the workflow uses the corresponding features):**
- `companion: { label, url, description }` — for `<CompanionDownload>` (§3.5 / §4.3 if the workflow ships a companion artifact)
- `resources: ResourceItem[]` — for `<DeliverablesArea>`'s Resources sub-section (§3.4 / §4.1 if the workflow has always-visible files)
- `projectDeliverablesBucket: string` — for `<DeliverablesArea>`'s Project deliverables sub-section
- `auditEventTypes: AuditEventTypeDecl[]` — for `useEmitAuditEvent()` (§3.10 / Phase 2 if the workflow declared audit-trail requirements)
- `concurrencyStrategy` — per `PLATFORM_REQUIREMENTS.md §3` (W#2's sub-scope dimension is captured here)

**The workflow then composes its own page.** A workflow's `page.tsx` looks roughly like:

```tsx
'use client';
import { useWorkflowContext } from '@/lib/workflow-components';
import {
  WorkflowTopbar, StatusBadge, DeliverablesArea,
  ResetWorkflowButton, NotReadyBanner, WorkerCompletionButton,
} from '@/lib/workflow-components';
import MyCustomContent from './components/MyCustomContent';

export default function MyWorkflowPage() {
  const ctx = useWorkflowContext();
  if (!ctx.userId) return null; // hook handles redirect

  return (
    <div>
      <WorkflowTopbar
        title="My Workflow"
        projectName={ctx.project.name}
        userRole={ctx.userRole}
        onReset={...}
      />
      <StatusBadge status={ctx.workflowStatus} />
      {!ctx.readyToStart && <NotReadyBanner missingDependency={...} />}
      <DeliverablesArea resources={[...]} userRole={ctx.userRole} />
      <MyCustomContent ctx={ctx} />  {/* workflow's own UI — entirely custom */}
      <WorkerCompletionButton reviewCycle="skip" disabled={!ctx.readyToStart} />
    </div>
  );
}
```

This is illustrative, not prescriptive — the workflow can arrange the components in any order, omit any it doesn't need, and add its own structure around them.

---

### §6. (Removed — there is no scaffold to waive)

The earlier scaffold-shell framing included a "special-case escape hatch — when a workflow does NOT plug into the scaffold," with W#1 as the canonical waived example. The components-library architecture has no shell to plug into and no waiver concept. W#1 is not "waived" — it just doesn't import the library components it doesn't use. W#1 may adopt library components piecemeal (e.g., `<StatusBadge>` once Phase 2 review states wire up; `<ResetConfirmDialog>` once W#1 reset is built per the `§7.5` roadmap gap) — adoption is opt-in, additive, and decided at the time of W#1's relevant build session.

This subsection is preserved as a numbered placeholder for reference continuity with the section list in early drafts of this doc; the substance is replaced by the framing above.

---

### §7. Cross-cutting platform integration

How the library integrates with `PLATFORM_REQUIREMENTS.md` §3 / §4 / §5 / §6 / §7.

| Platform spec | Library responsibility | Workflow responsibility |
|---|---|---|
| §3 Concurrency | None at library level for Phase 1. Phase 2: `useWorkflowContext()` returns `workflowAssignment` (sub-scope-aware). Presence/attribution UI marked PROVISIONAL — added when a workflow concretely needs it. | Each workflow declares its concurrency strategy (per `§3`) and sub-scope dimension if any (per `§2.2.1`). |
| §4 Review cycle | `<StatusBadge>`, `<WorkerCompletionButton>`, `<AdminReviewControls>` cover the standard review cycle. `reviewCycle: 'standard' \| 'skip'` declaration drives behavior. | Each workflow declares `reviewCycle` and review-cycle deviations if any (per `§4.6`). |
| §5 Audit | `useEmitAuditEvent()` (Phase 2, opt-in). Structural decisions frozen; signature provisional. | Each workflow that declared audit declares its event vocabulary in its own design doc. |
| §6 Readiness | `<NotReadyBanner>`. `useWorkflowContext().readyToStart` exposes the boolean. | Each workflow declares its readiness rule (per `§6.5`). |
| §7 Reset | `<ResetWorkflowButton>` + `<ResetConfirmDialog>` cover the admin UX with the type-to-confirm pattern. | Each workflow implements its own `resetWorkflowData(projectId)` (per `§7.3`) — the data-deletion logic is workflow-specific. |

---

### §8. Phasing

What ships in Phase 1 vs. wired-but-dormant vs. deferred to Phase 2 build sessions.

**Phase 1 build (first build session — unblocks W#2's PLOS-side build):**
- `useWorkflowContext()` hook — Phase 1 fields populated; Phase 2 fields wired but null/dormant
- `<WorkflowTopbar>`
- `<StatusBadge>` — knows all 5 states; Phase 1 only ever transitions among the first 3
- `<DeliverablesArea>` — both sub-sections supported
- `<CompanionDownload>` — built since W#2 needs it
- `<ResetWorkflowButton>` + `<ResetConfirmDialog>`
- `<NotReadyBanner>` — built since future workflows will need it (W#2 doesn't but W#5+ will)
- `<WorkerCompletionButton>` — Phase 1 always flips to `completed`; the `'standard'` review-cycle path is wired but dormant in Phase 1 per `§4.4`

**Phase 2 build (separate build session, scheduled when Phase 2 turn-on is needed):**
- `<AdminReviewControls>` — review cycle accept/revise + notes
- `useEmitAuditEvent()` hook — schema + helper signature finalized at this build session per the over-prescribing-avoidance lens
- Phase 2 fields in `useWorkflowContext()` populated (workflowAssignment, sub-scope-aware data)
- Push-vs-poll re-render strategy for `<StatusBadge>` finalized
- Concurrency presence/attribution UI added if any workflow has surfaced concrete need by then

**Always provisional, never frozen:**
- The exact prop shapes of every component (build sessions read the relevant Next.js docs in `node_modules/next/dist/docs/` and finalize at build time per `AGENTS.md`)
- Phase 2-specific signature details (audit, presence, sub-scope assignment) until concrete needs surface

---

### §9. Build plan

Per Decision 5B in Cluster 5: **two build sessions total** — Session 1 ships the Phase 1 components above; Session 2 ships the Phase 2 components when Phase 2 turn-on is scheduled (likely months away).

**Session 1 — Phase 1 components (first build session — unblocks W#2):**
- Read `node_modules/next/dist/docs/` relevant guides per `AGENTS.md`
- Read existing W#1 `page.tsx` to confirm the `useWorkflowContext()` extraction is shape-compatible
- Build hooks first (`useWorkflowContext()`)
- Build chrome components in dependency order: `<StatusBadge>`, `<NotReadyBanner>`, `<ResetConfirmDialog>`, `<ResetWorkflowButton>`, `<WorkflowTopbar>`, `<DeliverablesArea>`, `<CompanionDownload>`, `<WorkerCompletionButton>` (Phase 1 path)
- Each component built with minimal, working props; provisional shapes acknowledged in code comments
- One end-to-end smoke check using a stub workflow page before W#2 PLOS build begins

**Session 2 — Phase 2 components (when Phase 2 turn-on is scheduled):**
- Surface the first workflow concretely needing each Phase 2 component
- Finalize provisional signatures based on real workflow demand (per `feedback_avoid_over_prescribing.md`)
- Build `<AdminReviewControls>` + `useEmitAuditEvent()` + Phase 2 augmentations to `<StatusBadge>` + `useWorkflowContext()`
- Schema work for `Assignment.reviewState` + `AuditEvent` table happens in this session (Phase 2 schema-change)

**Estimated session count to gate completion:** 2 sessions (one Phase 1, one Phase 2). Phase 1 session is the gate-blocker for W#2's PLOS-side build; Phase 2 session is far in the future.

---

## §B — IN-FLIGHT REFINEMENTS (append-only)

Every future session that touches the components library appends a dated entry here. Never edit prior entries. Format per entry:

```
#### YYYY-MM-DD — session_id — short headline
**What the director said / what surfaced:** ...
**Alternatives considered:** ...
**Decision:** ...
```

#### 2026-05-05-c — session_2026-05-05-c_components-library-phase-1-build — Phase-1 build SHIPPED

**What surfaced during build (decisions made + rationale):**

1. **File layout choice — `src/lib/workflow-components/` (kebab-case files, .tsx for JSX, .ts for pure logic).** The design doc §5's example used `@/lib/workflow-components` as the import path; the existing `src/lib/` convention is kebab-case files; React conventionally uses PascalCase. Resolution: kebab-case for file names (matches `src/lib/` convention); PascalCase preserved for the exported component identifiers; `.tsx` for files containing JSX, `.ts` for pure-logic files. Pure-logic helpers extracted to `.ts` files (`status-badge-palette.ts`, `reset-confirm-helpers.ts`) so they can be unit-tested via `node --test --experimental-strip-types` (which can't process `.tsx` files). Decision frozen for the library; future component additions follow the same convention.

2. **Styling convention choice — inline styles, dark-theme palette matching the App Shell** (`/projects`, `/dashboard`, `/plos`, etc.). Per §1.4 "Visual design conventions inherit from the existing PLOS app shell." The shell uses inline-style React with hex colors (`#e6edf3`, `#8b949e`, `#161b22`, `#30363d`, `#0d1117`, `#3fb950`, `#1f6feb`, etc.) and `'IBM Plex Sans'` font; W#1's keyword-clustering page uses Tailwind for its content area. Library matches the shell convention since library components are shell concerns, not content concerns.

3. **`<StatusBadge>` palette finalized.** Five-state palette table at `status-badge-palette.ts`. The `active` state gets YELLOW (`#d4a72c`) with label "In progress" per design doc §3.3 Decision 1B. Drift surfaced: the existing inline `<StatusBadge>` at `src/app/projects/[projectId]/page.tsx` uses BLUE/"Active" — captured as a Phase-1 polish-bundle follow-up in `ROADMAP.md` to swap the Projects page to the shared component for visual consistency.

4. **`useWorkflowContext()` return shape finalized for Phase 1.** Provisional sketch in §3.1 added `loading: boolean` + `error: string | null` so consuming pages can render their own loading/error UI without the hook being opinionated. Phase 1 fields populated; Phase 2 fields wired but null/dormant (`workflowAssignment: null`; `userRole: 'admin'` always; `emitAuditEvent` is a no-op stub). Hook accepts `readinessRule?: () => boolean` arg so workflows declare upstream-readiness inline rather than the hook computing it from a centralized resolver (which doesn't exist in Phase 1).

5. **`<ResetConfirmDialog>` mount/unmount pattern.** The dialog body is a separate `ResetConfirmDialogBody` sub-component that only mounts when `open === true`. This gives "fresh state every open" without resorting to `setState` inside a `useEffect`, which trips the `react-hooks/set-state-in-effect` lint rule (caught + fixed during initial build).

6. **Smoke-test page built at `/components-smoke-test`.** Per §9 Session 1 plan. Initial draft used `/__components-smoke-test` (leading `__`); Next.js App Router treats folders prefixed with `_` as private (opt-out of routing), so the route didn't register. Renamed to `/components-smoke-test` (no leading underscore). Captured as INFORMATIONAL CORRECTIONS_LOG entry on App Router private-folder convention.

**What did NOT change vs. §A spec:** the 9-component scope, the prop shapes (frozen-as-provisional in §A, finalized at code-time per §8), the file-layout decision deferred to build-time, and the "no W#1 retrofit" stance. Every component shipped matches the §A intent; the only material additions to the public API were `loading` + `error` on `useWorkflowContext()` (Phase 1 adds — supports the migration from W#1's existing inline pattern) and the `LOADING_PALETTE` placeholder on `<StatusBadge>` (so consuming pages can render the badge before the hook resolves without a layout flash).

**Verification scoreboard:** 349/349 tests pass (was 336; +13 new — 7 status-badge palette tests + 6 reset-confirm-helper tests); tsc clean; build clean (33 routes; was 32 — added smoke-test); lint at exact baseline parity (16e/40w; zero new errors or warnings).

**Files shipped:**
- `src/lib/workflow-components/types.ts` — shared types (WorkflowStatus, UserRole, WorkflowContextValue, etc.)
- `src/lib/workflow-components/use-workflow-context.tsx` — auth + project + role + workflow-status hook
- `src/lib/workflow-components/status-badge.tsx` — five-state badge component
- `src/lib/workflow-components/status-badge-palette.ts` — pure-logic palette table (testable)
- `src/lib/workflow-components/status-badge.test.ts` — 7 tests
- `src/lib/workflow-components/not-ready-banner.tsx` — upstream-readiness banner
- `src/lib/workflow-components/reset-confirm-dialog.tsx` — type-the-project-name destructive confirm
- `src/lib/workflow-components/reset-confirm-helpers.ts` — pure match logic (testable)
- `src/lib/workflow-components/reset-confirm-dialog.test.ts` — 6 tests
- `src/lib/workflow-components/reset-workflow-button.tsx` — admin-only reset entry point
- `src/lib/workflow-components/workflow-topbar.tsx` — title + breadcrumb + admin slot
- `src/lib/workflow-components/deliverables-area.tsx` — Resources + Project deliverables sub-sections
- `src/lib/workflow-components/companion-download.tsx` — external-client companion download
- `src/lib/workflow-components/worker-completion-button.tsx` — Phase 1 + Phase 2 button-driven completion
- `src/lib/workflow-components/index.ts` — barrel export
- `src/app/components-smoke-test/page.tsx` — smoke-test page rendering all 9 components with fake props

**Next session:** when W#2 returns to its branch for the PLOS-side build, Appendix A's W#2 PLOS-side build template applies — W#2's page composes the library components + W#2's own custom `<CompetitionScrapingViewer />` content component. The smoke-test page at `/components-smoke-test` is the visual reference; W#2's real page replaces it as the authoritative composition example after W#2 ships.

---

END OF DOCUMENT
