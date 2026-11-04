import type { ComponentPropsWithoutRef } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  tone?: BadgeTone;
}
