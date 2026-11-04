import { IconButton } from '@components/ui/IconButton';
import styles from './Pagination.module.scss';
import type { PaginationProps } from './Pagination.types';

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <IconButton
        icon="chevron-left"
        label="Pagina anterior"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      />
      <span className={styles.label}>
        Pagina {page} de {totalPages}
      </span>
      <IconButton
        icon="chevron-left"
        label="Pagina siguiente"
        size="sm"
        className={styles.next}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      />
    </div>
  );
}
