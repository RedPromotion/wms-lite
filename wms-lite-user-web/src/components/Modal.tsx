import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  closeOnOverlayClick?: boolean; // 외부 배경 클릭 시 닫기 여부 (기본값: false - 실수 닫기 방지)
}

export const ModalComponent: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '550px',
  closeOnOverlayClick = false, // 사용자의 요구에 따라 외부 클릭 닫기 기본 비활성화
}) => {
  // ESC 키 클릭 시 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 모달 오픈 시 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        className={styles.modalCard}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()} // 클릭 버블링 방지
      >
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button className={styles.closeBtn} onClick={onClose} title="닫기">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};

/* ==========================================================
 * 모달 폼 전용 서브 헬퍼 컴포넌트들 (Compound Components)
 * ========================================================== */

const Form: React.FC<React.FormHTMLAttributes<HTMLFormElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <form className={`${styles.form} ${className}`} {...props}>
    {children}
  </form>
);

const FormRow: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`${styles.formRow} ${className}`} {...props}>
    {children}
  </div>
);

const FormGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`${styles.formGroup} ${className}`} {...props}>
    {children}
  </div>
);

const Label: React.FC<
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
> = ({ required, className = '', children, ...props }) => (
  <label className={`${styles.label} ${className}`} {...props}>
    {children}
    {required && <span className={styles.required}>*</span>}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...props
}) => <input className={`${styles.inputField} ${className}`} {...props} />;

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <select className={`${styles.inputField} ${className}`} {...props}>
    {children}
  </select>
);

const Textarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className = '', ...props }) => (
  <textarea className={`${styles.textareaField} ${className}`} {...props} />
);

const Footer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`${styles.footer} ${className}`} {...props}>
    {children}
  </div>
);

// 메인 Modal 컴포넌트에 서브 컴포넌트 바인딩
export const Modal = Object.assign(ModalComponent, {
  Form,
  FormRow,
  FormGroup,
  Label,
  Input,
  Select,
  Textarea,
  Footer,
  styles,
});
