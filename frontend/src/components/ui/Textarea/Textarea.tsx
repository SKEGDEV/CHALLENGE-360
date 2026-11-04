import { useId } from 'react';
import clsx from 'clsx';
import styles from './Textarea.module.scss';
import type { TextareaProps } from './Textarea.types';

export function Textarea({ label, error, id, className, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label} htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={clsx(styles.field, error && styles.invalid, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p className={styles.error} id={`${textareaId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
