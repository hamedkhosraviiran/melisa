export * from './coverage';
export * from './api';

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type Nullable<T> = T | null;
export type WithId<T> = T & { id: string | number };

export interface DashboardProps {
  initialData?: any;
  refreshInterval?: number;
  theme?: 'light' | 'dark';
}

export interface ChartProps {
  data: any[];
  width?: number;
  height?: number;
  colors?: string[];
}