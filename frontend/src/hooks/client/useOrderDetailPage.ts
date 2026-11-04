import { useInvoiceDetailQuery } from './client.queries';

export function useOrderDetailPage(idInvoice: number) {
  const { data, isPending, isError, error, refetch } = useInvoiceDetailQuery(idInvoice);

  return {
    invoice: data ?? null,
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
  };
}
