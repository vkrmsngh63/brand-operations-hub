'use client';

import { useEffect } from 'react';
import ASTTable from './ASTTable';
import { useKeywords } from '@/hooks/useKeywords';

interface KeywordWorkspaceProps {
  projectId: string;
  userId: string;
}

/**
 * KeywordWorkspace — connects ASTTable to the API via useKeywords hook.
 * Drop this into the keyword-clustering page when a project is open.
 *
 * Usage in keyword-clustering/page.tsx:
 *   {activeProjectId && <KeywordWorkspace projectId={activeProjectId} />}
 */
export default function KeywordWorkspace({ projectId, userId }: KeywordWorkspaceProps) {
  const {
    keywords,
    loading,
    fetchKeywords,
    addKeyword,
    bulkImport,
    updateKeyword,
    batchUpdate,
    deleteKeyword,
    bulkDelete,
    reorder,
  } = useKeywords(projectId, userId);

  // Fetch keywords when project changes
  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
    }}>
      {/* Left panel: AST table (will later include MT + TIF panels) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1.4',
        minHeight: 0,
        borderRight: '1px solid var(--border-dark, #30363d)',
      }}>
        <ASTTable
          keywords={keywords}
          onAddKeyword={addKeyword}
          onBulkImport={bulkImport}
          onUpdateKeyword={updateKeyword}
          onBatchUpdate={batchUpdate}
          onDeleteKeyword={deleteKeyword}
          onBulkDelete={bulkDelete}
          onReorder={reorder}
          loading={loading}
        />
      </div>

      {/* Right panel: Canvas placeholder (Phase 1d) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-l, #8b949e)',
        fontSize: 13,
        fontFamily: 'var(--fn-ui)',
        background: 'var(--bg-panel, #161b22)',
      }}>
        Topics Layout Canvas — coming in Phase 1d
      </div>
    </div>
  );
}