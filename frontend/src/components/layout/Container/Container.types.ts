import type { ComponentPropsWithoutRef, ElementType } from 'react';

export interface ContainerProps extends ComponentPropsWithoutRef<'div'> {
  as?: ElementType;
}
