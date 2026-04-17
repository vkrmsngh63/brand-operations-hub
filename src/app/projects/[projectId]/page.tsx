"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { authFetch } from "@/lib/authFetch";
import { useRouter, useParams } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════
   WORKFLOW DEFINITIONS — same 15 entries as /projects/page.tsx
   (14 launch workflows + Business Operations)
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface WorkflowStatus {
  id: string;
  workflow: string;
  status: "inactive" | "active" | "completed";
  firstActivityAt: string | null;
  lastActivityAt: string | null;
  completedAt: string | null;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/* ═══════════════════════════════════════════════════════════════
   STYLE CONSTANTS — match /dashboard and /plos visual vocabulary
   ═══════════════════════════════════════════════════════════════ */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(ellipse at top, #1a1f2e 0%, #0d1117 50%, #010409 100%)",
  color: "#e6edf3",
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const topbarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 32px",
  borderBottom: "1px solid #21262d",
  background: "rgba(13, 17, 23, 0.6)",
  backdropFilter: "blur(8px)",
};

const backBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  background: "transparent",
  border: "1px solid #30363d",
  borderRadius: "6px",
  color: "#e6edf3",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const signOutBtnStyle: React.CSSProperties = {
  ...backBtnStyle,
};

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: "inactive" | "active" | "completed" }) {
  const palette = {
    inactive: { bg: "rgba(139, 148, 158, 0.15)", color: "#8b949e", label: "Not started" },
    active: { bg: "rgba(31, 111, 235, 0.15)", color: "#58a6ff", label: "Active" },
    completed: { bg: "rgba(35, 134, 54, 0.15)", color: "#3fb950", label: "Completed" },
  }[status];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.color}40`,
        borderRadius: "10px",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
      }}
    >
      {palette.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WORKFLOW CARD
   ═══════════════════════════════════════════════════════════════ */

function WorkflowCard({
  wf,
  status,
  hovered,
  onHover,
  onClick,
}: {
  wf: (typeof WORKFLOW_DEFS)[number];
  status: "inactive" | "active" | "completed";
  hovered: boolean;
  onHover: (h: boolean) => void;
  onClick: () => void;
}) {
  const clickable = wf.active;
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      style={{
        background: hovered ? "#f0f6ff" : "#161b22",
        color: hovered ? "#0d1117" : "#e6edf3",
        border: `1px solid ${hovered ? "#3b82f6" : "#30363d"}`,
        borderRadius: "10px",
        padding: "16px 18px",
        cursor: clickable ? "pointer" : "default",
        opacity: clickable ? 1 : 0.85,
        transition: "all .2s ease",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minHeight: "110px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "22px" }}>{wf.icon}</span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            flex: 1,
            lineHeight: 1.3,
          }}
        >
          {wf.title}
        </span>
      </div>
      <div style={{ marginTop: "auto" }}>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOAST (minimal — bottom-center)
   ═══════════════════════════════════════════════════════════════ */

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2400);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#161b22",
        border: "1px solid #30363d",
        borderRadius: "10px",
        padding: "10px 18px",
        color: "#e6edf3",
        fontSize: "13px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoveredWorkflow, setHoveredWorkflow] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [router]);

  // Load Project + workflow statuses
  useEffect(() => {
    if (!userId || !projectId) return;

    let cancelled = false;

    async function loadAll() {
      try {
        const [projectRes, workflowsRes] = await Promise.all([
          authFetch(`/api/projects/${projectId}`),
          authFetch(`/api/project-workflows/${projectId}`),
        ]);
        if (cancelled) return;

        if (projectRes.status === 404) {
          setLoadError("This Project no longer exists.");
          setLoading(false);
          return;
        }
        if (projectRes.status === 403) {
          setLoadError("You do not have access to this Project.");
          setLoading(false);
          return;
        }
        if (!projectRes.ok) {
          setLoadError("Could not load this Project.");
          setLoading(false);
          return;
        }

        const projectData = await projectRes.json();
        if (cancelled) return;
        setProject({
          id: projectData.id,
          name: projectData.name,
          description: projectData.description ?? "",
          createdAt: projectData.createdAt,
          updatedAt: projectData.updatedAt,
        });

        if (workflowsRes.ok) {
          const wfData = await workflowsRes.json();
          if (!cancelled) setWorkflowStatuses(wfData);
        }

        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load Project detail:", err);
        setLoadError("Could not load this Project.");
        setLoading(false);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [userId, projectId]);

  const statusByWorkflow = (() => {
    const m: Record<string, "inactive" | "active" | "completed"> = {};
    for (const w of workflowStatuses) m[w.workflow] = w.status;
    return m;
  })();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  const handleWorkflowClick = useCallback(
    (wf: (typeof WORKFLOW_DEFS)[number]) => {
      if (wf.active && wf.route) {
        router.push(`/projects/${projectId}/${wf.route}`);
      } else {
        setToast(`${wf.title} — coming soon`);
      }
    },
    [projectId, router]
  );

  /* Error screen */
  if (loadError) {
    return (
      <div style={pageStyle}>
        <div style={topbarStyle}>
          <button onClick={() => router.push("/projects")} style={backBtnStyle}>
            ← Back to Projects
          </button>
          <button onClick={handleSignOut} style={signOutBtnStyle}>
            Sign Out
          </button>
        </div>
        <div
          style={{
            maxWidth: "480px",
            margin: "96px auto",
            padding: "32px",
            textAlign: "center",
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <p style={{ color: "#e6edf3", marginBottom: "20px" }}>{loadError}</p>
          <button
            onClick={() => router.push("/projects")}
            style={{
              padding: "10px 20px",
              background: "#1f6feb",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  /* Loading screen */
  if (loading || !project) {
    return (
      <div style={pageStyle}>
        <div style={topbarStyle}>
          <button onClick={() => router.push("/projects")} style={backBtnStyle}>
            ← Back to Projects
          </button>
          <button onClick={handleSignOut} style={signOutBtnStyle}>
            Sign Out
          </button>
        </div>
        <p
          style={{
            textAlign: "center",
            color: "#8b949e",
            marginTop: "80px",
            fontSize: "14px",
          }}
        >
          Loading Project…
        </p>
      </div>
    );
  }

  /* Main render */
  return (
    <div style={pageStyle}>
      {/* Top bar */}
      <div style={topbarStyle}>
        <button onClick={() => router.push("/projects")} style={backBtnStyle}>
          ← Back to Projects
        </button>
        <button onClick={handleSignOut} style={signOutBtnStyle}>
          Sign Out
        </button>
      </div>

      {/* Project header */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 32px 24px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#e6edf3",
            margin: 0,
            marginBottom: "8px",
          }}
        >
          {project.name}
        </h1>
        {project.description && (
          <p
            style={{
              color: "#8b949e",
              fontSize: "14px",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "760px",
            }}
          >
            {project.description}
          </p>
        )}
      </div>

      {/* Workflow grid */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "8px 32px 80px",
        }}
      >
        <h2
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#8b949e",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "16px",
            marginTop: "20px",
          }}
        >
          Workflows
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "14px",
          }}
        >
          {WORKFLOW_DEFS.map((wf) => {
            const status = statusByWorkflow[wf.id] || "inactive";
            return (
              <WorkflowCard
                key={wf.id}
                wf={wf}
                status={status}
                hovered={hoveredWorkflow === wf.id}
                onHover={(h) => setHoveredWorkflow(h ? wf.id : null)}
                onClick={() => handleWorkflowClick(wf)}
              />
            );
          })}
        </div>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
