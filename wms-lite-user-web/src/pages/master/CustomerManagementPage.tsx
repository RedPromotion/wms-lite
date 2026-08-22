import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, PageToolbar, PageActionBar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import { CustomerFormModal, type MockCustomer } from './CustomerFormModal';
import {
  getCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  type CustomerSummaryResponse,
} from '../../features/master/customer';
import styles from '../../styles/CommonPage.module.css';

export const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<MockCustomer[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [serverSearchInput, setServerSearchInput] = useState('');
  const [activeServerKeyword, setActiveServerKeyword] = useState('');
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [editingCustomer, setEditingCustomer] = useState<MockCustomer | null>(null);

  const fetchCustomers = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setGridLoading(true);
    }
    setError(null);

    try {
      const pageData = await getCustomersApi({
        keyword: activeServerKeyword || undefined,
        size: 50,
      });

      const mapped: MockCustomer[] = (pageData.content || []).map((dto: CustomerSummaryResponse) => ({
        id: dto.id,
        code: dto.code,
        name: dto.name,
        businessNo: dto.businessNo || '-',
        ceoName: dto.ceoName || '-',
        phone: dto.phone || '-',
        email: dto.email || '-',
      }));

      setCustomers(mapped);
    } catch (err: unknown) {
      const errorMessage =
        (err as { message?: string }).message ||
        '백엔드 API 서버(http://localhost:8080)와 통신할 수 없습니다.';
      setError(errorMessage);
    } finally {
      setIsInitialLoading(false);
      setGridLoading(false);
    }
  }, [activeServerKeyword]);

  useEffect(() => {
    fetchCustomers(customers.length === 0);
  }, [activeServerKeyword]);

  const handleServerSearch = () => {
    setActiveServerKeyword(serverSearchInput.trim());
  };

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedItemIds.length === 0) {
      alert('수정할 고객사를 체크박스에서 먼저 선택해 주세요.');
      return;
    }
    if (selectedItemIds.length > 1) {
      alert('한 번에 1개의 고객사만 선택하여 수정할 수 있습니다.');
      return;
    }

    const target = customers.find((cust) => cust.id === selectedItemIds[0]);
    if (target) {
      setModalMode('EDIT');
      setEditingCustomer(target);
      setIsModalOpen(true);
    }
  };

  const handleEditRow = (customer: MockCustomer) => {
    setModalMode('EDIT');
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteRow = async (customer: MockCustomer) => {
    if (!window.confirm(`'${customer.name} (${customer.code})' 고객사를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteCustomerApi(customer.id);
      toast.success('고객사가 성공적으로 삭제되었습니다.');
      fetchCustomers(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '삭제에 실패했습니다.';
      toast.error(msg);
    }
  };

  const handleFormSubmit = async (formData: Omit<MockCustomer, 'id'> & { id?: number }) => {
    try {
      if (modalMode === 'CREATE') {
        await createCustomerApi({
          code: formData.code,
          name: formData.name,
          businessNo: formData.businessNo,
          ceoName: formData.ceoName,
          phone: formData.phone,
          email: formData.email,
        });
        toast.success('신규 고객사가 성공적으로 등록되었습니다!');
      } else if (formData.id) {
        await updateCustomerApi(formData.id, {
          name: formData.name,
          businessNo: formData.businessNo,
          ceoName: formData.ceoName,
          phone: formData.phone,
          email: formData.email,
        });
        toast.success('고객사 정보가 성공적으로 수정되었습니다!');
      }

      setIsModalOpen(false);
      fetchCustomers(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '저장 중 오류가 발생했습니다.';
      toast.error(msg);
    }
  };

  const filteredCustomers = customers.filter((cust) => {
    return (
      !quickFilterKeyword.trim() ||
      cust.code.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      cust.name.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      cust.businessNo.includes(quickFilterKeyword) ||
      cust.ceoName.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      cust.phone.includes(quickFilterKeyword)
    );
  });

  const columns: Column<MockCustomer>[] = [
    {
      key: 'code',
      header: '고객사 코드',
      render: (cust) => <span style={{ fontWeight: 600, color: '#60a5fa' }}>{cust.code}</span>,
    },
    {
      key: 'name',
      header: '고객사명 (상호)',
      render: (cust) => <span style={{ fontWeight: 500 }}>{cust.name}</span>,
    },
    {
      key: 'businessNo',
      header: '사업자등록번호',
      render: (cust) => <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{cust.businessNo}</span>,
    },
    {
      key: 'ceoName',
      header: '대표자명',
    },
    {
      key: 'phone',
      header: '대표 연락처',
      render: (cust) => <span>{cust.phone}</span>,
    },
    {
      key: 'email',
      header: '이메일',
      render: (cust) => <span style={{ color: '#94a3b8' }}>{cust.email}</span>,
    },
    {
      key: 'actions',
      header: '관리',
      align: 'center',
      render: (cust) => (
        <div className={styles.rowActionGroup} style={{ justifyContent: 'center' }}>
          <button className={styles.iconBtn} title="수정" onClick={() => handleEditRow(cust)}>
            <Edit2 size={14} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
            title="삭제"
            onClick={() => handleDeleteRow(cust)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const serverBadgeText = activeServerKeyword
    ? `'${activeServerKeyword}' (${customers.length}건)`
    : `${customers.length}건`;
  const quickBadgeText = quickFilterKeyword.trim()
    ? `'${quickFilterKeyword}' (${filteredCustomers.length}건)`
    : undefined;

  return (
    <div className={styles.container}>
      <PageHeader
        icon={<Users size={22} style={{ color: '#3b82f6' }} />}
        title="고객사 관리 (출고처)"
        description="물류 창고 출고(Outbound) 및 납품을 수령하는 고객사/유통망 기준정보를 관리합니다."
      />

      {error ? (
        <ServerErrorPanel
          message={error}
          onRetry={() => fetchCustomers(true)}
        />
      ) : isInitialLoading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            백엔드 API 서버와 연결 및 고객사 데이터 조회 중입니다...
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
                  placeholder="고객사명 / 대표자 (Enter/조회)"
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
                  신규 고객사 등록
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
                    선택된 고객사: {selectedItemIds.length}개
                  </div>
                )}
              </>
            }
          />

          <DataGrid<MockCustomer>
            title="고객사 기준정보 목록"
            titleIcon={<Users size={17} style={{ color: '#3b82f6' }} />}
            columns={columns}
            data={filteredCustomers}
            keyExtractor={(cust) => cust.id}
            selectable
            selectedKeys={selectedItemIds}
            onSelectionChange={setSelectedItemIds}
            loading={gridLoading}
            enableExcelExport={true}
            excelFileName="WMS_고객사기준정보_목록"
            pagination={{
              totalElements: filteredCustomers.length,
              page: 1,
              size: 10,
            }}
          />
        </>
      )}

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={editingCustomer}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
