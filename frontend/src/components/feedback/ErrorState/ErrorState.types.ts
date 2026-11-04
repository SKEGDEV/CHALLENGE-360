export interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}
