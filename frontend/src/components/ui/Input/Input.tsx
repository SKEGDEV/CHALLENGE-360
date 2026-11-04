import { useId } from 'react';
import clsx from 'clsx';
import { Icon } from '@components/Icon';
import styles from './Input.module.scss';
import type { InputProps } from './Input.types';

export function Input({ label, error, icon, id, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={styles.wrap}>
        {icon && <Icon name={icon} size="sm" className={styles.icon} />}
        <input
          id={inputId}
          className={clsx(styles.field, icon && styles.withIcon, error && styles.invalid, className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p className={styles.error} id={`${inputId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
