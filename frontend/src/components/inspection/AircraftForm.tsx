'use client';

import { useInspectionStore } from '@/stores/inspection.store';
import { INSPECTION_TYPES } from '@/config/constants';
import { ArrowRight } from 'lucide-react';

export default function AircraftForm({ onNext }: { onNext: () => void }) {
  const { aircraftModel, registrationNumber, tailNumber, inspectionType, setField } = useInspectionStore();
  const isValid = aircraftModel && registrationNumber && tailNumber && inspectionType;

  return (
    <div className="animate-slide-up space-y-5">
      <div>
        <h2 className="text-[18px] font-medium text-text-primary mb-1">Aircraft Information</h2>
        <p className="text-[13px] text-text-secondary">Enter the aircraft details for this inspection.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="model" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Aircraft Model</label>
          <input id="model" value={aircraftModel} onChange={(e) => setField('aircraftModel', e.target.value)} placeholder="e.g. Boeing 737-800" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
        </div>
        <div>
          <label htmlFor="reg" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Registration Number</label>
          <input id="reg" value={registrationNumber} onChange={(e) => setField('registrationNumber', e.target.value.toUpperCase())} placeholder="e.g. N73742" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary uppercase placeholder:text-text-tertiary placeholder:normal-case outline-none transition-colors focus:border-accent" />
        </div>
        <div>
          <label htmlFor="tail" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Tail Number</label>
          <input id="tail" value={tailNumber} onChange={(e) => setField('tailNumber', e.target.value.toUpperCase())} placeholder="e.g. N-737AB" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] font-mono text-text-primary placeholder:text-text-tertiary placeholder:font-sans outline-none transition-colors focus:border-accent" />
        </div>
        <div>
          <label htmlFor="type" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Inspection Type</label>
          <select id="type" value={inspectionType} onChange={(e) => setField('inspectionType', e.target.value)} className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-accent appearance-none">
            <option value="" className="bg-elevated text-text-tertiary">Select inspection type</option>
            {INSPECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-elevated">{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={onNext} disabled={!isValid} className="flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed">
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
