import { store } from '../config/store';
import { TAG_GROUPS } from '../data/tags';
import { ChevronDownIcon, MinusIcon, PlusIcon } from './icons';

interface StepperProps {
  value: number;
  min?: number;
  onChange: (value: number) => void;
  /** Read by screen readers, e.g. "Product 1 quantity". */
  label?: string;
}

export function Stepper({ value, min = 0, onChange, label }: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)}>
        <MinusIcon />
      </button>
      <span className="stepper-value" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        <PlusIcon />
      </button>
    </div>
  );
}

/** Tag chips grouped by type: used by the Filters panel and the admin product form. */
export function TagGroups({ selected, onToggle, small }: { selected: string[]; onToggle: (tag: string) => void; small?: boolean }) {
  return (
    <>
      {TAG_GROUPS.map((group) => (
        <div key={group.name} className="tag-group">
          <div className="tag-group-title">{group.name}</div>
          <div className={`chips${small ? ' chips--sm' : ''}`}>
            {group.tags.map((tag) => {
              const on = selected.includes(tag);
              return (
                <button key={tag} type="button" className={`chip${on ? ' chip--on' : ''}`} aria-pressed={on} onClick={() => onToggle(tag)}>
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export const COUNTRY_CODES = [
  { iso: 'AU', dial: '+61' },
  { iso: 'NZ', dial: '+64' },
  { iso: 'GB', dial: '+44' },
  { iso: 'US', dial: '+1' },
  { iso: 'VN', dial: '+84' },
  { iso: 'CN', dial: '+86' },
];

/** "AU +61 ⌄" picker; the transparent native select on top keeps it accessible. */
export function CountryCode({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const current = COUNTRY_CODES.find((c) => c.iso === value) ?? COUNTRY_CODES[0];
  return (
    <span className="cc">
      <span className="cc-iso">{current.iso}</span>
      <span>{current.dial}</span>
      <ChevronDownIcon className="cc-chevron" />
      <select value={current.iso} onChange={(e) => onChange(e.target.value)} aria-label="Country code">
        {COUNTRY_CODES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.iso} {c.dial}
          </option>
        ))}
      </select>
    </span>
  );
}

export function PoweredBy({ className }: { className: string }) {
  return (
    <div className={className}>
      Powered by&nbsp;
      <a href={store.poweredBy.url} target="_blank" rel="noreferrer">
        {store.poweredBy.label}
      </a>
    </div>
  );
}
