'use client';

import { useInspectionStore } from '@/stores/inspection.store';
import TopBar from '@/components/layout/TopBar';
import AircraftForm from '@/components/inspection/AircraftForm';
import VideoUploadZone from '@/components/inspection/VideoUploadZone';
import PipelineProgress from '@/components/inspection/PipelineProgress';
import { CheckCircle2 } from 'lucide-react';

const steps = ['Aircraft Details', 'Upload Video', 'AI Pipeline'];

export default function NewInspectionPage() {
  const { currentStep, setStep } = useInspectionStore();

  return (
    <div className="min-h-screen bg-base">
      <TopBar title="New Inspection" subtitle="Start a new AI-powered inspection" />
      <div className="page-enter mx-auto max-w-[720px] px-6 py-8">
        {/* Step Indicator */}
        <div className="mb-10 flex items-center justify-center gap-0">
          {steps.map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === currentStep;
            const isComplete = stepNum < currentStep;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-medium transition-all ${
                      isComplete
                        ? 'bg-success text-white'
                        : isActive
                        ? 'bg-accent text-white'
                        : 'border border-border-default bg-surface text-text-tertiary'
                    }`}
                  >
                    {isComplete ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className={`mt-2 text-[11px] font-medium ${isActive ? 'text-text-primary' : 'text-text-tertiary'}`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`mx-3 mb-5 h-px w-16 ${isComplete ? 'bg-success' : 'bg-border-subtle'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {currentStep === 1 && <AircraftForm onNext={() => setStep(2)} />}
        {currentStep === 2 && <VideoUploadZone onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {currentStep === 3 && <PipelineProgress />}
      </div>
    </div>
  );
}
