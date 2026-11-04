import clsx from 'clsx';
import styles from './Badge.module.scss';
import type { BadgeProps } from './Badge.types';

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return <span className={clsx(styles.badge, styles[tone], className)} {...rest} />;
}
