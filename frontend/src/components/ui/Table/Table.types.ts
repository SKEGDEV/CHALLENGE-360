import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  className?: string;
}
