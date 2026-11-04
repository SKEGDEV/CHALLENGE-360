import type { ComponentPropsWithoutRef } from 'react';

export interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  label?: string;
  error?: string;
}
