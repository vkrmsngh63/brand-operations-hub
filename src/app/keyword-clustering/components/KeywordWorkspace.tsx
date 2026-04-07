'use client';
import { useEffect, useState, useCallback } from 'react';
import ASTTable from './ASTTable';
import MTTable from './MTTable';
import TIFTable from './TIFTable';
import { useKeywords } from '@/hooks/useKeywords';

interface KeywordWorkspaceProps {
  projectId: string;
  userId: string;
}

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

  const [tifKeywords, setTifKeywords] = useState<string[]>([]);
  const [tifActive, setTifActive] = useState(true);

  const addToTif = useCallback((kws: string[]) => {
    if (!tifActive) return;
    setTifKeywords(prev => {
      const existing = new Set(prev);
      const toAdd = kws.filter(kw => !existing.has(kw));
      if (toAdd.length === 0) return prev;
      return [...toAdd.reverse(), ...prev];
    });
  }, [tifActive]);

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
      {/* Left panel: AST + MT + TIF stacked vertically */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1.4',
        minHeight: 0,
        borderRight: '1px solid var(--border-dark, #30363d)',
      }}>
        {/* AST table — top third */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          borderBottom: '2px solid var(--border-dark, #30363d)',
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
            onAddToTif={addToTif}
          />
        </div>
        {/* MT table — middle third */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          borderBottom: '2px solid var(--border-dark, #30363d)',
        }}>
          <MTTable
            astKeywords={keywords}
            onUpdateKeyword={updateKeyword}
            onAddToTif={addToTif}
          />
        </div>
        {/* TIF table — bottom third */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}>
          <TIFTable
            astKeywords={keywords}
            tifKeywords={tifKeywords}
            onSetTifKeywords={setTifKeywords}
            onUpdateKeyword={updateKeyword}
          />
        </div>
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