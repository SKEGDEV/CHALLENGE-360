import type { ComponentPropsWithoutRef } from 'react';

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  label: string;
}
