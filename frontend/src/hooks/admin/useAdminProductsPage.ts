import { useState } from 'react';
import { useProductListQuery } from '@hooks';
import { useDeleteProduct } from './admin.mutations';

const ADMIN_PAGE_SIZE = 20;

export function useAdminProductsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isPending, isError, error, refetch } = useProductListQuery({
    pageNumber,
    pageSize: ADMIN_PAGE_SIZE,
    productName: search.trim() || undefined,
  });

  const deleteProduct = useDeleteProduct();

  return {
    products: data?.items ?? [],
    pageNumber,
    totalPages: data?.totalPages ?? 1,
    setPageNumber,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPageNumber(1);
    },
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
    deleteProduct,
  };
}
