import { Button, EmptyState, ErrorState, Input, Spinner, Table } from '@components';
import { useOperatorInventoryPage } from '@hooks';
import styles from './OperatorInventoryPage.module.scss';

interface InventoryRow {
  key: string;
  sku: string;
  productName: string;
  size: string | null;
  color: string | null;
  quantity: number;
}

export function OperatorInventoryPage() {
  const { products, isLoading, isError, errorMessage, onRetry, search, setSearch, quantityDrafts, setQuantityDraft, adjust, isAdjusting } =
    useOperatorInventoryPage();

  const rows: InventoryRow[] = products.flatMap((product) =>
    product.variants.map((variant) => ({
      key: `${product.idProduct}-${variant.idVariant}`,
      sku: variant.sku,
      productName: product.productName,
      size: variant.size,
      color: variant.color,
      quantity: variant.quantity,
    })),
  );

  return (
    <div className={styles.page}>
      <h1>Inventario</h1>

      <div className={styles.toolbar}>
        <Input icon="search" placeholder="Buscar producto..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState description={errorMessage ?? 'No se pudo cargar el inventario.'} onRetry={onRetry} />
      ) : rows.length === 0 ? (
        <EmptyState icon="boxes" title="No hay variantes." description="No se encontraron productos para este filtro." />
      ) : (
        <Table
          rowKey={(row) => row.key}
          columns={[
            { key: 'product', header: 'Producto', render: (row) => row.productName },
            { key: 'sku', header: 'SKU', render: (row) => row.sku },
            { key: 'variant', header: 'Variante', render: (row) => [row.color, row.size].filter(Boolean).join(' / ') || '-' },
            { key: 'quantity', header: 'Stock actual', render: (row) => row.quantity },
            {
              key: 'adjust',
              header: 'Ajustar',
              render: (row) => (
                <div className={styles.adjustRow}>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    className={styles.adjustInput}
                    value={quantityDrafts[row.sku] ?? ''}
                    onChange={(event) => setQuantityDraft(row.sku, event.target.value)}
                  />
                  <Button type="button" variant="secondary" size="sm" disabled={isAdjusting} onClick={() => adjust(row.sku, 'sumar')}>
                    Sumar
                  </Button>
                  <Button type="button" variant="secondary" size="sm" disabled={isAdjusting} onClick={() => adjust(row.sku, 'restar')}>
                    Restar
                  </Button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      )}
    </div>
  );
}
