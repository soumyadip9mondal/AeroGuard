'use client';

import { useState } from 'react';
import { useInspectionStore } from '@/stores/inspection.store';
import { INSPECTION_TYPES } from '@/config/constants';
import { ArrowRight, AlertCircle } from 'lucide-react';

function validateIndianTailNumber(tailNumber: string): boolean {
  if (!tailNumber) return false;
  const cleanTail = tailNumber.trim().toUpperCase();
  const structuralRegex = /^VT-[A-Z]{3}$/;
  if (!structuralRegex.test(cleanTail)) return false;
  const suffix = cleanTail.split('-')[1];
  const forbiddenSuffixes = ['SOS', 'PAN', 'ASS', 'XXX', 'GOV', 'MIL'];
  if (forbiddenSuffixes.includes(suffix)) return false;
  if (suffix.startsWith('Q')) return false;
  return true;
}

export default function AircraftForm({ onNext }: { onNext: () => void }) {
  const { 
    aircraftMake, aircraftModel, airframeSerialNumber, yearOfManufacture,
    engineMake, engineModel, engineSerialNumber,
    propellerMakeModel, propellerSerialNumber,
    totalAirframeTime, totalEngineHours,
    registrationNumber, inspectionType, setField 
  } = useInspectionStore();

  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    // Validation
    if (!aircraftMake || !aircraftModel || !airframeSerialNumber || !yearOfManufacture) {
      setError('Please fill in all core airframe details.');
      return;
    }
    if (!engineMake || !engineModel || !engineSerialNumber) {
      setError('Please fill in all powerplant details.');
      return;
    }
    if (!totalAirframeTime || !totalEngineHours) {
      setError('Please fill in all lifespan details.');
      return;
    }
    if (!registrationNumber || !validateIndianTailNumber(registrationNumber)) {
      setError('Invalid Indian Registration Number. Must be in VT-XXX format without forbidden terms.');
      return;
    }
    if (!inspectionType) {
      setError('Please select an inspection type.');
      return;
    }
    
    const yom = parseInt(yearOfManufacture);
    if (isNaN(yom) || yom < 1900 || yom > new Date().getFullYear()) {
      setError('Please enter a valid Year of Manufacture.');
      return;
    }

    const tat = parseFloat(totalAirframeTime);
    if (isNaN(tat) || tat < 0) {
      setError('Please enter a valid Total Airframe Time.');
      return;
    }

    const teh = parseFloat(totalEngineHours);
    if (isNaN(teh) || teh < 0) {
      setError('Please enter valid Total Engine Hours.');
      return;
    }

    setError(null);
    onNext();
  };

  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <h2 className="text-[18px] font-medium text-text-primary mb-1">Aircraft Information</h2>
        <p className="text-[13px] text-text-secondary">Enter the universal data points that define the physical machine.</p>
      </div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Core Airframe */}
        <section className="space-y-4">
          <h3 className="text-[14px] font-medium text-text-primary border-b border-border-subtle pb-2">Core Airframe Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Registration / Tail Number</label>
              <input value={registrationNumber} onChange={(e) => { setField('registrationNumber', e.target.value.toUpperCase()); setField('tailNumber', e.target.value.toUpperCase()); }} placeholder="e.g. VT-IXD" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary uppercase placeholder:text-text-tertiary placeholder:normal-case outline-none transition-colors focus:border-accent" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Aircraft Make</label>
              <input value={aircraftMake} onChange={(e) => setField('aircraftMake', e.target.value)} placeholder="e.g. Airbus, Boeing" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Aircraft Model</label>
              <input value={aircraftModel} onChange={(e) => setField('aircraftModel', e.target.value)} placeholder="e.g. A320-251N" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Airframe Serial Number</label>
              <input value={airframeSerialNumber} onChange={(e) => setField('airframeSerialNumber', e.target.value)} placeholder="e.g. 19420" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Year of Manufacture</label>
              <input type="number" value={yearOfManufacture} onChange={(e) => setField('yearOfManufacture', e.target.value)} placeholder="e.g. 2019" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Inspection Type</label>
              <select value={inspectionType} onChange={(e) => setField('inspectionType', e.target.value)} className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary outline-none transition-colors focus:border-accent appearance-none">
                <option value="" className="bg-elevated text-text-tertiary">Select type</option>
                {INSPECTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-elevated">{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Powerplant */}
        <section className="space-y-4">
          <h3 className="text-[14px] font-medium text-text-primary border-b border-border-subtle pb-2">Powerplant (Engine) Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Engine Make</label>
              <input value={engineMake} onChange={(e) => setField('engineMake', e.target.value)} placeholder="e.g. CFM International" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Engine Model</label>
              <input value={engineModel} onChange={(e) => setField('engineModel', e.target.value)} placeholder="e.g. LEAP-1A26" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Engine Serial Number(s)</label>
              <input value={engineSerialNumber} onChange={(e) => setField('engineSerialNumber', e.target.value)} placeholder="e.g. 592300, 592301" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
          </div>
        </section>

        {/* Lifespan */}
        <section className="space-y-4">
          <h3 className="text-[14px] font-medium text-text-primary border-b border-border-subtle pb-2">Lifespan & Hardware State</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Total Airframe Time (hrs)</label>
              <input type="number" step="0.1" value={totalAirframeTime} onChange={(e) => setField('totalAirframeTime', e.target.value)} placeholder="e.g. 15200.5" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Total Engine Hours (hrs)</label>
              <input type="number" step="0.1" value={totalEngineHours} onChange={(e) => setField('totalEngineHours', e.target.value)} placeholder="e.g. 8400.0" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
          </div>
        </section>

        {/* Propeller (Optional) */}
        <section className="space-y-4 opacity-80">
          <h3 className="text-[14px] font-medium text-text-primary border-b border-border-subtle pb-2">Propeller/Rotor Details <span className="text-text-tertiary font-normal">(If Applicable)</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Propeller Make & Model</label>
              <input value={propellerMakeModel} onChange={(e) => setField('propellerMakeModel', e.target.value)} placeholder="e.g. McCauley" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary truncate">Propeller Serial Number(s)</label>
              <input value={propellerSerialNumber} onChange={(e) => setField('propellerSerialNumber', e.target.value)} placeholder="e.g. 193822" className="w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent" />
            </div>
          </div>
        </section>

      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger-subtle px-4 py-3 text-[13px] text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-border-subtle">
        <button onClick={handleNext} className="mt-4 flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed">
          Verify & Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
