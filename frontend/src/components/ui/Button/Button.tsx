import clsx from 'clsx';
import styles from './Button.module.scss';
import type { ButtonProps } from './Button.types';

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(styles.btn, styles[variant], styles[size], block && styles.block, className)}
      {...rest}
    />
  );
}
