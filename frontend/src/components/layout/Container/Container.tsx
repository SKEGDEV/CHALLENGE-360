import clsx from 'clsx';
import styles from './Container.module.scss';
import type { ContainerProps } from './Container.types';

export function Container({ as: Component = 'div', className, ...rest }: ContainerProps) {
  return <Component className={clsx(styles.container, className)} {...rest} />;
}
