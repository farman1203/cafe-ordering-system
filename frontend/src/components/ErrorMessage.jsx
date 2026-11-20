import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-box state-box--error" role="alert">
      <AlertTriangle size={36} />
      <h3>Oops! Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn--primary" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}
