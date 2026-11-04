import { Link } from '@tanstack/react-router';
import { formatMoney } from '@core';
import { Button, Container, EmptyState, Input, ProductImage, Select } from '@components';
import { useCheckoutPage } from '@hooks';
import styles from './CheckoutPage.module.scss';

export function CheckoutPage() {
  const {
    items,
    subtotal,
    shipmentMethods,
    isLoadingShipmentMethods,
    addressLine1,
    setAddressLine1,
    addressLine2,
    setAddressLine2,
    idShippmentMethod,
    setIdShippmentMethod,
    errorMessage,
    isSubmitting,
    onSubmit,
  } = useCheckoutPage();

  if (items.length === 0) {
    return (
      <Container as="main" className={styles.page}>
        <EmptyState
          icon="shopping-bag"
          title="Tu bolsa esta vacia."
          description="Agrega productos antes de continuar con la compra."
          action={<Link to="/">Ir a la tienda</Link>}
        />
      </Container>
    );
  }

  return (
    <Container as="main" className={styles.page}>
      <h1>Finalizar compra</h1>
      <div className={styles.grid}>
        <form onSubmit={onSubmit} noValidate className={styles.form}>
          <Input
            label="Direccion"
            placeholder="Calle, numero, colonia"
            value={addressLine1}
            onChange={(event) => setAddressLine1(event.target.value)}
          />
          <Input
            label="Direccion 2 (opcional)"
            placeholder="Referencia, apartamento"
            value={addressLine2}
            onChange={(event) => setAddressLine2(event.target.value)}
          />
          <Select
            label="Metodo de envio"
            value={idShippmentMethod ?? ''}
            disabled={isLoadingShipmentMethods}
            onChange={(event) => setIdShippmentMethod(Number(event.target.value))}
          >
            <option value="" disabled>
              Selecciona un metodo
            </option>
            {shipmentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </Select>
          {errorMessage && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}
          <Button type="submit" size="lg" block disabled={isSubmitting}>
            {isSubmitting ? 'Creando pedido...' : 'Continuar al pago'}
          </Button>
        </form>
        <aside className={styles.summary}>
          <h2>Resumen</h2>
          {items.map((item) => (
            <div key={item.idProductVariant} className={styles.summaryLine}>
              <ProductImage bucketKey={item.photoKey} alt={item.productName} size="sm" />
              <div>
                <p>{item.productName}</p>
                <span>
                  {[item.color, item.size].filter(Boolean).join(', ')} x{item.quantity}
                </span>
              </div>
              <span>{formatMoney(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className={styles.total}>
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
        </aside>
      </div>
    </Container>
  );
}
