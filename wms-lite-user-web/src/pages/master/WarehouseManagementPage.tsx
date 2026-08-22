import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, PageToolbar, PageActionBar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import { WarehouseFormModal, type MockWarehouse } from './WarehouseFormModal';
import {
  getWarehousesApi,
  createWarehouseApi,
  updateWarehouseApi,
  deleteWarehouseApi,
  type WarehouseSummaryResponse,
} from '../../features/master/warehouse';
import styles from '../../styles/CommonPage.module.css';

export const WarehouseManagementPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<MockWarehouse[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [serverSearchInput, setServerSearchInput] = useState('');
  const [activeServerKeyword, setActiveServerKeyword] = useState('');
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [editingWarehouse, setEditingWarehouse] = useState<MockWarehouse | null>(null);

  const fetchWarehouses = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setGridLoading(true);
    }
    setError(null);

    try {
      const pageData = await getWarehousesApi({
        keyword: activeServerKeyword || undefined,
        size: 50,
      });

      const mapped: MockWarehouse[] = (pageData.content || []).map((dto: WarehouseSummaryResponse) => ({
        id: dto.id,
        code: dto.code,
        name: dto.name,
        address: dto.address || '-',
        manager: dto.manager || '-',
        phone: dto.phone || '-',
      }));

      setWarehouses(mapped);
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
    fetchWarehouses(warehouses.length === 0);
  }, [activeServerKeyword]);

  const handleServerSearch = () => {
    setActiveServerKeyword(serverSearchInput.trim());
  };

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedItemIds.length === 0) {
      alert('수정할 창고를 체크박스에서 먼저 선택해 주세요.');
      return;
    }
    if (selectedItemIds.length > 1) {
      alert('한 번에 1개의 창고만 선택하여 수정할 수 있습니다.');
      return;
    }

    const target = warehouses.find((wh) => wh.id === selectedItemIds[0]);
    if (target) {
      setModalMode('EDIT');
      setEditingWarehouse(target);
      setIsModalOpen(true);
    }
  };

  const handleEditRow = (warehouse: MockWarehouse) => {
    setModalMode('EDIT');
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleDeleteRow = async (warehouse: MockWarehouse) => {
    if (!window.confirm(`'${warehouse.name} (${warehouse.code})' 창고를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteWarehouseApi(warehouse.id);
      toast.success('창고 정보가 성공적으로 삭제되었습니다.');
      fetchWarehouses(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '삭제에 실패했습니다.';
      toast.error(msg);
    }
  };

  const handleFormSubmit = async (formData: Omit<MockWarehouse, 'id'> & { id?: number }) => {
    try {
      if (modalMode === 'CREATE') {
        await createWarehouseApi({
          code: formData.code,
          name: formData.name,
          address: formData.address,
          manager: formData.manager,
          phone: formData.phone,
          description: formData.description,
        });
        toast.success('신규 창고가 성공적으로 등록되었습니다!');
      } else if (formData.id) {
        await updateWarehouseApi(formData.id, {
          name: formData.name,
          address: formData.address,
          manager: formData.manager,
          phone: formData.phone,
          description: formData.description,
        });
        toast.success('창고 정보가 성공적으로 수정되었습니다!');
      }

      setIsModalOpen(false);
      fetchWarehouses(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '저장 중 오류가 발생했습니다.';
      toast.error(msg);
    }
  };

  const filteredWarehouses = warehouses.filter((wh) => {
    return (
      !quickFilterKeyword.trim() ||
      wh.code.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      wh.name.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      wh.address.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      wh.manager.toLowerCase().includes(quickFilterKeyword.toLowerCase())
    );
  });

  const columns: Column<MockWarehouse>[] = [
    {
      key: 'code',
      header: '창고 코드',
      render: (wh) => <span style={{ fontWeight: 600, color: '#60a5fa' }}>{wh.code}</span>,
    },
    {
      key: 'name',
      header: '창고명',
      render: (wh) => <span style={{ fontWeight: 500 }}>{wh.name}</span>,
    },
    {
      key: 'address',
      header: '창고 위치 / 주소',
      render: (wh) => <span style={{ color: '#cbd5e1' }}>{wh.address}</span>,
    },
    {
      key: 'manager',
      header: '담당 관리자',
      render: (wh) => (
        <span>
          {wh.manager}{' '}
          {wh.phone && wh.phone !== '-' && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({wh.phone})</span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '관리',
      align: 'center',
      render: (wh) => (
        <div className={styles.rowActionGroup} style={{ justifyContent: 'center' }}>
          <button className={styles.iconBtn} title="수정" onClick={() => handleEditRow(wh)}>
            <Edit2 size={14} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
            title="삭제"
            onClick={() => handleDeleteRow(wh)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const serverBadgeText = activeServerKeyword
    ? `'${activeServerKeyword}' (${warehouses.length}건)`
    : `${warehouses.length}건`;
  const quickBadgeText = quickFilterKeyword.trim()
    ? `'${quickFilterKeyword}' (${filteredWarehouses.length}건)`
    : undefined;

  return (
    <div className={styles.container}>
      <PageHeader
        icon={<Building2 size={22} style={{ color: '#3b82f6' }} />}
        title="창고 관리"
        description="물류 센터별 창고 기준정보, 주소 및 담당 관리자를 등록하고 관리합니다."
      />

      {error ? (
        <ServerErrorPanel
          message={error}
          onRetry={() => fetchWarehouses(true)}
        />
      ) : isInitialLoading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            백엔드 API 서버와 연결 및 창고 데이터 조회 중입니다...
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
                  placeholder="창고코드 / 창고명 (Enter/조회)"
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

          {/* 2단 라인: ⚡ 액션 버튼 툴바 (PageActionBar) */}
          <PageActionBar
            left={
              <>
                <button className={styles.createBtn} onClick={handleOpenCreateModal}>
                  <Plus size={16} />
                  신규 창고 등록
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
                    선택된 창고: {selectedItemIds.length}개
                  </div>
                )}
              </>
            }
          />

          <DataGrid<MockWarehouse>
            title="창고 기준정보 목록"
            titleIcon={<Building2 size={17} style={{ color: '#3b82f6' }} />}
            columns={columns}
            data={filteredWarehouses}
            keyExtractor={(wh) => wh.id}
            selectable
            selectedKeys={selectedItemIds}
            onSelectionChange={setSelectedItemIds}
            loading={gridLoading}
            enableExcelExport={true}
            excelFileName="WMS_창고기준정보_목록"
            pagination={{
              totalElements: filteredWarehouses.length,
              page: 1,
              size: 10,
            }}
          />
        </>
      )}

      <WarehouseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={editingWarehouse}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
