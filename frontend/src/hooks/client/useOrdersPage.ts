import { useInvoiceListQuery } from './client.queries';

export function useOrdersPage() {
  const { data, isPending, isError, error, refetch } = useInvoiceListQuery({ pageSize: 20 });

  return {
    invoices: data?.items ?? [],
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
  };
}
