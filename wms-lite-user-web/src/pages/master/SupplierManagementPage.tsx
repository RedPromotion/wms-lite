import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Truck,
  CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, PageToolbar, PageActionBar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import { SupplierFormModal, type MockSupplier } from './SupplierFormModal';
import {
  getSuppliersApi,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
  type SupplierSummaryResponse,
} from '../../features/master/supplier';
import styles from '../../styles/CommonPage.module.css';

export const SupplierManagementPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<MockSupplier[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [serverSearchInput, setServerSearchInput] = useState('');
  const [activeServerKeyword, setActiveServerKeyword] = useState('');
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [editingSupplier, setEditingSupplier] = useState<MockSupplier | null>(null);

  const fetchSuppliers = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setGridLoading(true);
    }
    setError(null);

    try {
      const pageData = await getSuppliersApi({
        keyword: activeServerKeyword || undefined,
        size: 50,
      });

      const mapped: MockSupplier[] = (pageData.content || []).map((dto: SupplierSummaryResponse) => ({
        id: dto.id,
        code: dto.code,
        name: dto.name,
        businessNo: dto.businessNo || '-',
        ceoName: dto.ceoName || '-',
        phone: dto.phone || '-',
        email: dto.email || '-',
        address: '-',
      }));

      setSuppliers(mapped);
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
    fetchSuppliers(suppliers.length === 0);
  }, [activeServerKeyword]);

  const handleServerSearch = () => {
    setActiveServerKeyword(serverSearchInput.trim());
  };

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedItemIds.length === 0) {
      alert('수정할 공급업체를 체크박스에서 먼저 선택해 주세요.');
      return;
    }
    if (selectedItemIds.length > 1) {
      alert('한 번에 1개의 공급업체만 선택하여 수정할 수 있습니다.');
      return;
    }

    const target = suppliers.find((sup) => sup.id === selectedItemIds[0]);
    if (target) {
      setModalMode('EDIT');
      setEditingSupplier(target);
      setIsModalOpen(true);
    }
  };

  const handleEditRow = (supplier: MockSupplier) => {
    setModalMode('EDIT');
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteRow = async (supplier: MockSupplier) => {
    if (!window.confirm(`'${supplier.name} (${supplier.code})' 공급업체를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteSupplierApi(supplier.id);
      toast.success('공급업체가 성공적으로 삭제되었습니다.');
      fetchSuppliers(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '삭제에 실패했습니다.';
      toast.error(msg);
    }
  };

  const handleFormSubmit = async (formData: Omit<MockSupplier, 'id'> & { id?: number }) => {
    try {
      if (modalMode === 'CREATE') {
        await createSupplierApi({
          code: formData.code,
          name: formData.name,
          businessNo: formData.businessNo,
          ceoName: formData.ceoName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        });
        toast.success('신규 공급업체가 성공적으로 등록되었습니다!');
      } else if (formData.id) {
        await updateSupplierApi(formData.id, {
          name: formData.name,
          businessNo: formData.businessNo,
          ceoName: formData.ceoName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        });
        toast.success('공급업체 정보가 성공적으로 수정되었습니다!');
      }

      setIsModalOpen(false);
      fetchSuppliers(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '저장 중 오류가 발생했습니다.';
      toast.error(msg);
    }
  };

  const filteredSuppliers = suppliers.filter((sup) => {
    return (
      !quickFilterKeyword.trim() ||
      sup.code.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      sup.name.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      sup.businessNo.includes(quickFilterKeyword) ||
      sup.ceoName.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      sup.phone.includes(quickFilterKeyword)
    );
  });

  const columns: Column<MockSupplier>[] = [
    {
      key: 'code',
      header: '공급업체 코드',
      render: (sup) => <span style={{ fontWeight: 600, color: '#60a5fa' }}>{sup.code}</span>,
    },
    {
      key: 'name',
      header: '공급업체명 (상호)',
      render: (sup) => <span style={{ fontWeight: 500 }}>{sup.name}</span>,
    },
    {
      key: 'businessNo',
      header: '사업자등록번호',
      render: (sup) => <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{sup.businessNo}</span>,
    },
    {
      key: 'ceoName',
      header: '대표자명',
    },
    {
      key: 'phone',
      header: '대표 연락처',
      render: (sup) => <span>{sup.phone}</span>,
    },
    {
      key: 'email',
      header: '이메일',
      render: (sup) => <span style={{ color: '#94a3b8' }}>{sup.email}</span>,
    },
    {
      key: 'actions',
      header: '관리',
      align: 'center',
      render: (sup) => (
        <div className={styles.rowActionGroup} style={{ justifyContent: 'center' }}>
          <button className={styles.iconBtn} title="수정" onClick={() => handleEditRow(sup)}>
            <Edit2 size={14} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
            title="삭제"
            onClick={() => handleDeleteRow(sup)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const serverBadgeText = activeServerKeyword
    ? `'${activeServerKeyword}' (${suppliers.length}건)`
    : `${suppliers.length}건`;
  const quickBadgeText = quickFilterKeyword.trim()
    ? `'${quickFilterKeyword}' (${filteredSuppliers.length}건)`
    : undefined;

  return (
    <div className={styles.container}>
      <PageHeader
        icon={<Truck size={22} style={{ color: '#3b82f6' }} />}
        title="공급업체 관리 (입고처)"
        description="물류 창고 입고(Inbound)를 담당하는 공급업체/제조사 기준정보를 등록 및 관리합니다."
      />

      {error ? (
        <ServerErrorPanel
          message={error}
          onRetry={() => fetchSuppliers(true)}
        />
      ) : isInitialLoading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            백엔드 API 서버와 연결 및 공급업체 데이터 조회 중입니다...
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
                  placeholder="업체명 / 대표자 (Enter/조회)"
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
                  신규 공급업체 등록
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
                    선택된 공급업체: {selectedItemIds.length}개
                  </div>
                )}
              </>
            }
          />

          <DataGrid<MockSupplier>
            title="공급업체 기준정보 목록"
            titleIcon={<Truck size={17} style={{ color: '#3b82f6' }} />}
            columns={columns}
            data={filteredSuppliers}
            keyExtractor={(sup) => sup.id}
            selectable
            selectedKeys={selectedItemIds}
            onSelectionChange={setSelectedItemIds}
            loading={gridLoading}
            enableExcelExport={true}
            excelFileName="WMS_공급업체기준정보_목록"
            pagination={{
              totalElements: filteredSuppliers.length,
              page: 1,
              size: 10,
            }}
          />
        </>
      )}

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={editingSupplier}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
