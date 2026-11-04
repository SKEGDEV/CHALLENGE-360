import clsx from 'clsx';
import styles from './Avatar.module.scss';
import type { AvatarProps } from './Avatar.types';

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = 'md', accent, className }: AvatarProps) {
  return (
    <div className={clsx(styles.avatar, styles[size], accent && styles.accent, className)} aria-hidden="true">
      {initialsOf(name)}
    </div>
  );
}
