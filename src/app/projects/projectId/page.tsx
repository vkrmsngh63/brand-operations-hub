"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { authFetch } from "@/lib/authFetch";
import { useRouter, useParams } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════
   TYPES — match main Projects page
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
  lastActivityAt: string | null;
  workflows: WorkflowSummary[];
}

/* ═══════════════════════════════════════════════════════════════
   STYLE HELPERS — match /dashboard and /plos vocabulary
   ═══════════════════════════════════════════════════════════════ */

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

/* Keep in sync with /projects/page.tsx WORKFLOW_DEFS */
const WORKFLOW_DEFS: { id: string; icon: string; title: string; shortDesc: string; active: boolean; route: string | null }[] = [
  { id: "keyword-clustering", icon: "🔑", title: "Keyword Analysis & Intent Discovery", shortDesc: "Import and cluster keywords into intent groups.", active: true, route: "keyword-clustering" },
  { id: "competition-scraping", icon: "🔍", title: "Competition Scraping & Deep Analysis", shortDesc: "Identify competitors, analyze SEO, marketplace listings.", active: false, route: null },
  { id: "therapeutic-strategy", icon: "🧬", title: "Therapeutic Strategy & Product Family Design", shortDesc: "Design product families and therapeutic claims.", active: false, route: null },
  { id: "brand-identity-ip", icon: "🏷️", title: "Brand Identity & IP", shortDesc: "Generate brand names, visual identity, file trademarks.", active: false, route: null },
  { id: "conversion-funnel", icon: "🎯", title: "Conversion Funnel & Narrative Architecture", shortDesc: "Architect funnels and micro-journey specs.", active: false, route: null },
  { id: "content-development", icon: "✍️", title: "Content Development", shortDesc: "Generate pages, listings, emails with quality scoring.", active: false, route: null },
  { id: "multimedia-assets", icon: "🎬", title: "Multi-Media Assets & App Development", shortDesc: "Product imagery, illustrations, video, apps, value tools.", active: false, route: null },
  { id: "marketplace-launch", icon: "🏪", title: "Marketplace Optimization & Launch", shortDesc: "Launch across Amazon, Walmart, eBay, Etsy, website.", active: false, route: null },
  { id: "clinical-evidence", icon: "🔬", title: "Clinical Evidence & Endorsement", shortDesc: "Manage evidence tiers, publications, endorsements.", active: false, route: null },
  { id: "therapeutic-engagement", icon: "💊", title: "Therapeutic Engagement & Review Generation", shortDesc: "Alliance loops, engagement, review generation.", active: false, route: null },
  { id: "post-launch-optimization", icon: "📈", title: "Post-Launch Optimization", shortDesc: "Monitor SEO, marketplace, optimize conversions.", active: false, route: null },
  { id: "compliance-risk", icon: "⚖️", title: "Compliance & Risk Mitigation", shortDesc: "Rulebooks, pre-screening, review queue, incidents.", active: false, route: null },
  { id: "exit-strategy", icon: "🚪", title: "Exit Strategy & Portfolio Management", shortDesc: "Portfolio, deal sheets, valuations, exit execution.", active: false, route: null },
  { id: "analytics-admin", icon: "📊", title: "Analytics & System Administration", shortDesc: "Dashboards, AI prompts, permissions, system health.", active: false, route: null },
];

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

/* ═══════════════════════════════════════════════════════════════
   MAIN DETAIL PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : Array.isArray(params?.projectId) ? params.projectId[0] : "";

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  // Load Project
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      if (!session) {
        router.push("/");
        return;
      }
      try {
        const res = await authFetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("This Project does not exist or you don't have access to it.");
          }
          const body = await res.text();
          throw new Error(`Could not load Project (${res.status}): ${body}`);
        }
        const data = await res.json();
        if (cancelled) return;
        setProject({
          id: data.id,
          name: data.name,
          description: data.description || "",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastActivityAt: data.lastActivityAt ?? null,
          workflows: Array.isArray(data.workflows) ? data.workflows : [],
        });
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const statusByWorkflow = useMemo(() => {
    const m: Record<string, "inactive" | "active" | "completed"> = {};
    if (project) for (const w of project.workflows) m[w.workflow] = w.status;
    return m;
  }, [project]);

  function badgeStyle(status: "inactive" | "active" | "completed"): React.CSSProperties {
    const palette: Record<string, { bg: string; fg: string }> = {
      inactive: { bg: "rgba(139,148,158,.15)", fg: "#8b949e" },
      active: { bg: "rgba(31,111,235,.2)", fg: "#58a6ff" },
      completed: { bg: "rgba(46,160,67,.2)", fg: "#3fb950" },
    };
    const c = palette[status];
    return {
      fontSize: "9px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "1px",
      padding: "3px 8px",
      borderRadius: "3px",
      background: c.bg,
      color: c.fg,
      flexShrink: 0,
    };
  }

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
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 32px 64px" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <button onClick={() => router.push("/projects")} style={btnSecondary}>
            ← Back to Projects
          </button>
          <button onClick={handleLogout} style={btnSecondary}>
            Sign Out
          </button>
        </div>

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

        {project && (
          <>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#e6edf3", margin: "0 0 10px" }}>
                {project.name}
              </h1>
              {project.description && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#c9d1d9",
                    lineHeight: 1.6,
                    margin: "0 0 12px",
                    maxWidth: "720px",
                  }}
                >
                  {project.description}
                </p>
              )}
              <div
                style={{
                  fontSize: "11px",
                  color: "#8b949e",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                }}
              >
                Last activity: {formatRelativeDate(project.lastActivityAt)}
              </div>
            </div>

            {/* Workflows section label */}
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                color: "#8b949e",
                marginBottom: "14px",
              }}
            >
              Workflows
            </div>

            {/* Workflow grid — larger than the expanded-card grid, a detail-page layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "14px",
              }}
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
                    onClick={() => {
                      if (clickable && wf.route) {
                        router.push(`/projects/${project.id}/${wf.route}`);
                      } else {
                        showToast(`${wf.title} — coming soon`);
                      }
                    }}
                    style={{
                      background: isHovered ? "#f0f6ff" : "#161b22",
                      border: `1px solid ${isHovered ? "#3b82f6" : "#30363d"}`,
                      borderRadius: "10px",
                      padding: "16px 18px",
                      cursor: clickable ? "pointer" : "default",
                      opacity: clickable ? 1 : 0.7,
                      transition: "all .25s ease",
                      transform: isHovered ? "translateY(-2px)" : "none",
                      boxShadow: isHovered ? "0 8px 24px rgba(59,130,246,.15)" : "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      minHeight: "110px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "20px", flexShrink: 0 }}>{wf.icon}</span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: isHovered ? "#0f172a" : "#e6edf3",
                          lineHeight: 1.3,
                          flex: 1,
                        }}
                      >
                        {wf.title}
                      </span>
                      <span style={badgeStyle(status)}>
                        {status === "inactive" ? "Inactive" : status === "active" ? "Active" : "Completed"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: isHovered ? "#475569" : "#8b949e",
                        lineHeight: 1.55,
                      }}
                    >
                      {wf.shortDesc}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
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
    </div>
  );
}
