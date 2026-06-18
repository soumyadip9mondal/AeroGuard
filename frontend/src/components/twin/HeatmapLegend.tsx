export default function HeatmapLegend() {
  return (
    <div className="absolute bottom-6 left-6 flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface/90 px-3 py-2 backdrop-blur-sm">
      <span className="text-[10px] font-medium text-text-tertiary mr-1">Severity</span>
      {[
        { label: 'Minor', color: '#16A34A' },
        { label: 'Moderate', color: '#D97706' },
        { label: 'Major', color: '#EA580C' },
        { label: 'Critical', color: '#DC2626' },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="text-[10px] text-text-tertiary">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
