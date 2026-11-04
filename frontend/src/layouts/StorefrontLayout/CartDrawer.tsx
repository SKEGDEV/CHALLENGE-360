import { useNavigate } from '@tanstack/react-router';
import { formatMoney } from '@core';
import { Button, Drawer, EmptyState, ProductImage, Stepper } from '@components';
import { useCart } from '@store';
import styles from './CartDrawer.module.scss';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const cart = useCart();
  const navigate = useNavigate();

  const onCheckout = () => {
    onClose();
    void navigate({ to: '/checkout' });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Tu bolsa"
      footer={
        cart.items.length > 0 ? (
          <>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatMoney(cart.subtotal)}</span>
            </div>
            <Button size="lg" block onClick={onCheckout}>
              Finalizar compra
            </Button>
          </>
        ) : undefined
      }
    >
      {cart.items.length === 0 ? (
        <EmptyState
          icon="shopping-bag"
          title="Tu bolsa esta vacia."
          description="Elige una prenda, selecciona talla y color, y agregala aqui."
        />
      ) : (
        cart.items.map((item) => (
          <div key={item.idProductVariant} className={styles.line}>
            <ProductImage bucketKey={item.photoKey} alt={item.productName} size="sm" />
            <div>
              <h4 className={styles.name}>{item.productName}</h4>
              <p className={styles.meta}>
                {[item.color, item.size].filter(Boolean).join(', ') || item.sku}
              </p>
              <Stepper
                size="sm"
                value={item.quantity}
                min={1}
                max={item.availableStock}
                onChange={(quantity) => cart.updateQuantity(item.idProductVariant, quantity)}
              />
            </div>
            <div className={styles.lineEnd}>
              <span className={styles.linePrice}>{formatMoney(item.unitPrice * item.quantity)}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => cart.removeItem(item.idProductVariant)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </Drawer>
  );
}
