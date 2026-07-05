import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;
  const isPlaceholder = !value;

  return (
    <div ref={ref} className={"relative min-w-0 " + (className ?? "")}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={
          "appearance-none flex items-center gap-2 w-full min-w-[140px] sm:min-w-[155px] " +
          "rounded-md border border-solid border-border-subtle bg-elevated shadow-none " +
          "px-3 py-2 text-[13px] cursor-pointer transition-colors " +
          "outline-none ring-0 focus:outline-none focus:ring-0 focus:shadow-none " +
          (open ? "border-accent " : "hover:border-border-default ") +
          (isPlaceholder ? "text-text-secondary" : "text-text-primary")
        }
      >
        <span className="flex-1 text-center truncate">{selectedLabel}</span>
        <ChevronDown
          className={
            "h-3.5 w-3.5 shrink-0 text-text-tertiary transition-transform duration-150 " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-[240px] overflow-y-auto rounded-lg border border-border-default bg-elevated shadow-lg animate-fade-in py-1">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[13px] text-text-tertiary text-center">
              No options
            </div>
          ) : (
            <>
              {/* Placeholder / clear option */}
              <div
                onClick={() => { onChange(''); setOpen(false); }}
                className={
                  "px-3 py-2 text-[13px] text-center cursor-pointer transition-colors " +
                  (!value ? "text-text-primary bg-accent-subtle" : "text-text-tertiary hover:bg-[rgba(255,255,255,0.04)]")
                }
              >
                {placeholder}
              </div>

              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={
                    "px-3 py-2 text-[13px] text-center cursor-pointer transition-colors " +
                    (opt.value === value
                      ? "text-text-primary bg-accent-subtle"
                      : "text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.04)]")
                  }
                >
                  {opt.label}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
