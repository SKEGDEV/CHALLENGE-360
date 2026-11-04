import { useMemo } from 'react';
import { HOME_PAGE_SIZE } from './common.keys';
import { useProductListQuery } from './common.queries';

export function useProductDetailPage(idProduct: number) {
  const { data, isPending, isError, error, refetch } = useProductListQuery({ pageSize: HOME_PAGE_SIZE });

  const product = useMemo(() => data?.items.find((item) => item.idProduct === idProduct) ?? null, [data, idProduct]);

  return {
    product,
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    notFound: !isPending && !isError && product === null,
    onRetry: () => void refetch(),
  };
}
