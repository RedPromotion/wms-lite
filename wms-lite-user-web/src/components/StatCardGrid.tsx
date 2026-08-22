import React from 'react';
import styles from './StatCardGrid.module.css';

export interface StatCardGridProps {
  children: React.ReactNode;
  columns?: number | 'auto';
  gap?: string;
  minChildWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  children,
  columns = 4,
  gap = '0.75rem',
  minChildWidth = '220px',
  className = '',
  style,
}) => {
  const gridTemplateColumns =
    columns === 'auto'
      ? `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`
      : `repeat(${columns}, 1fr)`;

  return (
    <div
      className={`${styles.grid} ${className}`}
      style={{
        gridTemplateColumns,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
