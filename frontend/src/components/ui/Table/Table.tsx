import clsx from 'clsx';
import styles from './Table.module.scss';
import type { TableProps } from './Table.types';

export function Table<T>({ columns, rows, rowKey, className }: TableProps<T>) {
  return (
    <div className={clsx(styles.wrap, className)}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
