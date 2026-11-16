import { useState } from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { Button, Container, Icon, IconButton, ToastProvider } from '@components';
import { useAuth, useCart } from '@store';
import { CartDrawer } from './CartDrawer';
import styles from './StorefrontLayout.module.scss';

export function StorefrontLayout() {
  const auth = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const onLogout = () => {
    auth.logout();
    setMenuOpen(false);
    void navigate({ to: '/' });
  };

  const roleLabel = auth.hasRole('ADPRU')
    ? 'Administrador'
    : auth.hasRole('OPPRU')
      ? 'Operador'
      : 'Cliente';

  return (
    <ToastProvider>
      <header className={styles.nav}>
        <Container as="div" className={styles.navIn}>
          <Button variant="secondary" onClick={() => void navigate({ to: '/' })}>
            <Icon name="store" size="sm" />
            Tienda
          </Button>
          <div className={styles.actions}>
            <div className={styles.cartWrap}>
              <IconButton icon="shopping-bag" label="Abrir bolsa de compras" onClick={() => setCartOpen(true)} />
              {cart.itemCount > 0 && <span className={styles.cartBadge}>{cart.itemCount}</span>}
            </div>
            {auth.isAuthenticated ? (
              <div className={styles.userWrap}>
                <IconButton
                  icon="user"
                  label="Tu cuenta"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                  onClick={() => setMenuOpen((value) => !value)}
                />
                {isMenuOpen && (
                  <div className={styles.menu}>
                    <p className={styles.menuMeta}>{roleLabel}</p>
                    {auth.hasRole('ADPRU') && (
                      <Link to="/admin" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                        <Icon name="layout-dashboard" size="sm" />
                        Administracion
                      </Link>
                    )}
                    {auth.hasRole('OPPRU') && (
                      <Link to="/operator" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                        <Icon name="truck" size="sm" />
                        Panel de operador
                      </Link>
                    )}
                    <Link to="/orders" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                      <Icon name="package" size="sm" />
                      Mis pedidos
                    </Link>
                    <button type="button" className={styles.menuItem} onClick={onLogout}>
                      <Icon name="log-out" size="sm" />
                      Cerrar sesion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => void navigate({ to: '/login' })}>
                <Icon name="log-in" size="sm" />
                Iniciar sesion
              </Button>
            )}
          </div>
        </Container>
      </header>

      <Outlet />

      <CartDrawer open={isCartOpen} onClose={() => setCartOpen(false)} />

      <footer className={styles.footer}>
        <Container as="div">
          <span>Copyright 2026 Tienda.</span>
        </Container>
      </footer>
    </ToastProvider>
  );
}
