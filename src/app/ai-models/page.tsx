"use client";

// P-63 Phase 2b (2026-06-03) — the self-serve "AI Models" admin screen.
// A platform-level (not project-scoped) page that lists every model in the
// central registry and lets the director add / edit / delete / enable them.
// Reads + writes /api/ai-models (DB-backed, seeded on first read). Pure logic
// lives in src/lib/ai-models/admin-ui.ts (unit-tested); this file owns React
// state, fetch, and presentation. Linked from the dashboard top bar.

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authFetch } from "@/lib/authFetch";
import type {
  AiModelRecord,
  AiPickerMenuId,
  ThinkingOptionId,
} from "@/lib/ai-models/types";
import {
  ALL_MENUS,
  ALL_THINKING_OPTIONS,
  MENU_LABELS,
  PROVIDER_OPTIONS,
  THINKING_LABELS,
  WIZARD_STEPS,
  WIZARD_STEP_COUNT,
  canProceedFromStep,
  draftToCreateBody,
  emptyDraft,
  integrationPendingInstruction,
  parsePricing,
  providerIsIntegrated,
  type ModelDraft,
  type PricingDraft,
} from "@/lib/ai-models/admin-ui";

const FONT = "'IBM Plex Sans', sans-serif";
const BG = "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)";

const btn = (variant: "primary" | "ghost" | "danger" = "ghost"): React.CSSProperties => ({
  padding: "8px 16px",
  background:
    variant === "primary" ? "#1f6feb" : variant === "danger" ? "#b62324" : "transparent",
  border: `1px solid ${variant === "primary" ? "#1f6feb" : variant === "danger" ? "#b62324" : "#30363d"}`,
  borderRadius: 6,
  color: variant === "ghost" ? "#8b949e" : "#fff",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: FONT,
});

const PRICING_FIELDS: { key: keyof PricingDraft; label: string }[] = [
  { key: "inputPerMillion", label: "Input" },
  { key: "outputPerMillion", label: "Output" },
  { key: "cacheWrite5mPerMillion", label: "Cache write (5m)" },
  { key: "cacheReadPerMillion", label: "Cache read" },
];

