import type { ComponentPropsWithoutRef } from 'react';

export interface ChipProps extends ComponentPropsWithoutRef<'button'> {
  selected?: boolean;
}
