import { Icon } from '@components/Icon';
import styles from './EmptyState.module.scss';
import type { EmptyStateProps } from './EmptyState.types';

export function EmptyState({ icon = 'package', title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <Icon name={icon} size={56} className={styles.icon} />
      <h3 className={styles.title}>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