export default function AiModelsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<AiModelRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AiModelRecord | null>(null);
  const [deleting, setDeleting] = useState<AiModelRecord | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await authFetch("/api/ai-models", { method: "GET" });
      if (!res.ok) {
        setError(`Could not load AI models (${res.status}).`);
        return;
      }
      const data = (await res.json()) as { models: AiModelRecord[] };
      setModels(data.models ?? []);
      setError(null);
    } catch {
      setError("Could not load AI models (network).");
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
        return;
      }
      load().finally(() => setLoading(false));
    });
  }, [router, load]);

  if (loading) {
    return (
      <Centered>
        <span style={{ color: "#8b949e", fontFamily: FONT }}>Loading…</span>
      </Centered>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, overflowY: "auto", fontFamily: FONT }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <button onClick={() => router.push("/dashboard")} style={btn("ghost")}>
            ← Dashboard
          </button>
          <button onClick={() => setAdding(true)} style={btn("primary")}>
            + Add a model
          </button>
        </div>

        <h1 style={{ color: "#e6edf3", fontSize: 28, fontWeight: 700, margin: "0 0 6px" }}>
          🤖 AI Models
        </h1>
        <p style={{ color: "#8b949e", fontSize: 14, margin: "0 0 28px", maxWidth: 760 }}>
          The single place that controls which AI models appear in every model
          dropdown across the platform. Add, edit, or remove a model here and it
          updates everywhere. A model from a company we haven&apos;t connected yet
          is saved as <em>integration pending</em> — shown disabled, never run.
        </p>

        {error && (
          <div style={{ color: "#ff7b72", background: "#2d1417", border: "1px solid #b62324", borderRadius: 6, padding: "10px 14px", marginBottom: 18, fontSize: 13 }}>
            {error}
          </div>
        )}

        <ModelsTable
          models={models}
          onEdit={setEditing}
          onDelete={setDeleting}
          onShowPending={(m) => setPendingNotice(integrationPendingInstruction(m.providerLabel))}
        />
      </div>

      {adding && (
        <AddModelWizard
          existingIds={new Set(models.map((m) => m.id))}
          onClose={() => setAdding(false)}
          onSaved={async (createdProviderIntegrated, providerLabel) => {
            setAdding(false);
            await load();
            if (!createdProviderIntegrated) {
              setPendingNotice(integrationPendingInstruction(providerLabel));
            }
          }}
        />
      )}

      {editing && (
        <EditModelModal
          model={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}

      {deleting && (
        <DeleteConfirm
          model={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={async () => {
            setDeleting(null);
            await load();
          }}
        />
      )}

      {pendingNotice && (
        <PendingNotice text={pendingNotice} onClose={() => setPendingNotice(null)} />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
      {children}
    </div>
  );
}

// --- Table -------------------------------------------------------------------

function ModelsTable({
  models,
  onEdit,
  onDelete,
  onShowPending,
}: {
  models: AiModelRecord[];
  onEdit: (m: AiModelRecord) => void;
  onDelete: (m: AiModelRecord) => void;
  onShowPending: (m: AiModelRecord) => void;
}) {
  const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", color: "#8b949e", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "1px solid #30363d" };
  const td: React.CSSProperties = { padding: "12px", color: "#e6edf3", fontSize: 13, borderBottom: "1px solid #21262d", verticalAlign: "top" };

  if (models.length === 0) {
    return <p style={{ color: "#8b949e", fontSize: 14 }}>No models yet. Click “+ Add a model”.</p>;
  }

  return (
    <div style={{ overflowX: "auto", border: "1px solid #30363d", borderRadius: 8 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 880 }}>
        <thead>
          <tr>
            <th style={th}>Company</th>
            <th style={th}>Model</th>
            <th style={th}>Appears in</th>
            <th style={th}>Thinking</th>
            <th style={th}>Pricing (in / out)</th>
            <th style={th}>Status</th>
            <th style={th}>On</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m.id}>
              <td style={td}>{m.providerLabel}</td>
              <td style={td}>
                <div style={{ fontWeight: 600 }}>{m.displayLabel}</div>
                <div style={{ color: "#6e7681", fontSize: 11 }}>{m.modelId}</div>
              </td>
              <td style={td}>{m.menus.map((x) => menuShort(x)).join(", ") || "—"}</td>
              <td style={td}>{m.thinkingOptions.join(", ")}</td>
              <td style={td}>
                ${m.pricing.inputPerMillion} / ${m.pricing.outputPerMillion}
                <span style={{ color: "#6e7681", fontSize: 11 }}> per 1M</span>
              </td>
              <td style={td}>
                {m.runnableStatus === "runnable" ? (
                  <span style={{ color: "#3fb950", fontSize: 12, fontWeight: 600 }}>● runnable</span>
                ) : (
                  <button
                    onClick={() => onShowPending(m)}
                    title="Click for the instruction to make this live"
                    style={{ color: "#d29922", fontSize: 12, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", fontFamily: FONT, textDecoration: "underline", padding: 0 }}
                  >
                    ◐ integration pending
                  </button>
                )}
              </td>
              <td style={td}>{m.enabled ? "Yes" : "No"}</td>
              <td style={td}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onEdit(m)} style={{ ...btn("ghost"), padding: "5px 10px" }}>Edit</button>
                  <button onClick={() => onDelete(m)} style={{ ...btn("ghost"), padding: "5px 10px", color: "#ff7b72", borderColor: "#5a2426" }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function menuShort(m: AiPickerMenuId): string {
  return m === "review-analysis" ? "W#2" : "W#1";
}

// --- Modal shell -------------------------------------------------------------

function ModalShell({ children, width = 560 }: { children: React.ReactNode; width?: number }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 10, width, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24, fontFamily: FONT }}>
        {children}
      </div>
    </div>
  );
}

const label: React.CSSProperties = { display: "block", color: "#8b949e", fontSize: 12, fontWeight: 600, margin: "14px 0 6px" };
const input: React.CSSProperties = { width: "100%", padding: "8px 10px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, color: "#e6edf3", fontSize: 13, fontFamily: FONT, boxSizing: "border-box" };

// --- Add wizard --------------------------------------------------------------

function AddModelWizard({
  existingIds,
  onClose,
  onSaved,
}: {
  existingIds: Set<string>;
  onClose: () => void;
  onSaved: (createdProviderIntegrated: boolean, providerLabel: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ModelDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dupId = draft.provider !== "" && draft.modelId.trim() !== "" && existingIds.has(`${draft.provider}:${draft.modelId.trim()}`);
  const canNext = canProceedFromStep(step, draft) && !(step === 2 && dupId);

  async function save() {
    const built = draftToCreateBody(draft);
    if (!built.ok) {
      setErr(built.error);
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const res = await authFetch("/api/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(built.body),
      });
      if (res.status === 201) {
        onSaved(providerIsIntegrated(built.body.provider), built.body.providerLabel);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(data.error ?? `Save failed (${res.status}).`);
    } catch {
      setErr("Save failed (network).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <h2 style={{ color: "#e6edf3", fontSize: 18, margin: 0 }}>Add a model</h2>
        <span style={{ color: "#6e7681", fontSize: 12 }}>Step {step} of {WIZARD_STEP_COUNT} — {WIZARD_STEPS[step - 1]}</span>
      </div>

      {step === 1 && (
        <div>
          <label style={label}>Which company makes this model?</label>
          {PROVIDER_OPTIONS.map((p) => {
            const integrated = providerIsIntegrated(p.id);
            return (
              <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", color: "#e6edf3", fontSize: 14, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="provider"
                  checked={draft.provider === p.id}
                  onChange={() => setDraft({ ...draft, provider: p.id })}
                />
                {p.label}
                {!integrated && <span style={{ color: "#d29922", fontSize: 11, fontWeight: 600 }}>[integration pending]</span>}
              </label>
            );
          })}
          {draft.provider !== "" && !providerIsIntegrated(draft.provider) && (
            <p style={{ color: "#d29922", fontSize: 12, marginTop: 8 }}>
              We haven’t connected {PROVIDER_OPTIONS.find((p) => p.id === draft.provider)?.label} yet — this model will save as
              “integration pending” (disabled, never run) until the connection is built. You’ll get the exact next step after saving.
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <label style={label}>Model id (the exact string the API expects)</label>
          <input
            style={input}
            value={draft.modelId}
            placeholder="e.g. claude-opus-4-9"
            onChange={(e) => setDraft({ ...draft, modelId: e.target.value })}
          />
          {dupId && <p style={{ color: "#ff7b72", fontSize: 12, marginTop: 6 }}>A model with this company + id already exists.</p>}
          <label style={label}>Friendly label (shown in dropdowns; optional)</label>
          <input
            style={input}
            value={draft.displayLabel}
            placeholder="e.g. Claude Opus 4.9"
            onChange={(e) => setDraft({ ...draft, displayLabel: e.target.value })}
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <label style={label}>Which thinking options should be offered for this model?</label>
          {ALL_THINKING_OPTIONS.map((t) => (
            <CheckRow
              key={t}
              checked={draft.thinkingOptions.includes(t)}
              label={THINKING_LABELS[t]}
              onToggle={() => setDraft({ ...draft, thinkingOptions: toggle(draft.thinkingOptions, t) })}
            />
          ))}
          <label style={label}>Where should this model appear?</label>
          {ALL_MENUS.map((mn) => (
            <CheckRow
              key={mn}
              checked={draft.menus.includes(mn)}
              label={MENU_LABELS[mn]}
              onToggle={() => setDraft({ ...draft, menus: toggle(draft.menus, mn) })}
            />
          ))}
        </div>
      )}

      {step === 4 && (
        <div>
          <label style={label}>Pricing — USD per 1 million tokens</label>
          {PRICING_FIELDS.map((f) => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
              <span style={{ color: "#e6edf3", fontSize: 13, width: 130 }}>{f.label}</span>
              <input
                style={{ ...input, width: 140 }}
                inputMode="decimal"
                value={draft.pricing[f.key]}
                placeholder="0.00"
                onChange={(e) => setDraft({ ...draft, pricing: { ...draft.pricing, [f.key]: e.target.value } })}
              />
            </div>
          ))}
          {!parsePricing(draft.pricing).ok && (
            <p style={{ color: "#6e7681", fontSize: 12 }}>Enter all four prices (use 0 if not applicable).</p>
          )}
        </div>
      )}

      {err && <p style={{ color: "#ff7b72", fontSize: 13, marginTop: 12 }}>{err}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button onClick={onClose} style={btn("ghost")}>Cancel</button>
        <div style={{ display: "flex", gap: 10 }}>
          {step > 1 && <button onClick={() => setStep(step - 1)} style={btn("ghost")}>‹ Back</button>}
          {step < WIZARD_STEP_COUNT ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext} style={{ ...btn("primary"), opacity: canNext ? 1 : 0.4 }}>Next ›</button>
          ) : (
            <button onClick={save} disabled={!canNext || saving} style={{ ...btn("primary"), opacity: canNext && !saving ? 1 : 0.4 }}>
              {saving ? "Saving…" : "Save model"}
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function CheckRow({ checked, label: text, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", color: "#e6edf3", fontSize: 14, cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      {text}
    </label>
  );
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

// --- Edit modal --------------------------------------------------------------

function EditModelModal({
  model,
  onClose,
  onSaved,
}: {
  model: AiModelRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [displayLabel, setDisplayLabel] = useState(model.displayLabel);
  const [menus, setMenus] = useState<AiPickerMenuId[]>(model.menus);
  const [thinking, setThinking] = useState<ThinkingOptionId[]>(model.thinkingOptions);
  const [enabled, setEnabled] = useState(model.enabled);
  const [pricing, setPricing] = useState<PricingDraft>({
    inputPerMillion: String(model.pricing.inputPerMillion),
    outputPerMillion: String(model.pricing.outputPerMillion),
    cacheWrite5mPerMillion: String(model.pricing.cacheWrite5mPerMillion),
    cacheReadPerMillion: String(model.pricing.cacheReadPerMillion),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const priced = parsePricing(pricing);
    if (!priced.ok) {
      setErr(priced.error);
      return;
    }
    if (thinking.length === 0) return setErr("Pick at least one thinking option.");
    if (menus.length === 0) return setErr("Pick at least one place for it to appear.");
    if (displayLabel.trim() === "") return setErr("Label can’t be empty.");
    setSaving(true);
    setErr(null);
    try {
      const res = await authFetch(`/api/ai-models/${encodeURIComponent(model.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayLabel: displayLabel.trim(),
          menus,
          thinkingOptions: thinking,
          enabled,
          pricing: priced.value,
        }),
      });
      if (res.ok) {
        onSaved();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(data.error ?? `Save failed (${res.status}).`);
    } catch {
      setErr("Save failed (network).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell>
      <h2 style={{ color: "#e6edf3", fontSize: 18, margin: "0 0 2px" }}>Edit model</h2>
      <p style={{ color: "#6e7681", fontSize: 12, margin: "0 0 8px" }}>
        {model.providerLabel} · {model.modelId} (company &amp; model id can’t be changed — delete &amp; re-add to change them)
      </p>

      <label style={label}>Friendly label</label>
      <input style={input} value={displayLabel} onChange={(e) => setDisplayLabel(e.target.value)} />

      <label style={label}>Appears in</label>
      {ALL_MENUS.map((mn) => (
        <CheckRow key={mn} checked={menus.includes(mn)} label={MENU_LABELS[mn]} onToggle={() => setMenus(toggle(menus, mn))} />
      ))}

      <label style={label}>Thinking options</label>
      {ALL_THINKING_OPTIONS.map((t) => (
        <CheckRow key={t} checked={thinking.includes(t)} label={THINKING_LABELS[t]} onToggle={() => setThinking(toggle(thinking, t))} />
      ))}

      <label style={label}>Pricing — USD per 1M tokens</label>
      {PRICING_FIELDS.map((f) => (
        <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
          <span style={{ color: "#e6edf3", fontSize: 13, width: 130 }}>{f.label}</span>
          <input
            style={{ ...input, width: 140 }}
            inputMode="decimal"
            value={pricing[f.key]}
            onChange={(e) => setPricing({ ...pricing, [f.key]: e.target.value })}
          />
        </div>
      ))}

      <CheckRow checked={enabled} label="Enabled (shown in dropdowns)" onToggle={() => setEnabled(!enabled)} />

      {err && <p style={{ color: "#ff7b72", fontSize: 13, marginTop: 12 }}>{err}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button onClick={onClose} style={btn("ghost")}>Cancel</button>
        <button onClick={save} disabled={saving} style={{ ...btn("primary"), opacity: saving ? 0.5 : 1 }}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </ModalShell>
  );
}

// --- Delete confirm ----------------------------------------------------------

function DeleteConfirm({ model, onClose, onDeleted }: { model: AiModelRecord; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const res = await authFetch(`/api/ai-models/${encodeURIComponent(model.id)}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted();
        return;
      }
      setErr(`Delete failed (${res.status}).`);
    } catch {
      setErr("Delete failed (network).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell width={440}>
      <h2 style={{ color: "#e6edf3", fontSize: 18, margin: "0 0 10px" }}>Remove this model?</h2>
      <p style={{ color: "#8b949e", fontSize: 14 }}>
        <strong style={{ color: "#e6edf3" }}>{model.displayLabel}</strong> ({model.modelId}) will be removed from every
        dropdown across the platform. This can’t be undone (you can re-add it later).
      </p>
      {err && <p style={{ color: "#ff7b72", fontSize: 13 }}>{err}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <button onClick={onClose} style={btn("ghost")}>Cancel</button>
        <button onClick={go} disabled={busy} style={{ ...btn("danger"), opacity: busy ? 0.5 : 1 }}>
          {busy ? "Removing…" : "Remove model"}
        </button>
      </div>
    </ModalShell>
  );
}

// --- Integration-pending popover (design decision D2) ------------------------

function PendingNotice({ text, onClose }: { text: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <ModalShell width={520}>
      <h2 style={{ color: "#e6edf3", fontSize: 18, margin: "0 0 12px" }}>◐ Integration pending</h2>
      <pre style={{ whiteSpace: "pre-wrap", color: "#c9d1d9", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: 14, fontSize: 13, lineHeight: 1.5, fontFamily: FONT, margin: 0 }}>
        {text}
      </pre>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(text).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          style={btn("ghost")}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
        <button onClick={onClose} style={btn("primary")}>Got it</button>
      </div>
    </ModalShell>
  );
}
