import { type LucideIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="mb-4 h-10 w-10 text-text-tertiary/40" />
      <h3 className="mb-1 text-[16px] font-medium text-text-secondary">{title}</h3>
      <p className="max-w-[320px] text-[13px] text-text-tertiary">{description}</p>
    </div>
  );
}
