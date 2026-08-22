import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { User, Settings } from 'lucide-react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <header className={styles.header}>
      {/* 좌측 브랜드 로고 및 시스템 타이틀 */}
      <div className={styles.brand}>
        <div className={styles.logoBadge}>W</div>
        <div>
          <h1 className={styles.title}>
            WMS Lite <span className={styles.tag}>USER WEB</span>
          </h1>
          <span className={styles.subtitle}>현장 물류 관리 시스템</span>
        </div>
      </div>

      {/* 우측 사용자 프로필 / 마이페이지 이동 버튼 */}
      <div className={styles.userSection}>
        <button onClick={() => navigate('/mypage')} className={styles.profileBtn} title="마이페이지 / 계정 설정">
          <div className={styles.userAvatar}>
            <User size={16} />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || user?.loginId || '내 계정'}님</span>
            <span className={styles.userRole}>
              {user?.role === 'ROLE_ADMIN' ? '관리자' : user?.role === 'ROLE_MANAGER' ? '현장관리자' : '작업자'}
            </span>
          </div>
          <Settings size={15} className={styles.settingsIcon} />
        </button>
      </div>
    </header>
  );
};
