import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import styles from './DateRangePicker.module.css';

export interface DateRangePickerProps {
  label?: React.ReactNode;
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  onReset?: () => void;
  quickRanges?: boolean;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label = '날짜 범위 검색',
  startDate,
  endDate,
  onChange,
  onReset,
  quickRanges = false,
  className = '',
}) => {
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange('', '');
    }
  };

  const setDaysAgo = (days: number) => {
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];

    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    const startStr = pastDate.toISOString().split('T')[0];

    onChange(startStr, endStr);
  };

  const hasValue = Boolean(startDate || endDate);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <span className={styles.label}>
          {typeof label === 'string' && label.includes('📅') ? label : (
            <>
              <Calendar size={13} style={{ color: '#60a5fa' }} />
              {label}
            </>
          )}
        </span>
      )}

      <div className={styles.inputGroup}>
        <input
          type="date"
          className={styles.dateInput}
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          placeholder="시작일"
        />
        <span className={styles.separator}>~</span>
        <input
          type="date"
          className={styles.dateInput}
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          placeholder="종료일"
        />

        {quickRanges && (
          <div className={styles.quickBtnGroup}>
            <button
              type="button"
              className={styles.quickBtn}
              onClick={() => setDaysAgo(0)}
              title="오늘"
            >
              오늘
            </button>
            <button
              type="button"
              className={styles.quickBtn}
              onClick={() => setDaysAgo(7)}
              title="최근 7일"
            >
              7일
            </button>
            <button
              type="button"
              className={styles.quickBtn}
              onClick={() => setDaysAgo(30)}
              title="최근 30일"
            >
              30일
            </button>
          </div>
        )}

        {hasValue && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            title="날짜 조건 초기화"
          >
            <RotateCcw size={12} style={{ marginRight: '2px', display: 'inline' }} />
            초기화
          </button>
        )}
      </div>
    </div>
  );
};
