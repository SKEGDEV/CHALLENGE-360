import { Icon } from '@components/Icon';
import styles from './Spinner.module.scss';
import type { SpinnerProps } from './Spinner.types';

export function Spinner({ size = 'md', label = 'Cargando' }: SpinnerProps) {
  return <Icon name="loader-circle" size={size} className={styles.spin} label={label} />;
}
