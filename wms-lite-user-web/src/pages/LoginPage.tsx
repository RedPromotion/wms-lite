import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, loginApi } from '../features/auth';
import { Lock, User, LogIn, Warehouse } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      toast.error('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. 실제 백엔드 /api/members/login 에 로그인 요청 ➔ JWT accessToken 수신
      const response = await loginApi({ loginId, password });
      setAuth(response);

      toast.success(`${response.name || response.loginId}님 환영합니다! JWT 인증 토큰이 정상 발급되었습니다.`);
      navigate('/master/items', { replace: true });
    } catch (error: any) {
      console.warn('Backend Login API failed or offline:', error);

      // 서버 연결 불가 시 명확한 에러 메시지 표시
      const errorMessage = error?.response?.data?.message || '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해 주세요.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 배경 그라데이션 효과 */}
      <div className={styles.glowTopLeft} />
      <div className={styles.glowBottomRight} />

      {/* 로그인 메인 카드 */}
      <div className={styles.card}>
        <div className={styles.headerTitle}>
          <div className={styles.logoBadge}>
            <Warehouse size={28} />
          </div>
          <h1 className={styles.title}>WMS Lite</h1>
          <p className={styles.subtitle}>현장 작업자 및 관리자 통합 로그인</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>로그인 ID</label>
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <User size={18} />
              </div>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>비밀번호</label>
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={styles.submitBtn}>
            {isLoading ? (
              <span>로그인 인증 및 JWT 토큰 발급 중...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>시스템 로그인</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

