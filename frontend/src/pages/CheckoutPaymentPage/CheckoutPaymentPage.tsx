import { Button, Container, Input } from '@components';
import { useCheckoutPaymentPage } from '@hooks';
import styles from './CheckoutPaymentPage.module.scss';

interface CheckoutPaymentPageProps {
  idInvoice: number;
}

export function CheckoutPaymentPage({ idInvoice }: CheckoutPaymentPageProps) {
  const {
    cardNumber,
    setCardNumber,
    cardName,
    setCardName,
    expiry,
    setExpiry,
    cvv,
    setCvv,
    cuponCode,
    setCuponCode,
    cardErrors,
    errorMessage,
    isProcessingPayment,
    isConfirming,
    onSubmit,
  } = useCheckoutPaymentPage(idInvoice);

  const isBusy = isProcessingPayment || isConfirming;

  return (
    <Container as="main" className={styles.page}>
      <div className={styles.card}>
        <h1>Pago</h1>
        <p className={styles.sub}>Este es un pago simulado para la demostracion. No se realiza ningun cargo real.</p>
        <form onSubmit={onSubmit} noValidate className={styles.form}>
          <Input
            icon="credit-card"
            label="Numero de tarjeta"
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            maxLength={19}
            value={cardNumber}
            error={cardErrors.cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
          />
          <Input
            label="Nombre en la tarjeta"
            value={cardName}
            error={cardErrors.cardName}
            onChange={(event) => setCardName(event.target.value)}
          />
          <div className={styles.row2}>
            <Input
              label="Vencimiento"
              placeholder="MM/AA"
              value={expiry}
              error={cardErrors.expiry}
              onChange={(event) => setExpiry(event.target.value)}
            />
            <Input
              label="CVV"
              placeholder="123"
              inputMode="numeric"
              maxLength={4}
              value={cvv}
              error={cardErrors.cvv}
              onChange={(event) => setCvv(event.target.value)}
            />
          </div>
          <Input
            icon="ticket"
            label="Codigo de cupon (opcional)"
            value={cuponCode}
            onChange={(event) => setCuponCode(event.target.value)}
          />
          {errorMessage && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}
          <Button type="submit" size="lg" block disabled={isBusy}>
            {isProcessingPayment ? 'Procesando pago...' : isConfirming ? 'Confirmando pedido...' : 'Pagar'}
          </Button>
        </form>
      </div>
    </Container>
  );
}
