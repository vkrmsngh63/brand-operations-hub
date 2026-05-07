import { PLATFORMS } from '../../../lib/platforms.ts';

interface Props {
  selectedPlatform: string | null;
  onChange: (platform: string | null) => void;
}

export function PlatformPicker({ selectedPlatform, onChange }: Props) {
  return (
    <div className="field-block">
      <label htmlFor="platform-picker">Platform</label>
      <select
        id="platform-picker"
        value={selectedPlatform ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          onChange(value === '' ? null : value);
        }}
      >
        <option value="">Pick a platform…</option>
        {PLATFORMS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <p className="muted muted-help">
        We need this even on Amazon/Ebay/Etsy/Walmart so we can tell apart
        URLs found via Google Shopping, Google Ads, and independent websites.
      </p>
    </div>
  );
}
