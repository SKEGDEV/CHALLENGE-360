import { useState } from 'react';
import { ApiError } from '@core';
import { useCatalogQuery } from '@hooks';
import { useShipmentListQuery } from './operator.queries';
import { useUpdateShipmentStatus } from './operator.mutations';

const SHIPMENTS_PAGE_SIZE = 20;

export function useOperatorShipmentsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [idShipmentStatus, setIdShipmentStatus] = useState<number | null>(null);

  const { data, isPending, isError, error, refetch } = useShipmentListQuery({
    pageNumber,
    pageSize: SHIPMENTS_PAGE_SIZE,
    idShipmentStatus: idShipmentStatus ?? undefined,
  });

  const { data: catalog } = useCatalogQuery();
  const shipmentStatuses = catalog?.CatShippmentStatus ?? [];

  const updateShipmentStatus = useUpdateShipmentStatus();
  const [guideDrafts, setGuideDrafts] = useState<Record<string, string>>({});
  const [advanceError, setAdvanceError] = useState<string | null>(null);

  const setGuideDraft = (invoiceNumber: string, value: string) => {
    setGuideDrafts((prev) => ({ ...prev, [invoiceNumber]: value }));
  };

  const advance = (invoiceNumber: string, hasGuideAlready: boolean) => {
    setAdvanceError(null);
    const deliveryGuide = guideDrafts[invoiceNumber]?.trim();
    if (!hasGuideAlready && !deliveryGuide) {
      setAdvanceError('Ingresa el numero de guia antes de avanzar el estado.');
      return;
    }

    updateShipmentStatus.mutate(
      { invoiceNumber, deliveryGuide: hasGuideAlready ? undefined : deliveryGuide },
      {
        onSuccess: () => setGuideDraft(invoiceNumber, ''),
        onError: (error) => {
          setAdvanceError(error instanceof ApiError ? error.message : 'No se pudo avanzar el estado del envio.');
        },
      },
    );
  };

  return {
    shipments: data?.items ?? [],
    pageNumber,
    totalPages: data?.totalPages ?? 1,
    setPageNumber,
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
    shipmentStatuses,
    idShipmentStatus,
    setIdShipmentStatus: (value: number | null) => {
      setIdShipmentStatus(value);
      setPageNumber(1);
    },
    guideDrafts,
    setGuideDraft,
    advance,
    isAdvancing: updateShipmentStatus.isPending,
    advanceError,
  };
}
