import { useEffect } from 'react';
import clsx from 'clsx';
import { Button, IconButton } from '@components/ui';
import type { IconName } from '@components/Icon/iconRegistry';
import { Icon } from '@components/Icon';
import styles from './ConfirmDialog.module.scss';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  confirmIcon?: IconName;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Sí, confirmar',
  confirmIcon = 'check',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  return (
    <div
      className={clsx(styles.overlay, open && styles.open)}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      aria-hidden={!open}
      onClick={onCancel}
    >
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.badge}>
            <Icon name="circle-alert" size="md" />
          </span>
          <h2 className={styles.title}>{title}</h2>
          <IconButton icon="x" label="Cerrar" onClick={onCancel} />
        </div>
        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
          <p className={styles.warning}>Este cambio es irreversible y no se puede deshacer.</p>
        </div>
        <div className={styles.footer}>
          <Button variant="secondary" icon="x" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" icon={confirmIcon} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
