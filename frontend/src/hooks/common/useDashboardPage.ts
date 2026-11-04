import { useDashboardQuery } from './common.queries';

export function useDashboardPage() {
  const { data, isPending, isError, error, refetch } = useDashboardQuery();

  return {
    dashboard: data ?? null,
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
  };
}
