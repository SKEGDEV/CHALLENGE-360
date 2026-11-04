import clsx from 'clsx';
import styles from './Chip.module.scss';
import type { ChipProps } from './Chip.types';

export function Chip({ selected, className, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      className={clsx(styles.chip, selected && styles.selected, className)}
      aria-pressed={selected}
      {...rest}
    />
  );
}
