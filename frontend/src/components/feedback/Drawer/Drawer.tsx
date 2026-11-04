import { useEffect } from 'react';
import clsx from 'clsx';
import { IconButton } from '@components/ui';
import styles from './Drawer.module.scss';
import type { DrawerProps } from './Drawer.types';

export function Drawer({ open, onClose, title, children, footer, closeLabel = 'Cerrar' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div
      className={clsx(styles.overlay, open && styles.open)}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-hidden={!open}
      onClick={onClose}
    >
      <div className={styles.drawer} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <IconButton icon="x" label={closeLabel} onClick={onClose} />
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
