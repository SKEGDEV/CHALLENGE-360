import { Icon } from '@components/Icon';
import { Button } from '@components/ui';
import styles from './ErrorState.module.scss';
import type { ErrorStateProps } from './ErrorState.types';

export function ErrorState({ title = 'Algo salio mal', description, onRetry, retryLabel = 'Reintentar' }: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <Icon name="circle-alert" size={56} className={styles.icon} />
      <h3 className={styles.title}>{title}</h3>
      <p>{description}</p>
      {onRetry && (
        <div className={styles.action}>
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
