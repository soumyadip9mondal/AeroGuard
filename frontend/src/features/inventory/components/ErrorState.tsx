import React from 'react';

interface ErrorStateProps {
  message?: string;
  error?: Error;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, error, onRetry }) => (
  <div className="rounded-lg border border-danger/30 bg-danger-subtle p-6 text-center">
    <p className="text-sm text-danger">{message || error?.message || 'Something went wrong'}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-3 text-xs text-accent underline">
        Retry
      </button>
    )}
  </div>
);

export default ErrorState;
