import React from 'react';
import styles from './StatCard.module.css';

export type StatCardVariant = 'info' | 'success' | 'warning' | 'purple' | 'danger';

export interface StatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  unit?: string;
  subText?: string;
  variant?: StatCardVariant;
  customColor?: {
    color: string;
    bg: string;
    border: string;
  };
  onClick?: () => void;
  className?: string;
}

const VARIANT_CLASS_MAP: Record<StatCardVariant, string> = {
  info: styles.variantInfo,
  success: styles.variantSuccess,
  warning: styles.variantWarning,
  purple: styles.variantPurple,
  danger: styles.variantDanger,
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  unit,
  subText,
  variant = 'info',
  customColor,
  onClick,
  className = '',
}) => {
  const isClickable = Boolean(onClick);
  const variantClass = VARIANT_CLASS_MAP[variant] || styles.variantInfo;

  const cardStyle: React.CSSProperties = customColor
    ? {
        background: customColor.bg,
        border: `1px solid ${customColor.border}`,
      }
    : {};

  const valueStyle: React.CSSProperties = customColor
    ? { color: customColor.color }
    : {};

  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div
      className={`${styles.card} ${variantClass} ${isClickable ? styles.clickable : ''} ${className}`}
      style={cardStyle}
      onClick={onClick}
    >
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span>{title}</span>
      </div>

      <div className={styles.valueContainer}>
        <span className={styles.value} style={valueStyle}>
          {formattedValue}
        </span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>

      {subText && <div className={styles.subText}>{subText}</div>}
    </div>
  );
};
