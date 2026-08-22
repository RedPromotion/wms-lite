import React from 'react';
import { Search, X, Database, Zap } from 'lucide-react';
import styles from './SearchInput.module.css';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  width?: string;
  label?: string; // 입력창 라벨 (예: "🔍 DB 전체 검색", "⚡ 상세검색")
  badgeText?: string; // 플로팅 라인 뱃지 텍스트 (예: "50건", "3건 표시중")
  badgeType?: 'server' | 'quick' | 'normal'; // 뱃지 색상 타입
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = '검색어를 입력하세요',
  width,
  label,
  badgeText,
  badgeType = 'normal',
}) => {
  const handleClear = () => {
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={styles.container}>
      {/* 상단 라인 헤더: 라벨과 플로팅 뱃지 일체형 표기 */}
      {(label || badgeText) && (
        <div className={styles.headerLine}>
          {label && <span className={styles.inputLabel}>{label}</span>}
          {badgeText && (
            <span
              className={`${styles.floatingBadge} ${
                badgeType === 'server'
                  ? styles.badgeServer
                  : badgeType === 'quick'
                  ? styles.badgeQuick
                  : styles.badgeNormal
              }`}
            >
              {badgeType === 'server' && <Database size={11} />}
              {badgeType === 'quick' && <Zap size={11} />}
              {badgeText}
            </span>
          )}
        </div>
      )}

      <div className={styles.inputWrapper}>
        <Search className={styles.leftIcon} size={15} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          style={{ width }}
        />
        {/* 입력창 내부 우측 버튼 그룹 (X 지우기 버튼 + 돋보기 검색) */}
        <div className={styles.rightActionGroup}>
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearBtn}
              title="검색어 지우기"
            >
              <X size={14} />
            </button>
          )}
          {onSearch && (
            <button
              type="button"
              onClick={handleSearchClick}
              className={styles.innerSearchBtn}
              title="DB 전체 검색 실행"
            >
              <Search size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
