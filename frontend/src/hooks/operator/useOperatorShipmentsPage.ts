import { useState } from 'react';
import { useCatalogQuery } from '@hooks';
import { useShipmentListQuery } from './operator.queries';
import { useUpdateShipmentStatus } from './operator.mutations';

const SHIPMENTS_PAGE_SIZE = 20;
const WAITING_FOR_GUIDE_STATUS = 'A la espera de guia';

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

  const setGuideDraft = (invoiceNumber: string, value: string) => {
    setGuideDrafts((prev) => ({ ...prev, [invoiceNumber]: value }));
  };

  const advance = (invoiceNumber: string, currentStatusName: string) => {
    const requiresGuide = currentStatusName === WAITING_FOR_GUIDE_STATUS;
    const deliveryGuide = guideDrafts[invoiceNumber]?.trim();
    if (requiresGuide && !deliveryGuide) return;

    updateShipmentStatus.mutate(
      { invoiceNumber, deliveryGuide: deliveryGuide || undefined },
      { onSuccess: () => setGuideDraft(invoiceNumber, '') },
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
    requiresGuide: (statusName: string) => statusName === WAITING_FOR_GUIDE_STATUS,
  };
}
