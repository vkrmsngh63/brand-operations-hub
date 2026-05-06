// Pure-logic split from status-badge.tsx so the palette is testable via
// node --test --experimental-strip-types (which can't process .tsx files).
//
// Source of truth for what users see when each status is rendered. Tests
// pin the labels because changing them changes user-visible copy across
// every workflow at once.

import type { WorkflowStatus } from './types';

export interface StatusBadgePaletteEntry {
  bg: string;
  color: string;
  border: string;
  label: string;
}

export const STATUS_BADGE_PALETTE: Record<WorkflowStatus, StatusBadgePaletteEntry> = {
  inactive: {
    bg: 'rgba(139, 148, 158, 0.15)',
    color: '#8b949e',
    border: '#8b949e40',
    label: 'Not started',
  },
  active: {
    bg: 'rgba(212, 167, 44, 0.15)',
    color: '#d4a72c',
    border: '#d4a72c40',
    label: 'In progress',
  },
  completed: {
    bg: 'rgba(35, 134, 54, 0.15)',
    color: '#3fb950',
    border: '#3fb95040',
    label: 'Completed',
  },
  'submitted-for-review': {
    bg: 'rgba(31, 111, 235, 0.15)',
    color: '#58a6ff',
    border: '#58a6ff40',
    label: 'Awaiting review',
  },
  'revision-requested': {
    bg: 'rgba(219, 109, 40, 0.15)',
    color: '#f0883e',
    border: '#f0883e40',
    label: 'Revisions requested',
  },
};

export const STATUS_BADGE_LOADING_PALETTE: StatusBadgePaletteEntry = {
  bg: 'rgba(139, 148, 158, 0.08)',
  color: '#6e7681',
  border: '#6e768140',
  label: 'Loading…',
};

export const STATUS_BADGE_LOADING_LABEL = STATUS_BADGE_LOADING_PALETTE.label;
