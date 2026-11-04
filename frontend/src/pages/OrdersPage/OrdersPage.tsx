import { Link } from '@tanstack/react-router';
import { formatMoney } from '@core';
import { Badge, Container, EmptyState, ErrorState, Spinner } from '@components';
import { useOrdersPage } from '@hooks';
import styles from './OrdersPage.module.scss';

export function OrdersPage() {
  const { invoices, isLoading, isError, errorMessage, onRetry } = useOrdersPage();

  if (isLoading) {
    return (
      <Container as="main" className={styles.page}>
        <Spinner />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container as="main" className={styles.page}>
        <ErrorState description={errorMessage ?? 'No se pudieron cargar tus pedidos.'} onRetry={onRetry} />
      </Container>
    );
  }

  return (
    <Container as="main" className={styles.page}>
      <h1>Mis pedidos</h1>
      {invoices.length === 0 ? (
        <EmptyState
          icon="package"
          title="Aun no tienes pedidos."
          description="Cuando compres algo, apareceran aqui."
          action={<Link to="/">Ir a la tienda</Link>}
        />
      ) : (
        <div className={styles.list}>
          {invoices.map((invoice) => (
            <Link
              key={invoice.idInvoice}
              to="/orders/$idInvoice"
              params={{ idInvoice: String(invoice.idInvoice) }}
              className={styles.row}
            >
              <div>
                <p className={styles.number}>{invoice.invoiceNumber}</p>
                <span className={styles.date}>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
              </div>
              <Badge tone="info">{invoice.shipmentStatusName}</Badge>
              <span className={styles.total}>{formatMoney(invoice.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
