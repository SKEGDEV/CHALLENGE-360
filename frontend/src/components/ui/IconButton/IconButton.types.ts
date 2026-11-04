import type { ComponentPropsWithoutRef } from 'react';
import type { IconName } from '@components/Icon';

export interface IconButtonProps extends ComponentPropsWithoutRef<'button'> {
  icon: IconName;
  label: string;
  variant?: 'default' | 'danger';
  size?: 'sm' | 'md';
}
