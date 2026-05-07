import { useEffect, useState } from 'react';
import {
  listProjects,
  PlosApiError,
  type ExtensionProject,
} from '../../../lib/api-client.ts';

interface Props {
  selectedProjectId: string | null;
  onChange: (projectId: string | null) => void;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; projects: ExtensionProject[] }
  | { kind: 'error'; message: string };

export function ProjectPicker({ selectedProjectId, onChange }: Props) {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    listProjects()
      .then((projects) => {
        if (cancelled) return;
        setState({ kind: 'ready', projects });
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof PlosApiError
            ? `Couldn't load your projects (${err.status}): ${err.message}`
            : err instanceof Error
              ? `Couldn't load your projects: ${err.message}`
              : `Couldn't load your projects.`;
        setState({ kind: 'error', message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="field-block">
      <label htmlFor="project-picker">Project</label>
      {state.kind === 'loading' && (
        <p className="muted">Loading your projects…</p>
      )}
      {state.kind === 'error' && <div className="error">{state.message}</div>}
      {state.kind === 'ready' && state.projects.length === 0 && (
        <p className="muted">
          No projects yet. Create one at{' '}
          <a href="https://vklf.com/projects" target="_blank" rel="noreferrer">
            vklf.com/projects
          </a>
          .
        </p>
      )}
      {state.kind === 'ready' && state.projects.length > 0 && (
        <select
          id="project-picker"
          value={selectedProjectId ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            onChange(value === '' ? null : value);
          }}
        >
          <option value="">Pick a project…</option>
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
