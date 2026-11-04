import { useId } from 'react';
import clsx from 'clsx';
import styles from './Checkbox.module.scss';
import type { CheckboxProps } from './Checkbox.types';

export function Checkbox({ label, id, className, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label className={clsx(styles.label, className)} htmlFor={inputId}>
      <input id={inputId} type="checkbox" className={styles.input} {...rest} />
      {label}
    </label>
  );
}
