import clsx from 'clsx';
import { Icon } from '@components/Icon';
import styles from './Stepper.module.scss';
import type { StepperProps } from './Stepper.types';

export function Stepper({
  value,
  onChange,
  min = 1,
  max,
  size = 'md',
  disabled,
  decreaseLabel = 'Restar una unidad',
  increaseLabel = 'Sumar una unidad',
}: StepperProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && (max === undefined || value < max);

  return (
    <div className={clsx(styles.stepper, size === 'sm' && styles.sm)}>
      <button
        type="button"
        className={styles.btn}
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        aria-label={decreaseLabel}
      >
        <Icon name="minus" size="sm" />
      </button>
      <span className={styles.value}>{value}</span>
      <button
        type="button"
        className={styles.btn}
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        aria-label={increaseLabel}
      >
        <Icon name="plus" size="sm" />
      </button>
    </div>
  );
}
