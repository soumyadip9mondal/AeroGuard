import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, message }) => (
  <div className="rounded-lg border border-border-subtle bg-surface p-8 text-center">
    <h3 className="text-sm font-medium text-text-primary">{title || message || 'No data found'}</h3>
    {description && <p className="mt-1 text-xs text-text-secondary">{description}</p>}
  </div>
);

export default EmptyState;
