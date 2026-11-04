import { formatMoney } from '@core';
import { Badge, Container, ErrorState, Icon, Spinner } from '@components';
import { useOrderDetailPage } from '@hooks';
import styles from './OrderDetailPage.module.scss';

interface OrderDetailPageProps {
  idInvoice: number;
  showSuccessBanner?: boolean;
}

export function OrderDetailPage({ idInvoice, showSuccessBanner }: OrderDetailPageProps) {
  const { invoice, isLoading, isError, errorMessage, onRetry } = useOrderDetailPage(idInvoice);

  if (isLoading) {
    return (
      <Container as="main" className={styles.page}>
        <Spinner />
      </Container>
    );
  }

  if (isError || !invoice) {
    return (
      <Container as="main" className={styles.page}>
        <ErrorState description={errorMessage ?? 'No se pudo cargar el pedido.'} onRetry={onRetry} />
      </Container>
    );
  }

  return (
    <Container as="main" className={styles.page}>
      {showSuccessBanner && (
        <div className={styles.successBanner}>
          <Icon name="circle-check" size="lg" />
          <div>
            <h2>Gracias por tu pedido.</h2>
            <p>Tu numero de pedido es {invoice.invoiceNumber}.</p>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1>Pedido {invoice.invoiceNumber}</h1>
        <Badge tone="info">{invoice.shipmentStatusName}</Badge>
      </div>

      <section className={styles.section}>
        <h2>Productos</h2>
        {invoice.items.map((item) => (
          <div key={item.idProductVariant} className={styles.itemRow}>
            <span>
              {item.productName} ({item.sku}) x{item.quantity}
            </span>
            <span>{formatMoney(item.lineTotal)}</span>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>Envio</h2>
        <p className={styles.addressText}>
          {invoice.addressLine1}
          {invoice.addressLine2 ? `, ${invoice.addressLine2}` : ''}
        </p>
        <p className={styles.addressText}>{invoice.shippmentMethodName}</p>
        {invoice.shippmentGuide && <p className={styles.addressText}>Guia de envio: {invoice.shippmentGuide}</p>}
      </section>

      <section className={styles.totals}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatMoney(invoice.subtotal)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Envio</span>
          <span>{formatMoney(invoice.shippingPrice)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Impuestos</span>
          <span>{formatMoney(invoice.taxAmount)}</span>
        </div>
        {invoice.discountAmount > 0 && (
          <div className={styles.totalRow}>
            <span>Descuento{invoice.cuponCode ? ` (${invoice.cuponCode})` : ''}</span>
            <span>-{formatMoney(invoice.discountAmount)}</span>
          </div>
        )}
        <div className={styles.grandTotal}>
          <span>Total</span>
          <span>{formatMoney(invoice.total)}</span>
        </div>
      </section>
    </Container>
  );
}
