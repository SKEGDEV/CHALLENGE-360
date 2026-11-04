import type { ComponentPropsWithoutRef } from 'react';
import type { IconName } from '@components/Icon';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string;
  icon?: IconName;
}
