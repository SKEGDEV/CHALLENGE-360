import clsx from 'clsx';
import { Icon } from '@components/Icon';
import styles from './IconButton.module.scss';
import type { IconButtonProps } from './IconButton.types';

export function IconButton({
  icon,
  label,
  variant = 'default',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={clsx(styles.btn, styles[size], variant === 'danger' && styles.danger, className)}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} />
    </button>
  );
}
