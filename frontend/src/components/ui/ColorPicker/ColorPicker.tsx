import { useId } from 'react';
import { isValidHexColor } from '@core';
import styles from './ColorPicker.module.scss';
import type { ColorPickerProps } from './ColorPicker.types';

const DEFAULT_COLOR = '#000000';

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const inputId = useId();
  const pickerValue = isValidHexColor(value) ? value : DEFAULT_COLOR;

  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={styles.row}>
        <input
          id={inputId}
          type="color"
          className={styles.swatch}
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className={styles.hex}>{pickerValue.toUpperCase()}</span>
      </div>
    </div>
  );
}
