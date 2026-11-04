import { Badge, Button, EmptyState, ErrorState, Input, Pagination, Select, Spinner, Table } from '@components';
import { useOperatorShipmentsPage } from '@hooks';
import styles from './OperatorShipmentsPage.module.scss';

export function OperatorShipmentsPage() {
  const {
    shipments,
    pageNumber,
    totalPages,
    setPageNumber,
    isLoading,
    isError,
    errorMessage,
    onRetry,
    shipmentStatuses,
    idShipmentStatus,
    setIdShipmentStatus,
    guideDrafts,
    setGuideDraft,
    advance,
    isAdvancing,
    requiresGuide,
  } = useOperatorShipmentsPage();

  return (
    <div className={styles.page}>
      <h1>Envios</h1>

      <div className={styles.toolbar}>
        <Select
          value={idShipmentStatus ?? ''}
          onChange={(event) => setIdShipmentStatus(event.target.value ? Number(event.target.value) : null)}
        >
          <option value="">Todos los estados</option>
          {shipmentStatuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState description={errorMessage ?? 'No se pudieron cargar los envios.'} onRetry={onRetry} />
      ) : shipments.length === 0 ? (
        <EmptyState icon="truck" title="No hay envios." description="No se encontraron envios para este filtro." />
      ) : (
        <>
          <Table
            rowKey={(row) => row.idInvoice}
            columns={[
              { key: 'invoice', header: 'Factura', render: (row) => row.invoiceNumber },
              { key: 'address', header: 'Direccion', render: (row) => row.addressLine1 },
              { key: 'method', header: 'Metodo', render: (row) => row.shippmentMethodName },
              { key: 'status', header: 'Estado', render: (row) => <Badge tone="info">{row.shipmentStatusName}</Badge> },
              { key: 'guide', header: 'Guia', render: (row) => row.shippmentGuide ?? '-' },
              {
                key: 'actions',
                header: '',
                render: (row) =>
                  row.isPayVDelivered ? (
                    <span className={styles.delivered}>Entregado</span>
                  ) : (
                    <div className={styles.advanceRow}>
                      {requiresGuide(row.shipmentStatusName) && (
                        <Input
                          placeholder="No. de guia"
                          className={styles.guideInput}
                          value={guideDrafts[row.invoiceNumber] ?? ''}
                          onChange={(event) => setGuideDraft(row.invoiceNumber, event.target.value)}
                        />
                      )}
                      <Button type="button" variant="secondary" size="sm" disabled={isAdvancing} onClick={() => advance(row.invoiceNumber, row.shipmentStatusName)}>
                        Avanzar estado
                      </Button>
                    </div>
                  ),
              },
            ]}
            rows={shipments}
          />
          <Pagination page={pageNumber} totalPages={totalPages} onChange={setPageNumber} />
        </>
      )}
    </div>
  );
}
