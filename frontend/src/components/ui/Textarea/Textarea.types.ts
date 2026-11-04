import type { ComponentPropsWithoutRef } from 'react';

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label?: string;
  error?: string;
}
