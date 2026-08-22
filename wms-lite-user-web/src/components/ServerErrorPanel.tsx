import React from 'react';
import { AlertTriangle, ShieldAlert, WifiOff, RefreshCw, Layers } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import styles from './ServerErrorPanel.module.css';

export interface ServerErrorPanelProps {
  title?: string;
  message?: string;
  statusCode?: number;
  onRetry?: () => void;
  onEnableOfflineMode?: () => void;
}

export const ServerErrorPanel: React.FC<ServerErrorPanelProps> = ({
  title,
  message = 'Spring Boot 백엔드 서버와 통신 중 오류가 발생했습니다.',
  statusCode,
  onRetry,
  onEnableOfflineMode,
}) => {
  const user = useAuthStore((state) => state.user);

  const lowerMsg = String(message || '').toLowerCase();

  // 1. 권한 부족 에러 판별 (403 / 401 / forbidden / permission / denied / 권한)
  const isPermissionError =
    statusCode === 403 ||
    statusCode === 401 ||
    lowerMsg.includes('권한') ||
    lowerMsg.includes('403') ||
    lowerMsg.includes('401') ||
    lowerMsg.includes('forbidden') ||
    lowerMsg.includes('permission') ||
    lowerMsg.includes('denied') ||
    lowerMsg.includes('unauthorized');

  // 2. 백엔드 서버 오프라인/연결 실패 판별
  const isOfflineError =
    message.includes('연결할 수 없습니다') ||
    message.includes('Network Error') ||
    message.includes('통신할 수 없습니다') ||
    message.includes('CORS') ||
    statusCode === 0;

  // 타이틀 자동 추론
  const computedTitle =
    title ||
    (isPermissionError
      ? '🔒 접근 권한 부족 (Access Denied)'
      : isOfflineError
      ? '🔌 백엔드 API 서버 연결 실패 (Backend Offline)'
      : '⚠️ 백엔드 서버 처리 오류 (Server Error)');

  // 아이콘 선택
  const renderIcon = () => {
    if (isPermissionError) {
      return <ShieldAlert size={38} style={{ color: '#eab308' }} />;
    }
    if (isOfflineError) {
      return <WifiOff size={38} style={{ color: '#ef4444' }} />;
    }
    return <AlertTriangle size={38} style={{ color: '#f97316' }} />;
  };

  // 동적 접속 사용자 및 권한 안내 문구 생성 (하드코딩 배제)
  const userInfoText = user
    ? `현재 접속 계정: ${user.name || user.loginId} (${user.role || 'ROLE_OPERATOR'})`
    : '현재 미인증 계정';

  return (
    <div className={styles.serverErrorPanel}>
      <div
        className={styles.iconWrapper}
        style={{
          background: isPermissionError
            ? 'rgba(234, 179, 8, 0.15)'
            : isOfflineError
            ? 'rgba(239, 68, 68, 0.15)'
            : 'rgba(249, 115, 22, 0.15)',
          border: '1px solid',
          borderColor: isPermissionError
            ? 'rgba(234, 179, 8, 0.3)'
            : isOfflineError
            ? 'rgba(239, 68, 68, 0.3)'
            : 'rgba(249, 115, 22, 0.3)',
        }}
      >
        {renderIcon()}
      </div>
      <h3 className={styles.title}>{computedTitle}</h3>
      <p className={styles.subtitle}>
        {isPermissionError
          ? `${message} [${userInfoText}] - 해당 메뉴는 상위 관리자(MANAGER 이상) 권한 계정으로 로그인해야 접근 가능합니다.`
          : message}
      </p>
      <div className={styles.actionGroup}>
        {onRetry && (
          <button className={styles.retryBtn} onClick={onRetry}>
            <RefreshCw size={16} />
            다시 시도 / 새로고침 (Retry)
          </button>
        )}
        {onEnableOfflineMode && (
          <button className={styles.demoBtn} onClick={onEnableOfflineMode}>
            <Layers size={16} />
            오프라인 시연 데모 모드로 전환
          </button>
        )}
      </div>
    </div>
  );
};
