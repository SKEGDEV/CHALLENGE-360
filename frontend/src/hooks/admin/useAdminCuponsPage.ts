import { useState } from 'react';
import { useCatalogQuery } from '@hooks';
import { useAdminCuponDetailQuery, useAdminCuponListQuery } from './admin.queries';
import { useDeleteCupon } from './admin.mutations';

const ADMIN_PAGE_SIZE = 20;

export function useAdminCuponsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const { data, isPending, isError, error, refetch } = useAdminCuponListQuery({
    pageNumber,
    pageSize: ADMIN_PAGE_SIZE,
  });

  const { data: catalog } = useCatalogQuery();
  const cuponTypes = catalog?.CatCuponType ?? [];
  const productTypes = catalog?.CatProductType ?? [];

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isPending: isDetailPending } = useAdminCuponDetailQuery(editingId ?? 0);

  const deleteCupon = useDeleteCupon();

  const openCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (idCupon: number) => {
    setEditingId(idCupon);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  return {
    cupones: data?.items ?? [],
    pageNumber,
    totalPages: data?.totalPages ?? 1,
    setPageNumber,
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
    cuponTypes,
    productTypes,
    isFormOpen,
    editingId,
    isDetailLoading: editingId !== null && isDetailPending,
    detail: editingId !== null ? (detail ?? null) : null,
    openCreate,
    openEdit,
    closeForm,
    deleteCupon,
  };
}
