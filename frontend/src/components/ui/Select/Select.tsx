import { useId } from 'react';
import clsx from 'clsx';
import styles from './Select.module.scss';
import type { SelectProps } from './Select.types';

export function Select({ label, error, id, className, children, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(styles.field, error && styles.invalid, className)}
        aria-invalid={error ? true : undefined}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
