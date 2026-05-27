'use client';

import type { ChangeEvent, JSX } from 'react';

import {
  EXECUTION_MODE_LABELS,
  EXECUTION_MODES,
  isExecutionMode,
  type ExecutionMode,
} from './execution-mode.ts';

export interface ExecutionModeSelectProps {
  value: ExecutionMode;
  onChange: (mode: ExecutionMode) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function ExecutionModeSelect({
  value,
  onChange,
  disabled,
  id,
  className,
}: ExecutionModeSelectProps): JSX.Element {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (isExecutionMode(next)) onChange(next);
  };

  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={handleChange}
      disabled={disabled}
    >
      {EXECUTION_MODES.map(mode => (
        <option key={mode} value={mode}>
          {EXECUTION_MODE_LABELS[mode]}
        </option>
      ))}
    </select>
  );
}
