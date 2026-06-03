"use client";

// P-63 Phase 2c (2026-06-03) — the live model-picker hook. Replaces the 8
// consumers' direct getModelsForMenu(menu) seed read so admin edits on the
// /ai-models screen propagate to every dropdown WITHOUT a deploy.
//
// Behavior-preserving by construction:
//  - Initial state = the in-code seed filtered for this menu (selectMenuModels),
//    so the dropdown renders the correct options instantly, with no empty flash,
//    and keeps working if the network/API is unavailable.
//  - Then it fetches the live registry from /api/ai-models (DB-backed) and, only
//    if that returns a non-empty list for the menu, swaps it in. The same
//    enabled+runnable+menu filter (selectMenuModels) applies, so an
//    integration-pending or disabled model can never become selectable.
//
// For today's data (DB seeded identically to the in-code list) the live list
// equals the seed list in the same order — zero visible change.

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { getAiModelRegistry, selectMenuModels } from './registry';
import type { AiModelRecord, AiPickerMenuId } from './types';

export function useModelsForMenu(menu: AiPickerMenuId): AiModelRecord[] {
  const [models, setModels] = useState<AiModelRecord[]>(() =>
    selectMenuModels(getAiModelRegistry(), menu)
  );

  useEffect(() => {
    let cancelled = false;
    authFetch('/api/ai-models', { method: 'GET' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { models?: AiModelRecord[] } | null) => {
        if (cancelled || !data?.models) return;
        const live = selectMenuModels(data.models, menu);
        // Never blank an otherwise-working dropdown if the live list is empty.
        if (live.length > 0) setModels(live);
      })
      .catch(() => {
        /* keep the seed fallback on any error */
      });
    return () => {
      cancelled = true;
    };
  }, [menu]);

  return models;
}
