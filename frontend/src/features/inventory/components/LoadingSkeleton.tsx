import React from 'react';

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 animate-pulse rounded bg-slate-200" />
    ))}
  </div>
);

export default LoadingSkeleton;
