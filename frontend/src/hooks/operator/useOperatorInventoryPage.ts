import { useState } from 'react';
import { useProductListQuery } from '@hooks';
import { useAdjustInventory } from './operator.mutations';

const INVENTORY_PAGE_SIZE = 50;

export function useOperatorInventoryPage() {
  const [search, setSearch] = useState('');
  const { data, isPending, isError, error, refetch } = useProductListQuery({
    pageSize: INVENTORY_PAGE_SIZE,
    productName: search.trim() || undefined,
  });

  const adjustInventory = useAdjustInventory();
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>({});

  const setQuantityDraft = (sku: string, value: string) => {
    setQuantityDrafts((prev) => ({ ...prev, [sku]: value }));
  };

  const adjust = (sku: string, type: 'sumar' | 'restar') => {
    const quantity = Number(quantityDrafts[sku] ?? '0');
    if (!quantity || quantity <= 0) return;

    adjustInventory.mutate(
      { inventory: [{ idProductVariant: sku, quantityToAdd: quantity, type }] },
      { onSuccess: () => setQuantityDraft(sku, '') },
    );
  };

  return {
    products: data?.items ?? [],
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
    search,
    setSearch,
    quantityDrafts,
    setQuantityDraft,
    adjust,
    isAdjusting: adjustInventory.isPending,
  };
}
