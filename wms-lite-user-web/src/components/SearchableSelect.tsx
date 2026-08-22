import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import styles from './SearchableSelect.module.css';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '선택 또는 검색하세요',
  width,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 현재 선택된 Option 라벨 찾아 오기
  const selectedOption = options.find((opt) => opt.value === value);

  // 외부 영역 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 검색어 입력에 따른 실시간 필터링 옵션 목록
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      opt.value.toLowerCase().includes(query.toLowerCase())
  );

  const handleInputFocus = () => {
    setIsOpen(true);
    setQuery(''); // 포커스 시 입력 쿼리 초기화하여 전체 목록 확인 가능하게 함
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectOption = (option: SelectOption) => {
    onChange(option.value);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('ALL'); // 기본 '전체' 또는 비우기
    setQuery('');
    setIsOpen(false);
  };

  // 표시할 입력 필드 텍스트
  const displayValue = isOpen ? query : selectedOption ? selectedOption.label : '';

  return (
    <div className={styles.container} ref={containerRef} style={{ width }}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={styles.input}
        />
        <div className={styles.actionGroup}>
          {value !== 'ALL' && value !== '' && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearBtn}
              title="선택 해제"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <ul className={styles.dropdownList}>
          {filteredOptions.length === 0 ? (
            <li className={styles.emptyText}>검색 결과가 없습니다.</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelectOption(opt)}
                className={`${styles.dropdownItem} ${
                  opt.value === value ? styles.dropdownItemActive : ''
                }`}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};
