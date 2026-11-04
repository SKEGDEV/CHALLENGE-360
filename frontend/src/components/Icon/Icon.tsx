import type { LucideIcon, LucideProps } from 'lucide-react';
import clsx from 'clsx';
import { iconRegistry, type IconName } from './iconRegistry';
import styles from './Icon.module.scss';

const SIZES = { sm: 16, md: 20, lg: 24 } as const;

export interface IconProps extends Omit<LucideProps, 'ref' | 'size'> {
  name: IconName;
  size?: keyof typeof SIZES | number;
  label?: string;
}

export function Icon({ name, size = 'md', label, className, ...rest }: IconProps) {
  const Component = iconRegistry[name] as LucideIcon;
  return (
    <Component
      size={typeof size === 'number' ? size : SIZES[size]}
      className={clsx(styles.icon, className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      {...rest}
    />
  );
}
