'use client';

const colors: Record<string, string> = {
  complete: '#16A34A',
  in_progress: '#2563EB',
  failed: '#DC2626',
  rejected: '#F59E0B',
  pending: '#71717A',
};

export default function StatusDot({ status }: { status: 'complete' | 'in_progress' | 'failed' | 'rejected' | 'pending' }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${status === 'in_progress' ? 'animate-pulse' : ''}`}
      style={{ backgroundColor: colors[status] }}
    />
  );
}
