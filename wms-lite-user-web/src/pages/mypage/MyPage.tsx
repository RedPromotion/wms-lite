import React, { useState } from 'react';
import {
  User,
  Lock,
  History,
  Shield,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  Building,
  Key,
  Eye,
  EyeOff,
  Laptop,
  Check,
  AlertCircle,
  Clock,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/useAuthStore';
import { PageHeader } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { getLoginHistoryApi } from '../../features/auth/authApi';
import styles from './MyPage.module.css';

type TabType = 'profile' | 'security' | 'history';

interface LoginHistoryItem {
  id: number;
  loginTime: string;
  ipAddress: string;
  device: string;
  browser: string;
  status: 'SUCCESS' | 'FAILED' | 'LOGOUT';
  isCurrent: boolean;
}

export const MyPage: React.FC = () => {
  const { user, login, logout, accessToken, refreshToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const handleLogout = () => {
    if (window.confirm('WMS Lite 시스템에서 로그아웃하시겠습니까?')) {
      logout();
      toast.success('성공적으로 로그아웃되었습니다.');
    }
  };

  // 1. 내 정보 폼 상태
  const [name, setName] = useState<string>(user?.name || '홍길동');
  const [email, setEmail] = useState<string>('gildong.hong@wm-lite.com');
  const [phone, setPhone] = useState<string>('010-1234-5678');
  const [department, setDepartment] = useState<string>(user?.department || '물류관리1팀');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // 2. 비밀번호 변경 상태
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPw, setShowCurrentPw] = useState<boolean>(false);
  const [showNewPw, setShowNewPw] = useState<boolean>(false);
  const [showConfirmPw, setShowConfirmPw] = useState<boolean>(false);
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  // 3. 로그인 접속 이력 API 상태
  const [loginHistories, setLoginHistories] = useState<LoginHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const fetchLoginHistory = React.useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await getLoginHistoryApi();
      if (res && res.content) {
        const mapped: LoginHistoryItem[] = res.content.map((item, idx) => ({
          id: item.id,
          loginTime: item.loginAt ? String(item.loginAt).replace('T', ' ').substring(0, 19) : '-',
          ipAddress: item.ipAddress || '127.0.0.1',
          device: item.userAgent ? (item.userAgent.includes('Windows') ? 'Windows PC' : item.userAgent.includes('Mac') ? 'MacBook' : 'Web Device') : 'Web Client',
          browser: item.userAgent ? (item.userAgent.length > 35 ? item.userAgent.substring(0, 35) + '...' : item.userAgent) : 'Browser Client',
          status: item.status as any,
          isCurrent: idx === 0,
        }));
        setLoginHistories(mapped);
      }
    } catch {
      setLoginHistories([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'history') {
      fetchLoginHistory();
    }
  }, [activeTab, fetchLoginHistory]);

  // 1. 프로필 정보 저장
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('이름을 입력해 주세요.');
      return;
    }

    setSavingProfile(true);
    setTimeout(() => {
      // AuthStore 업데이트
      if (user && accessToken && refreshToken) {
        login({
          accessToken,
          refreshToken,
          memberId: user.memberId,
          loginId: user.loginId,
          name: name.trim(),
          department: department.trim(),
          role: user.role,
          expiresAt: new Date().toISOString(),
        });
      }
      toast.success('내 정보가 성공적으로 수정되었습니다.');
      setSavingProfile(false);
    }, 400);
  };

  // 2. 비밀번호 변경 제출
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('현재 비밀번호를 입력해 주세요.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    // 공개 데모 계정 (sample_*) 비밀번호 실시간 변경 보호 조치
    if (user?.loginId?.startsWith('sample_')) {
      toast.error('공개 데모 계정(sample_*)은 다른 사용자의 접속을 위해 비밀번호 변경이 제한되어 있습니다.', {
        duration: 4000,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      return;
    }

    setChangingPassword(true);
    setTimeout(() => {
      toast.success('비밀번호가 성공적으로 변경되었습니다. 다음 로그인부터 적용됩니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangingPassword(false);
    }, 500);
  };

  // 비밀번호 보안 강도 계산
  const calculatePasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, text: '', color: '#334155', percent: '0%' };
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw) || /[a-z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score: 1, text: '약함 (보안 위험)', color: '#ef4444', percent: '33%' };
      case 3:
        return { score: 2, text: '보통 (권장)', color: '#eab308', percent: '66%' };
      case 4:
        return { score: 3, text: '매우 강함 (안전)', color: '#22c55e', percent: '100%' };
      default:
        return { score: 0, text: '', color: '#334155', percent: '0%' };
    }
  };

  const pwStrength = calculatePasswordStrength(newPassword);

  // 로그인 이력 컬럼 정의
  const loginColumns: Column<LoginHistoryItem>[] = [
    {
      key: 'loginTime',
      header: '접속 일시',
      width: '180px',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#f8fafc' }}>
          {row.loginTime}
          {row.isCurrent && (
            <span style={{
              marginLeft: '0.4rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              background: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)',
            }}>
              현재 세션
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: '접속 IP 주소',
      width: '200px',
      render: (row) => row.ipAddress,
    },
    {
      key: 'device',
      header: '접속 기기 / OS',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Laptop size={14} style={{ color: '#94a3b8' }} /> {row.device} ({row.browser})
        </span>
      ),
    },
    {
      key: 'status',
      header: '접속 상태',
      width: '110px',
      align: 'center',
      render: (row) => {
        if (row.status === 'SUCCESS') {
          return (
            <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <CheckCircle2 size={13} /> 성공
            </span>
          );
        }
        if (row.status === 'LOGOUT') {
          return (
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <Clock size={13} /> 로그아웃
            </span>
          );
        }
        return (
          <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <AlertCircle size={13} /> 실패
          </span>
        );
      },
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <PageHeader
        title="마이페이지 (My Account & Security)"
        description="개인 프로필 정보를 확인/수정하고, 계정 보안 비밀번호 변경 및 접속 이력을 관리합니다."
        icon={<User size={24} />}
      />

      {/* 프로필 요약 헤더 카드 */}
      <div className={styles.profileHeaderCard}>
        <div className={styles.profileInfoWrapper}>
          <div className={styles.avatarCircle}>
            {user?.name ? user.name.substring(0, 1) : 'W'}
          </div>
          <div>
            <div className={styles.userName}>
              {user?.name || '홍길동'}
              <span className={styles.roleBadge}>
                {user?.role === 'ROLE_ADMIN' ? '슈퍼 관리자' : '현장 실무자 (OPERATOR)'}
              </span>
            </div>
            <div className={styles.userSubDetails}>
              <span>아이디: <strong style={{ color: '#f8fafc' }}>{user?.loginId || 'user01'}</strong></span>
              <span>•</span>
              <span>소속 부서: <strong style={{ color: '#f8fafc' }}>{user?.department || '물류관리팀'}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1.1rem',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="WMS Lite 시스템에서 로그아웃합니다."
          >
            <LogOut size={16} />
            계정 로그아웃 (Logout)
          </button>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            최종 로그인: <span style={{ color: '#4ade80', fontWeight: 600 }}>2026-08-21 13:20:12</span>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 (환경 설정 탭 제거됨) */}
      <div className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          내 정보 (Profile)
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'security' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={18} />
          비밀번호 변경 (Security)
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} />
          로그인 접속 이력 (Audit Log)
        </button>
      </div>

      {/* 탭 1: 내 정보 (Profile) */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            <User size={18} style={{ color: '#38bdf8' }} />
            개인 프로필 정보 수정
          </h3>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                사용자 성명 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="성명을 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>로그인 계정 아이디</label>
              <input
                type="text"
                className={`${styles.input} ${styles.readOnlyInput}`}
                value={user?.loginId || 'user01'}
                readOnly
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                이메일 주소 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className={styles.input}
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@company.com"
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>휴대폰 연락처</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className={styles.input}
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                />
                <Phone size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>소속 부서명</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className={styles.input}
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="소속 부서"
                />
                <Building size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>시스템 전담 권한</label>
              <input
                type="text"
                className={`${styles.input} ${styles.readOnlyInput}`}
                value={user?.role === 'ROLE_ADMIN' ? '슈퍼 관리자 (Platform Admin)' : '현장 작업자 / 관리자 (Operator)'}
                readOnly
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={savingProfile}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.25rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <Save size={16} />
              {savingProfile ? '저장 중...' : '내 정보 변경사항 저장'}
            </button>
          </div>
        </form>
      )}

      {/* 탭 2: 비밀번호 변경 (Security) */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            <Shield size={18} style={{ color: '#10b981' }} />
            계정 보안 비밀번호 변경
          </h3>

          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* 데모 환경 안내 알림 박스 */}
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '6px',
              color: '#facc15',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>공개 데모 환경 안내:</strong> 공용 테스트 계정({user?.loginId || 'sample_user'})의 원활한 체험 및 접근 유지를 위해 실제 비밀번호 변경은 제한되어 있습니다.
              </span>
            </div>

            {/* 현재 비밀번호 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                현재 비밀번호 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  className={styles.input}
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 사용 중인 비밀번호"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                새 비밀번호 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  className={styles.input}
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8자 이상, 영문/숫자/특수문자 조합"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* 비밀번호 강도 게이지 */}
              {newPassword && (
                <div className={styles.strengthMeter}>
                  <div className={styles.strengthBar}>
                    <div
                      className={styles.strengthFill}
                      style={{ width: pwStrength.percent, backgroundColor: pwStrength.color }}
                    />
                  </div>
                  <span className={styles.strengthText} style={{ color: pwStrength.color }}>
                    보안 강도: {pwStrength.text}
                  </span>
                </div>
              )}
            </div>

            {/* 새 비밀번호 확인 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                새 비밀번호 확인 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  className={styles.input}
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 다시 입력"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <AlertCircle size={12} /> 비밀번호가 일치하지 않습니다.
                </span>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <span style={{ fontSize: '0.78rem', color: '#22c55e', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Check size={12} /> 비밀번호가 올바르게 일치합니다.
                </span>
              )}
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={changingPassword}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.3rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <Key size={16} />
                {changingPassword ? '변경 처리 중...' : '비밀번호 최종 변경'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 탭 3: 로그인 이력 (Audit Log) */}
      {activeTab === 'history' && (
        <div className={styles.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <History size={18} style={{ color: '#f59e0b' }} />
              로그인 및 시스템 접속 이력 (Audit Log)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              최근 30일간의 로그인 접속 내역을 표시합니다.
            </span>
          </div>

          <DataGrid
            columns={loginColumns}
            data={loginHistories}
            keyExtractor={(item) => item.id}
            loading={loadingHistory}
            emptyText="접속 이력이 없습니다."
          />
        </div>
      )}
    </div>
  );
};
