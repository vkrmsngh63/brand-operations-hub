"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { authFetch } from "@/lib/authFetch";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface WorkflowSummary {
  workflow: string;
  status: "inactive" | "active" | "completed";
  lastActivityAt: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null; // aggregated MAX across ProjectWorkflows
  workflows: WorkflowSummary[];
}

type SortKey = "lastActivity" | "name" | "createdAt";
type CompletionFilter = "all" | "has-active" | "all-completed" | "no-activity";

/* ═══════════════════════════════════════════════════════════════
   STYLE HELPERS — match visual vocabulary from /dashboard and /plos
   ═══════════════════════════════════════════════════════════════ */

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
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  fontSize: "13px",
  lineHeight: 1.5,
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

const btnDanger: React.CSSProperties = {
  padding: "8px 18px",
  background: "#da3633",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'IBM Plex Sans', sans-serif",
};

/* ═══════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

function formatRelativeDate(iso: string | null): string {
  if (!iso) return "No activity yet";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function truncate(text: string, max: number): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function workflowStatusSummary(workflows: WorkflowSummary[]): string {
  // Known total of 14 PLOS workflows + 1 standalone (Business Ops) = 15.
  // But user doesn't interact with BO yet (coming soon). We show the 14 workflows.
  const TOTAL = 14;
  let active = 0;
  let completed = 0;
  for (const w of workflows) {
    if (w.status === "active") active++;
    else if (w.status === "completed") completed++;
  }
  const inactive = TOTAL - active - completed;
  return `${active} Active · ${completed} Done · ${inactive} Inactive`;
}

/* ═══════════════════════════════════════════════════════════════
   WORKFLOW CARD GRID (for expanded Project cards + detail page)
   ═══════════════════════════════════════════════════════════════ */

// The 14 PLOS workflows + Business Ops standalone — keep in sync with /plos page.
const WORKFLOW_DEFS: { id: string; icon: string; title: string; active: boolean; route: string | null }[] = [
  { id: "keyword-clustering", icon: "🔑", title: "Keyword Analysis & Intent Discovery", active: true, route: "keyword-clustering" },
  { id: "competition-scraping", icon: "🔍", title: "Competition Scraping & Deep Analysis", active: false, route: null },
  { id: "therapeutic-strategy", icon: "🧬", title: "Therapeutic Strategy & Product Family Design", active: false, route: null },
  { id: "brand-identity-ip", icon: "🏷️", title: "Brand Identity & IP", active: false, route: null },
  { id: "conversion-funnel", icon: "🎯", title: "Conversion Funnel & Narrative Architecture", active: false, route: null },
  { id: "content-development", icon: "✍️", title: "Content Development", active: false, route: null },
  { id: "multimedia-assets", icon: "🎬", title: "Multi-Media Assets & App Development", active: false, route: null },
  { id: "marketplace-launch", icon: "🏪", title: "Marketplace Optimization & Launch", active: false, route: null },
  { id: "clinical-evidence", icon: "🔬", title: "Clinical Evidence & Endorsement", active: false, route: null },
  { id: "therapeutic-engagement", icon: "💊", title: "Therapeutic Engagement & Review Generation", active: false, route: null },
  { id: "post-launch-optimization", icon: "📈", title: "Post-Launch Optimization", active: false, route: null },
  { id: "compliance-risk", icon: "⚖️", title: "Compliance & Risk Mitigation", active: false, route: null },
  { id: "exit-strategy", icon: "🚪", title: "Exit Strategy & Portfolio Management", active: false, route: null },
  { id: "analytics-admin", icon: "📊", title: "Analytics & System Administration", active: false, route: null },
  { id: "business-operations", icon: "⚙️", title: "Business Operations", active: false, route: null },
];

