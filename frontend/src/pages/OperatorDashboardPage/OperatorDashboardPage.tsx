import { ErrorState, Spinner, Table } from '@components';
import { useDashboardPage } from '@hooks';
import styles from './OperatorDashboardPage.module.scss';

export function OperatorDashboardPage() {
  const { dashboard, isLoading, isError, errorMessage, onRetry } = useDashboardPage();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Spinner />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className={styles.page}>
        <ErrorState description={errorMessage ?? 'No se pudo cargar el resumen.'} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Resumen</h1>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Variantes mas vendidas</h2>
          <Table
            rowKey={(row) => row.idVariant}
            columns={[
              { key: 'product', header: 'Producto', render: (row) => row.productName },
              { key: 'sku', header: 'SKU', render: (row) => row.sku },
              { key: 'qty', header: 'Unidades enviadas', render: (row) => row.totalQuantityShipped },
            ]}
            rows={dashboard.mostShippedVariants}
          />
        </section>

        <section className={styles.card}>
          <h2>Variantes menos vendidas</h2>
          <Table
            rowKey={(row) => row.idVariant}
            columns={[
              { key: 'product', header: 'Producto', render: (row) => row.productName },
              { key: 'sku', header: 'SKU', render: (row) => row.sku },
              { key: 'qty', header: 'Unidades enviadas', render: (row) => row.totalQuantityShipped },
            ]}
            rows={dashboard.leastShippedVariants}
          />
        </section>

        <section className={styles.card}>
          <h2>Categorias top</h2>
          <Table
            rowKey={(row) => row.idProductType}
            columns={[
              { key: 'category', header: 'Categoria', render: (row) => row.productTypeName },
              { key: 'qty', header: 'Unidades vendidas', render: (row) => row.totalQuantitySold },
            ]}
            rows={dashboard.topCategories}
          />
        </section>

        <section className={styles.card}>
          <h2>Notificaciones de envio recientes</h2>
          <Table
            rowKey={(row) => `${row.invoiceNumber}-${row.notifiedAt}`}
            columns={[
              { key: 'invoice', header: 'Factura', render: (row) => row.invoiceNumber },
              { key: 'status', header: 'Estado', render: (row) => row.statusName },
              { key: 'email', header: 'Correo', render: (row) => row.toEmail },
              { key: 'date', header: 'Fecha', render: (row) => new Date(row.notifiedAt).toLocaleString() },
            ]}
            rows={dashboard.recentShipmentNotifications}
          />
        </section>
      </div>
    </div>
  );
}
