import { Link, Outlet } from '@tanstack/react-router';
import { Icon, IconButton } from '@components';
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
              activeOptions={{ exact: item.to === '/admin' }}
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