function WorkflowCardGrid({
  projectId,
  workflows,
  onToast,
  onToggleCompleted,
}: {
  projectId: string;
  workflows: WorkflowSummary[];
  onToast: (msg: string) => void;
  onToggleCompleted: (workflow: string, nextStatus: "active" | "completed") => void;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const statusByWorkflow = useMemo(() => {
    const m: Record<string, "inactive" | "active" | "completed"> = {};
    for (const w of workflows) m[w.workflow] = w.status;
    return m;
  }, [workflows]);

  function badgeStyle(status: "inactive" | "active" | "completed"): React.CSSProperties {
    const palette: Record<string, { bg: string; fg: string }> = {
      inactive: { bg: "rgba(139,148,158,.15)", fg: "#8b949e" },
      active: { bg: "rgba(31,111,235,.2)", fg: "#58a6ff" },
      completed: { bg: "rgba(46,160,67,.2)", fg: "#3fb950" },
    };
    const c = palette[status];
    return {
      fontSize: "8px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "1px",
      padding: "2px 7px",
      borderRadius: "3px",
      background: c.bg,
      color: c.fg,
      flexShrink: 0,
    };
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "10px",
        marginTop: "14px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {WORKFLOW_DEFS.map((wf) => {
        const status = statusByWorkflow[wf.id] || "inactive";
        const isHovered = hovered === wf.id;
        const clickable = wf.active;

        return (
          <div
            key={wf.id}
            onMouseEnter={() => setHovered(wf.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (clickable && wf.route) {
                router.push(`/projects/${projectId}/${wf.route}`);
              } else {
                onToast(`${wf.title} — coming soon`);
              }
            }}
            style={{
              position: "relative",
              background: isHovered ? "#f0f6ff" : "#0d1117",
              border: `1px solid ${isHovered ? "#3b82f6" : "#30363d"}`,
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: clickable ? "pointer" : "default",
              opacity: clickable ? 1 : 0.75,
              transition: "all .2s ease",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              minHeight: "64px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "15px", flexShrink: 0 }}>{wf.icon}</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: isHovered ? "#0f172a" : "#e6edf3",
                  lineHeight: 1.3,
                  flex: 1,
                }}
              >
                {wf.title}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={badgeStyle(status)}>
                {status === "inactive" ? "Inactive" : status === "active" ? "Active" : "Completed"}
              </span>
              {/* Completed toggle — only if active or completed */}
              {(status === "active" || status === "completed") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompleted(wf.id, status === "completed" ? "active" : "completed");
                  }}
                  style={{
                    fontSize: "10px",
                    background: "transparent",
                    border: "1px solid #30363d",
                    borderRadius: "4px",
                    color: isHovered ? "#475569" : "#8b949e",
                    padding: "2px 6px",
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                  title={status === "completed" ? "Mark as active again" : "Mark as completed"}
                >
                  {status === "completed" ? "Reopen" : "Mark Done"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NEW PROJECT FORM (inline — appears when "+" is clicked)
   ═══════════════════════════════════════════════════════════════ */

function NewProjectForm({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, description: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  async function handleSubmit() {
    if (!name.trim()) {
      setErr("Please enter a name for the Project.");
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      await onCreate(name.trim(), description.trim());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create Project. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #1f6feb",
        borderRadius: "10px",
        padding: "20px 22px",
        marginBottom: "16px",
        boxShadow: "0 10px 30px rgba(31,111,235,.15)",
      }}
    >
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#e6edf3", marginBottom: "14px" }}>
        New Project
      </div>

      <label style={labelStyle}>Name (required)</label>
      <input
        ref={nameRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="e.g., Brand X Launch 2026"
        style={{ ...inputStyle, marginBottom: "14px" }}
        disabled={submitting}
      />

      <label style={labelStyle}>Description (optional)</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="A short description for your reference (optional)."
        rows={3}
        style={{ ...textareaStyle, marginBottom: "14px" }}
        disabled={submitting}
      />

      {err && (
        <div style={{ fontSize: "12px", color: "#f85149", marginBottom: "10px" }}>{err}</div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={onCancel} style={btnSecondary} disabled={submitting}>
          Cancel
        </button>
        <button onClick={handleSubmit} style={btnPrimary} disabled={submitting}>
          {submitting ? "Creating…" : "Create Project"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EDIT PROJECT MODAL
   ═══════════════════════════════════════════════════════════════ */

function EditProjectModal({
  project,
  onSave,
  onClose,
}: {
  project: Project;
  onSave: (name: string, description: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);

  async function handleSave() {
    if (!name.trim()) {
      setErr("Please enter a name for the Project.");
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      await onSave(name.trim(), description.trim());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save. Please try again.");
      setSubmitting(false);
    }
  }

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
          width: "520px",
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,.7)",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#e6edf3", marginBottom: "24px" }}>
          Edit Project
        </h3>

        <label style={labelStyle}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ ...inputStyle, marginBottom: "18px" }}
          disabled={submitting}
        />

        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          style={{ ...textareaStyle, marginBottom: "18px" }}
          disabled={submitting}
        />

        {err && (
          <div style={{ fontSize: "12px", color: "#f85149", marginBottom: "14px" }}>{err}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={btnSecondary} disabled={submitting}>
            Cancel
          </button>
          <button onClick={handleSave} style={btnPrimary} disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TWO-STEP DELETE CONFIRMATION
   ═══════════════════════════════════════════════════════════════ */

function DeleteConfirmModal({
  project,
  onConfirm,
  onClose,
}: {
  project: Project;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);

  async function handleFinalDelete() {
    setSubmitting(true);
    setErr("");
    try {
      await onConfirm();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not delete. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && !submitting && onClose()}
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
          border: `1px solid ${step === 2 ? "#da3633" : "#30363d"}`,
          borderRadius: "12px",
          padding: "32px",
          width: "480px",
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,.7)",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        {step === 1 ? (
          <>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#e6edf3", marginBottom: "14px" }}>
              Delete this Project?
            </h3>
            <p style={{ fontSize: "13px", color: "#c9d1d9", lineHeight: 1.6, marginBottom: "22px" }}>
              You&apos;re about to delete{" "}
              <strong style={{ color: "#e6edf3" }}>&ldquo;{project.name}&rdquo;</strong>. This will
              also remove all of its keywords, canvas work, and anything else attached to it.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={onClose} style={btnSecondary}>
                Cancel
              </button>
              <button onClick={() => setStep(2)} style={btnDanger}>
                Yes, continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f85149", marginBottom: "14px" }}>
              ⚠️ Last chance
            </h3>
            <p style={{ fontSize: "13px", color: "#c9d1d9", lineHeight: 1.6, marginBottom: "10px" }}>
              Clicking <strong style={{ color: "#f85149" }}>Delete permanently</strong> will erase
              everything about &ldquo;{project.name}&rdquo; from your database.
            </p>
            <p style={{ fontSize: "12px", color: "#8b949e", lineHeight: 1.6, marginBottom: "22px" }}>
              This cannot be undone. There is no recycle bin.
            </p>
            {err && (
              <div style={{ fontSize: "12px", color: "#f85149", marginBottom: "14px" }}>{err}</div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={onClose} style={btnSecondary} disabled={submitting}>
                Cancel
              </button>
              <button onClick={handleFinalDelete} style={btnDanger} disabled={submitting}>
                {submitting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROJECT CARD
   ═══════════════════════════════════════════════════════════════ */

function ProjectCard({
  project,
  expanded,
  hovered,
  onHover,
  onClickBody,
  onClickName,
  onEdit,
  onDelete,
  onToast,
  onToggleWorkflowCompleted,
}: {
  project: Project;
  expanded: boolean;
  hovered: boolean;
  onHover: (h: boolean) => void;
  onClickBody: () => void;
  onClickName: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToast: (msg: string) => void;
  onToggleWorkflowCompleted: (workflow: string, nextStatus: "active" | "completed") => void;
}) {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClickBody}
      style={{
        position: "relative",
        background: hovered ? "#f0f6ff" : "#161b22",
        border: `1px solid ${hovered ? "#3b82f6" : "#30363d"}`,
        borderRadius: "10px",
        padding: "20px 22px",
        cursor: "pointer",
        transition: "all .25s ease",
        transform: hovered && !expanded ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "0 10px 30px rgba(59,130,246,.2)" : "none",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {/* Edit pencil — appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit Project"
        style={{
          position: "absolute",
          top: "10px",
          right: "40px",
          background: "transparent",
          border: "none",
          color: "#484f58",
          cursor: "pointer",
          fontSize: "13px",
          padding: "3px 5px",
          borderRadius: "4px",
          opacity: hovered ? 1 : 0,
          transition: "opacity .2s",
          zIndex: 2,
        }}
      >
        ✏️
      </button>

      {/* Delete button — appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete Project"
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          color: "#484f58",
          cursor: "pointer",
          fontSize: "13px",
          padding: "3px 5px",
          borderRadius: "4px",
          opacity: hovered ? 1 : 0,
          transition: "opacity .2s",
          zIndex: 2,
        }}
      >
        🗑️
      </button>

      {/* Project name — clickable separately for navigation */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClickName();
        }}
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: hovered ? "#0f172a" : "#e6edf3",
          lineHeight: 1.3,
          marginBottom: "8px",
          display: "inline-block",
          textDecoration: "none",
          cursor: "pointer",
          paddingRight: "60px", // avoid overlap with pencil+trash
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = "underline";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = "none";
        }}
      >
        {project.name}
      </div>

      {/* Description preview */}
      {project.description && (
        <div
          style={{
            fontSize: "12px",
            color: hovered ? "#475569" : "#8b949e",
            lineHeight: 1.55,
            marginBottom: "12px",
          }}
        >
          {truncate(project.description, 180)}
        </div>
      )}

      {/* Meta row: last activity + workflow status summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          fontSize: "11px",
          color: hovered ? "#475569" : "#8b949e",
        }}
      >
        <span>Last activity: {formatRelativeDate(project.lastActivityAt)}</span>
        <span style={{ fontWeight: 600 }}>{workflowStatusSummary(project.workflows)}</span>
      </div>

      {/* Expanded: show 14 workflow cards */}
      {expanded && (
        <>
          <div
            style={{
              marginTop: "14px",
              paddingTop: "14px",
              borderTop: `1px solid ${hovered ? "#cbd5e1" : "#21262d"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                  color: hovered ? "#475569" : "#8b949e",
                }}
              >
                Workflows
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                style={{
                  ...btnSecondary,
                  padding: "4px 10px",
                  fontSize: "11px",
                  borderColor: hovered ? "#94a3b8" : "#30363d",
                  color: hovered ? "#475569" : "#8b949e",
                }}
              >
                ✏️ Edit Project
              </button>
            </div>
            <WorkflowCardGrid
              projectId={project.id}
              workflows={project.workflows}
              onToast={onToast}
              onToggleCompleted={onToggleWorkflowCompleted}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH / FILTER / SORT BAR
   ═══════════════════════════════════════════════════════════════ */

function ControlsBar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  completionFilter,
  onCompletionChange,
  workflowFilter,
  onWorkflowFilterChange,
  onNewProject,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  sortBy: SortKey;
  onSortChange: (v: SortKey) => void;
  completionFilter: CompletionFilter;
  onCompletionChange: (v: CompletionFilter) => void;
  workflowFilter: string;
  onWorkflowFilterChange: (v: string) => void;
  onNewProject: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      {/* Search box — takes most of the width */}
      <div
        style={{
          position: "relative",
          flex: "1 1 280px",
          minWidth: "220px",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "13px",
            color: "#8b949e",
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Projects..."
          style={{
            ...inputStyle,
            paddingLeft: "36px",
            paddingRight: search ? "36px" : "12px",
          }}
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            title="Clear search"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: "#8b949e",
              cursor: "pointer",
              fontSize: "14px",
              padding: "4px 6px",
              borderRadius: "4px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        style={{
          ...inputStyle,
          width: "auto",
          padding: "10px 12px",
          fontSize: "12px",
          cursor: "pointer",
        }}
        title="Sort Projects by"
      >
        <option value="lastActivity">Sort: Last activity</option>
        <option value="name">Sort: Name (A–Z)</option>
        <option value="createdAt">Sort: Date created</option>
      </select>

      {/* Completion filter */}
      <select
        value={completionFilter}
        onChange={(e) => onCompletionChange(e.target.value as CompletionFilter)}
        style={{
          ...inputStyle,
          width: "auto",
          padding: "10px 12px",
          fontSize: "12px",
          cursor: "pointer",
        }}
        title="Filter by status"
      >
        <option value="all">Filter: All Projects</option>
        <option value="has-active">Filter: Has active workflows</option>
        <option value="all-completed">Filter: All workflows done</option>
        <option value="no-activity">Filter: No activity yet</option>
      </select>

      {/* Workflow-stage filter */}
      <select
        value={workflowFilter}
        onChange={(e) => onWorkflowFilterChange(e.target.value)}
        style={{
          ...inputStyle,
          width: "auto",
          padding: "10px 12px",
          fontSize: "12px",
          cursor: "pointer",
        }}
        title="Filter by workflow stage"
      >
        <option value="">Stage: Any</option>
        {WORKFLOW_DEFS.map((wf) => (
          <option key={wf.id} value={wf.id}>
            Stage: {wf.title} active
          </option>
        ))}
      </select>

      {/* + New Project — aligned right */}
      <button onClick={onNewProject} style={{ ...btnPrimary, marginLeft: "auto" }}>
        + New Project
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE (Option A — prominent call-to-action)
   ═══════════════════════════════════════════════════════════════ */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 24px 40px",
        background: "#161b22",
        border: "1px dashed #30363d",
        borderRadius: "12px",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#e6edf3",
          margin: "0 0 10px",
        }}
      >
        Let&apos;s launch your first product
      </h2>
      <p
        style={{
          fontSize: "13px",
          color: "#8b949e",
          maxWidth: "480px",
          margin: "0 auto 24px",
          lineHeight: 1.6,
        }}
      >
        A Project is one product launch — it flows through 14 workflows from keyword
        research and competitive analysis through content development, marketplace launch,
        and post-launch optimization.
      </p>
      <button onClick={onCreate} style={{ ...btnPrimary, padding: "12px 28px", fontSize: "14px" }}>
        + Create your first Project
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const PAGE_SIZE = 25;

export default function ProjectsPage() {
  const router = useRouter();

  // auth + initial load
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // data
  const [projects, setProjects] = useState<Project[]>([]);

  // controls
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("lastActivity");
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>("all");
  const [workflowFilter, setWorkflowFilter] = useState<string>(""); // "" = any
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ui state
  const [showNewForm, setShowNewForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [toast, setToast] = useState("");

  // infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Auth + initial data load ── */
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      if (!session) {
        router.push("/");
        return;
      }
      try {
        const res = await authFetch("/api/projects");
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Could not load Projects (${res.status}): ${body}`);
        }
        const data = await res.json();
        if (cancelled) return;
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  /* ── Toast helper ── */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }, []);

  /* ── Sign out ── */
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  /* ── Create new Project ── */
  async function handleCreate(name: string, description: string) {
    const res = await authFetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Could not create Project (${res.status}): ${body}`);
    }
    const created = await res.json();
    // Shape: server returns Project w/ workflows[] (maybe empty) + lastActivityAt
    const normalized: Project = {
      id: created.id,
      name: created.name,
      description: created.description || "",
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      lastActivityAt: created.lastActivityAt ?? null,
      workflows: Array.isArray(created.workflows) ? created.workflows : [],
    };
    setProjects((prev) => [normalized, ...prev]);
    setShowNewForm(false);
    showToast(`Created "${normalized.name}"`);
  }

  /* ── Edit Project ── */
  async function handleEdit(name: string, description: string) {
    if (!editingProject) return;
    const res = await authFetch(`/api/projects/${editingProject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Could not save changes (${res.status}): ${body}`);
    }
    const updated = await res.json();
    setProjects((prev) =>
      prev.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              name: updated.name ?? name,
              description: updated.description ?? description,
              updatedAt: updated.updatedAt ?? p.updatedAt,
            }
          : p
      )
    );
    setEditingProject(null);
    showToast("Project updated");
  }

  /* ── Delete Project ── */
  async function handleDelete() {
    if (!deletingProject) return;
    const res = await authFetch(`/api/projects/${deletingProject.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Could not delete (${res.status}): ${body}`);
    }
    const id = deletingProject.id;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
    setDeletingProject(null);
    showToast("Project deleted");
  }

  /* ── Toggle workflow Completed/Active ── */
  async function handleToggleWorkflowCompleted(
    projectId: string,
    workflow: string,
    nextStatus: "active" | "completed"
  ) {
    const res = await authFetch(`/api/project-workflows/${projectId}/${workflow}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) {
      showToast("Could not update workflow status");
      return;
    }
    const updated = await res.json();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const wfs = [...p.workflows];
        const idx = wfs.findIndex((w) => w.workflow === workflow);
        if (idx >= 0) {
          wfs[idx] = { ...wfs[idx], status: nextStatus, lastActivityAt: updated.lastActivityAt ?? wfs[idx].lastActivityAt };
        } else {
          wfs.push({ workflow, status: nextStatus, lastActivityAt: updated.lastActivityAt ?? null });
        }
        return { ...p, workflows: wfs };
      })
    );
    showToast(nextStatus === "completed" ? "Marked as done" : "Reopened");
  }

  /* ── Filtering + Sorting (client-side for admin-solo scale) ── */
  const filtered = useMemo(() => {
    const q = debouncedSearch;
    return projects.filter((p) => {
      // Search
      if (q) {
        const hay = `${p.name} ${p.description || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Completion filter
      if (completionFilter !== "all") {
        const hasActive = p.workflows.some((w) => w.status === "active");
        const hasAny = p.workflows.length > 0 && p.workflows.some((w) => w.status !== "inactive");
        const allCompleted = p.workflows.length > 0 && p.workflows.every((w) => w.status === "completed");

        if (completionFilter === "has-active" && !hasActive) return false;
        if (completionFilter === "all-completed" && !allCompleted) return false;
        if (completionFilter === "no-activity" && hasAny) return false;
      }

      // Workflow-stage filter
      if (workflowFilter) {
        const match = p.workflows.find((w) => w.workflow === workflowFilter);
        if (!match || match.status !== "active") return false;
      }

      return true;
    });
  }, [projects, debouncedSearch, completionFilter, workflowFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "name") {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "createdAt") {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // lastActivity — null goes to bottom; ties broken by createdAt
      arr.sort((a, b) => {
        const at = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const bt = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        if (bt !== at) return bt - at;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return arr;
  }, [filtered, sortBy]);

  // Reset visible count when filters/search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, sortBy, completionFilter, workflowFilter]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  /* ── Infinite-scroll observer ── */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, sorted.length));
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, sorted.length]);

  /* ── Card click handlers ── */
  function handleCardBodyClick(p: Project) {
    setExpandedId((cur) => (cur === p.id ? null : p.id));
  }

  function handleNameClick(p: Project) {
    router.push(`/projects/${p.id}`);
  }

  /* ─────────────────────────── RENDER ─────────────────────────── */

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

  const hasAnyProjects = projects.length > 0;
  const showEmpty = !hasAnyProjects && !showNewForm;

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
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 32px 64px",
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
          <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>📁</span>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#e6edf3", margin: "0 0 6px" }}>
            Projects
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
            Your product launches
          </p>
        </div>

        {/* Load error */}
        {loadError && (
          <div
            style={{
              background: "#2d1214",
              border: "1px solid #f85149",
              borderRadius: "8px",
              padding: "14px 18px",
              marginBottom: "16px",
              color: "#f85149",
              fontSize: "13px",
            }}
          >
            {loadError}
          </div>
        )}

        {/* Controls bar — always visible if there's any project or the form is open */}
        {(hasAnyProjects || showNewForm) && (
          <ControlsBar
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
            completionFilter={completionFilter}
            onCompletionChange={setCompletionFilter}
            workflowFilter={workflowFilter}
            onWorkflowFilterChange={setWorkflowFilter}
            onNewProject={() => setShowNewForm(true)}
          />
        )}

        {/* New-project form */}
        {showNewForm && (
          <NewProjectForm onCreate={handleCreate} onCancel={() => setShowNewForm(false)} />
        )}

        {/* Empty state — only if truly zero Projects */}
        {showEmpty && <EmptyState onCreate={() => setShowNewForm(true)} />}

        {/* No-results state — has Projects but filters hide them all */}
        {hasAnyProjects && sorted.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#8b949e",
              fontSize: "13px",
              background: "#161b22",
              border: "1px dashed #30363d",
              borderRadius: "10px",
            }}
          >
            No Projects match your current search or filters.{" "}
            <button
              onClick={() => {
                setSearch("");
                setCompletionFilter("all");
                setWorkflowFilter("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#58a6ff",
                cursor: "pointer",
                fontSize: "13px",
                textDecoration: "underline",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Projects list */}
        {visible.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {visible.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                expanded={expandedId === p.id}
                hovered={hoveredId === p.id}
                onHover={(h) => setHoveredId(h ? p.id : null)}
                onClickBody={() => handleCardBodyClick(p)}
                onClickName={() => handleNameClick(p)}
                onEdit={() => setEditingProject(p)}
                onDelete={() => setDeletingProject(p)}
                onToast={showToast}
                onToggleWorkflowCompleted={(wf, next) => handleToggleWorkflowCompleted(p.id, wf, next)}
              />
            ))}
          </div>
        )}

        {/* Infinite-scroll sentinel + "Loading more" + "End of list" */}
        {sorted.length > 0 && (
          <div ref={sentinelRef} style={{ textAlign: "center", padding: "24px 0", color: "#8b949e", fontSize: "12px" }}>
            {hasMore ? "Loading more…" : `You've reached the end · ${sorted.length} Project${sorted.length === 1 ? "" : "s"} total`}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onSave={handleEdit}
          onClose={() => setEditingProject(null)}
        />
      )}

      {/* Delete confirmation (two-step) */}
      {deletingProject && (
        <DeleteConfirmModal
          project={deletingProject}
          onConfirm={handleDelete}
          onClose={() => setDeletingProject(null)}
        />
      )}

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
    </div>
  );
}
