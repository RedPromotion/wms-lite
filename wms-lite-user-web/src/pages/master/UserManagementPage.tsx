import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, PageToolbar, PageActionBar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import { UserFormModal, type MockMember } from './UserFormModal';
import {
  getMembersApi,
  createMemberApi,
  updateMemberApi,
  deleteMemberApi,
  type MemberResponse,
} from '../../features/master/user';
import styles from '../../styles/CommonPage.module.css';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<MockMember[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | undefined>(undefined);

  const [serverSearchInput, setServerSearchInput] = useState('');
  const [activeServerKeyword, setActiveServerKeyword] = useState('');
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [editingUser, setEditingUser] = useState<MockMember | null>(null);

  const fetchUsers = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setGridLoading(true);
    }
    setError(null);

    try {
      const pageData = await getMembersApi({
        keyword: activeServerKeyword || undefined,
        page: 0,
        size: 50,
      });

      const mapped: MockMember[] = (pageData.content || []).map((dto: MemberResponse) => ({
        id: dto.id,
        loginId: dto.loginId,
        name: dto.name,
        department: dto.department || 'WAREHOUSE_OPERATOR',
        role: dto.role || 'ROLE_OPERATOR',
        email: dto.email || '-',
        phone: dto.phone || '-',
      }));

      setUsers(mapped);
    } catch (err: any) {
      const status = err?.status || err?.response?.status || (err?.isNetworkError ? 0 : 500);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '백엔드 API 서버(http://localhost:8080)와 통신할 수 없습니다.';

      setErrorStatus(status);
      if (status === 403) {
        setError('사용자 계정 관리 메뉴는 현장 관리자(ROLE_MANAGER) 이상의 권한이 필요합니다. (접근 권한 없음 403)');
      } else {
        setError(msg);
      }
    } finally {
      setIsInitialLoading(false);
      setGridLoading(false);
    }
  }, [activeServerKeyword]);

  useEffect(() => {
    fetchUsers(users.length === 0);
  }, [activeServerKeyword]);

  const handleServerSearch = () => {
    setActiveServerKeyword(serverSearchInput.trim());
  };

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedItemIds.length === 0) {
      alert('수정할 사용자를 체크박스에서 먼저 선택해 주세요.');
      return;
    }
    if (selectedItemIds.length > 1) {
      alert('한 번에 1명의 사용자만 선택하여 수정할 수 있습니다.');
      return;
    }

    const target = users.find((usr) => usr.id === selectedItemIds[0]);
    if (target) {
      setModalMode('EDIT');
      setEditingUser(target);
      setIsModalOpen(true);
    }
  };

  const handleEditRow = (user: MockMember) => {
    setModalMode('EDIT');
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteRow = async (user: MockMember) => {
    if (!window.confirm(`'${user.name} (${user.loginId})' 사용자 계정을 정말 삭제/비활성화하시겠습니까?`)) {
      return;
    }

    try {
      await deleteMemberApi(user.id);
      toast.success('사용자 계정이 성공적으로 삭제되었습니다.');
      fetchUsers(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '삭제에 실패했습니다.';
      toast.error(msg);
    }
  };

  const handleFormSubmit = async (formData: Omit<MockMember, 'id'> & { id?: number; password?: string }) => {
    try {
      if (modalMode === 'CREATE') {
        await createMemberApi({
          loginId: formData.loginId,
          password: formData.password || 'Password123!',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          role: formData.role,
        });
        toast.success('신규 작업자/사용자 계정이 성공적으로 생성되었습니다!');
      } else if (formData.id) {
        await updateMemberApi(formData.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          role: formData.role,
        });
        toast.success('사용자 정보가 성공적으로 수정되었습니다!');
      }

      setIsModalOpen(false);
      fetchUsers(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '저장 중 오류가 발생했습니다.';
      toast.error(msg);
    }
  };

  const filteredUsers = users.filter((usr) => {
    return (
      !quickFilterKeyword.trim() ||
      usr.loginId.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      usr.name.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      usr.email.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      usr.phone.includes(quickFilterKeyword)
    );
  });

  const columns: Column<MockMember>[] = [
    {
      key: 'loginId',
      header: '로그인 ID',
      render: (usr) => <span style={{ fontWeight: 600, color: '#60a5fa' }}>{usr.loginId}</span>,
    },
    {
      key: 'name',
      header: '성명',
      render: (usr) => <span style={{ fontWeight: 500 }}>{usr.name}</span>,
    },
    {
      key: 'department',
      header: '소속 부서',
      render: (usr) => {
        const deptLabel =
          usr.department === 'WAREHOUSE_OPERATOR'
            ? '창고 관리팀'
            : usr.department === 'INBOUND_OPERATOR'
              ? '입고 관리팀'
              : usr.department === 'OUTBOUND_OPERATOR'
                ? '출고 관리팀'
                : usr.department;
        return <span className={styles.unitBadge}>{deptLabel}</span>;
      },
    },
    {
      key: 'role',
      header: '권한 등급',
      render: (usr) => {
        const roleLabel =
          usr.role === 'ROLE_MANAGER'
            ? '현장 관리자 (Manager)'
            : usr.role === 'ROLE_OPERATOR'
              ? '현장 작업자 (Operator)'
              : '조회 전용 (Viewer)';
        return (
          <span
            style={{
              fontSize: '0.8rem',
              color: usr.role === 'ROLE_MANAGER' ? '#facc15' : '#cbd5e1',
              fontWeight: usr.role === 'ROLE_MANAGER' ? 600 : 400,
            }}
          >
            {roleLabel}
          </span>
        );
      },
    },
    {
      key: 'phone',
      header: '연락처',
      render: (usr) => <span>{usr.phone}</span>,
    },
    {
      key: 'email',
      header: '이메일',
      render: (usr) => <span style={{ color: '#94a3b8' }}>{usr.email}</span>,
    },
    {
      key: 'actions',
      header: '관리',
      align: 'center',
      render: (usr) => (
        <div className={styles.rowActionGroup} style={{ justifyContent: 'center' }}>
          <button className={styles.iconBtn} title="수정" onClick={() => handleEditRow(usr)}>
            <Edit2 size={14} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
            title="삭제"
            onClick={() => handleDeleteRow(usr)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const serverBadgeText = activeServerKeyword
    ? `'${activeServerKeyword}' (${users.length}건)`
    : `${users.length}건`;
  const quickBadgeText = quickFilterKeyword.trim()
    ? `'${quickFilterKeyword}' (${filteredUsers.length}건)`
    : undefined;

  return (
    <div className={styles.container}>
      <PageHeader
        icon={<UserCheck size={22} style={{ color: '#3b82f6' }} />}
        title="사용자 / 작업자 계정 관리"
        description="WMS Lite 시스템을 이용하는 현장 작업자 및 관리자 계정 권한을 등록하고 통제합니다."
      />

      {error ? (
        <ServerErrorPanel
          message={error}
          statusCode={errorStatus}
          onRetry={() => fetchUsers(true)}
        />
      ) : isInitialLoading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            백엔드 API 서버와 연결 및 사용자 데이터 조회 중입니다...
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Spring Boot 백엔드 서버(http://localhost:8080)에 접속하고 있습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 1단 라인: 🔍 검색 & 필터 조작 툴바 */}
          <PageToolbar
            left={
              <>
                <SearchInput
                  label="DB 전체 조회 검색"
                  badgeText={serverBadgeText}
                  badgeType="server"
                  value={serverSearchInput}
                  onChange={setServerSearchInput}
                  onSearch={handleServerSearch}
                  placeholder="아이디 / 성명 (Enter/조회)"
                />

                <SearchInput
                  label="상세검색 (결과 내 빠른 필터)"
                  badgeText={quickBadgeText}
                  badgeType="quick"
                  value={quickFilterKeyword}
                  onChange={setQuickFilterKeyword}
                  placeholder="결과 내 실시간 필터..."
                />
              </>
            }
          />

          {/* 2단 라인: ⚡ 액션 버튼 좌측 정렬 툴바 (PageActionBar) */}
          <PageActionBar
            left={
              <>
                <button className={styles.createBtn} onClick={handleOpenCreateModal}>
                  <Plus size={16} />
                  신규 사용자 등록
                </button>
                <button className={styles.editBtn} onClick={handleOpenEditModal}>
                  <Edit2 size={15} />
                  선택 수정
                </button>
                {selectedItemIds.length > 0 && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginLeft: '0.5rem',
                      padding: '0.35rem 0.65rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckSquare size={14} />
                    선택된 사용자: {selectedItemIds.length}명
                  </div>
                )}
              </>
            }
          />

          <DataGrid<MockMember>
            columns={columns}
            data={filteredUsers}
            keyExtractor={(usr) => usr.id}
            selectable
            selectedKeys={selectedItemIds}
            onSelectionChange={setSelectedItemIds}
            loading={gridLoading}
            pagination={{
              totalElements: filteredUsers.length,
              page: 1,
              size: 10,
            }}
          />
        </>
      )}

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={editingUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
