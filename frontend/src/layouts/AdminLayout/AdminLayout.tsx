import { useState } from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { Drawer, Icon, IconButton } from '@components';
import { useAuth } from '@store';
import styles from './AdminLayout.module.scss';

const NAV_ITEMS = [
  { to: '/admin', label: 'Resumen', icon: 'layout-dashboard' as const },
  { to: '/admin/products', label: 'Productos', icon: 'package' as const },
  { to: '/admin/cupons', label: 'Cupones', icon: 'ticket' as const },
  { to: '/admin/product-types', label: 'Categorias', icon: 'tag' as const },
  { to: '/admin/users', label: 'Usuarios', icon: 'users' as const },
];

export function AdminLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const onLogout = () => {
    auth.logout();
    void navigate({ to: '/login' });
  };

  return (
    <div className={styles.shell}>
      <header className={styles.mobileBar}>
        <Link to="/" className={styles.brand}>
          <Icon name="shopping-bag" />
          Tienda
        </Link>
        <IconButton icon="menu" label="Abrir menu" onClick={() => setMenuOpen(true)} />
      </header>

      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand}>
          <Icon name="shopping-bag" />
          Tienda
        </Link>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={styles.navItem}
              activeOptions={{ exact: item.to === '/admin' }}
              activeProps={{ className: styles.navItemActive }}
            >
              <Icon name={item.icon} size="sm" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <IconButton icon="log-out" label="Cerrar sesion" onClick={onLogout} />
        </div>
      </aside>

      <Drawer open={isMenuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <nav className={styles.drawerNav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={styles.navItem}
              activeOptions={{ exact: item.to === '/admin' }}
              activeProps={{ className: styles.navItemActive }}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name={item.icon} size="sm" />
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className={styles.navItem}
            onClick={() => {
              setMenuOpen(false);
              onLogout();
            }}
          >
            <Icon name="log-out" size="sm" />
            Cerrar sesion
          </button>
        </nav>
      </Drawer>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
