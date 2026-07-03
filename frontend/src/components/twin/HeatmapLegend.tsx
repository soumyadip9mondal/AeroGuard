export default function HeatmapLegend() {
  return (
    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex max-w-[calc(100vw-32px)] sm:max-w-none flex-wrap items-center gap-2 sm:gap-1.5 rounded-lg border border-border-subtle bg-surface/90 px-3 py-2 backdrop-blur-sm shadow-sm z-[30]">
      <span className="text-[10px] font-medium text-text-tertiary mr-1">Severity</span>
      {[
        { label: 'Minor', color: '#16A34A' },
        { label: 'Moderate', color: '#D97706' },
        { label: 'Major', color: '#EA580C' },
        { label: 'Critical', color: '#DC2626' },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
          <span className="text-[10px] text-text-tertiary">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
