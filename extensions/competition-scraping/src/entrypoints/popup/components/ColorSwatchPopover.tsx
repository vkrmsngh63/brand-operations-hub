import { useEffect, useRef } from 'react';
import { COLOR_PALETTE } from '../../../lib/color-palette.ts';

interface Props {
  selectedHex: string;
  onPick: (hex: string) => void;
  onClose: () => void;
}

/**
 * 4×5 grid of the 20 palette swatches. Closes on outside-click + Esc.
 *
 * Anchoring is the parent's responsibility — this component just renders the
 * popover and wires the dismiss paths.
 */
export function ColorSwatchPopover({ selectedHex, onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const normalizedSelected = selectedHex.trim().toUpperCase();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    function handleDown(e: MouseEvent) {
      const node = ref.current;
      if (!node) return;
      if (e.target instanceof Node && !node.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    // Listen on mousedown so the popover dismisses before any synthetic
    // click on the underlying element fires.
    document.addEventListener('mousedown', handleDown);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleDown);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="swatch-popover" role="dialog" aria-label="Pick a color">
      <div className="swatch-grid">
        {COLOR_PALETTE.map((c) => {
          const isSelected = c.hex === normalizedSelected;
          return (
            <button
              key={c.hex}
              type="button"
              className={
                'swatch-cell' +
                (isSelected ? ' swatch-cell-selected' : '') +
                (c.isLight ? ' swatch-cell-light' : ' swatch-cell-dark')
              }
              style={{ backgroundColor: c.hex }}
              title={c.name}
              aria-label={c.name}
              aria-pressed={isSelected}
              onClick={() => onPick(c.hex)}
            />
          );
        })}
      </div>
    </div>
  );
}
