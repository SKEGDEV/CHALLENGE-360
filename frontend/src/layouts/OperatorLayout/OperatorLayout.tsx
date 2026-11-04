import { Link, Outlet } from '@tanstack/react-router';
import { Icon, IconButton } from '@components';
import { useAuth } from '@store';
import styles from './OperatorLayout.module.scss';

const NAV_ITEMS = [
  { to: '/operator', label: 'Resumen', icon: 'layout-dashboard' as const },
  { to: '/operator/inventory', label: 'Inventario', icon: 'boxes' as const },
  { to: '/operator/shipments', label: 'Envios', icon: 'truck' as const },
];

export function OperatorLayout() {
  const auth = useAuth();

  return (
    <div className={styles.shell}>
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
              activeOptions={{ exact: item.to === '/operator' }}
              activeProps={{ className: styles.navItemActive }}
            >
              <Icon name={item.icon} size="sm" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <IconButton icon="log-out" label="Cerrar sesion" onClick={() => auth.logout()} />
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
