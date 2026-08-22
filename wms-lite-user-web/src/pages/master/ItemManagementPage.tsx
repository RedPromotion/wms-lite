import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, PageToolbar, PageActionBar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { SearchableSelect, type SelectOption } from '../../components/SearchableSelect';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import { ItemFormModal, type MockItem } from './ItemFormModal';
import {
  getItemsApi,
  createItemApi,
  updateItemApi,
  deleteItemApi,
  type ItemSummaryResponse,
} from '../../features/master/item';
import styles from '../../styles/CommonPage.module.css';

const CATEGORY_FILTER_OPTIONS: SelectOption[] = [
  { label: '전체 카테고리', value: 'ALL' },
  { label: '전자기기/주변기기', value: '전자기기/주변기기' },
  { label: '디스플레이', value: '디스플레이' },
  { label: '물류자재/포장', value: '물류자재/포장' },
  { label: '생활용품/가전', value: '생활용품/가전' },
  { label: '사무용품/문구', value: '사무용품/문구' },
];

export const ItemManagementPage: React.FC = () => {
  const [items, setItems] = useState<MockItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [serverSearchInput, setServerSearchInput] = useState('');
  const [activeServerKeyword, setActiveServerKeyword] = useState('');
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [editingItem, setEditingItem] = useState<MockItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setGridLoading(true);
    }
    setError(null);

    try {
      const pageData = await getItemsApi({
        keyword: activeServerKeyword || undefined,
        size: 50,
      });

      const mappedItems: MockItem[] = (pageData.content || []).map((dto: ItemSummaryResponse) => ({
        id: dto.id,
        code: dto.code,
        name: dto.name,
        barcode: dto.barcode || '-',
        categoryName: dto.categoryName || '기타',
        supplierName: dto.supplierName || '자체생산',
        specification: dto.specification || '-',
        unit: dto.unit || 'EA',
        safetyStockQuantity: dto.safetyStockQuantity ?? null,
      }));

      setItems(mappedItems);
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
    fetchItems(items.length === 0);
  }, [activeServerKeyword]);

  const handleServerSearch = () => {
    setActiveServerKeyword(serverSearchInput.trim());
  };

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setEditingItem(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedItemIds.length === 0) {
      alert('수정할 품목을 체크박스에서 먼저 선택해 주세요.');
      return;
    }
    if (selectedItemIds.length > 1) {
      alert('한 번에 1개의 품목만 선택하여 수정할 수 있습니다.');
      return;
    }

    const targetItem = items.find((item) => item.id === selectedItemIds[0]);
    if (targetItem) {
      setModalMode('EDIT');
      setEditingItem(targetItem);
      setFormError(null);
      setIsModalOpen(true);
    }
  };

  const handleEditRow = (item: MockItem) => {
    setModalMode('EDIT');
    setEditingItem(item);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteRow = async (item: MockItem) => {
    if (!window.confirm(`'${item.name} (${item.code})' 품목을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteItemApi(item.id);
      toast.success('품목이 성공적으로 삭제되었습니다.');
      fetchItems(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '품목 삭제에 실패했습니다.';
      toast.error(msg);
    }
  };

  const handleFormSubmit = async (formData: Omit<MockItem, 'id'> & { id?: number }) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (modalMode === 'CREATE') {
        await createItemApi({
          code: formData.code,
          name: formData.name,
          barcode: formData.barcode,
          specification: formData.specification,
          unit: formData.unit as any,
          description: formData.description,
          safetyStockQuantity: formData.safetyStockQuantity ?? undefined,
        });
        toast.success('신규 품목이 성공적으로 등록되었습니다!');
      } else if (formData.id) {
        await updateItemApi(formData.id, {
          name: formData.name,
          barcode: formData.barcode,
          specification: formData.specification,
          unit: formData.unit as any,
          description: formData.description,
          safetyStockQuantity: formData.safetyStockQuantity ?? undefined,
        });
        toast.success('품목 정보가 성공적으로 수정되었습니다!');
      }

      setIsModalOpen(false);
      fetchItems(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '저장 중 오류가 발생했습니다.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesQuickFilter =
      !quickFilterKeyword.trim() ||
      item.code.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      item.name.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      item.barcode.includes(quickFilterKeyword);
    const matchesCategory =
      selectedCategory === 'ALL' || item.categoryName === selectedCategory;

    return matchesQuickFilter && matchesCategory;
  });

  const columns: Column<MockItem>[] = [
    {
      key: 'code',
      header: '품목 코드',
      render: (item) => <span style={{ fontWeight: 600, color: '#60a5fa' }}>{item.code}</span>,
    },
    {
      key: 'name',
      header: '품목명',
      render: (item) => <span style={{ fontWeight: 500 }}>{item.name}</span>,
    },
    {
      key: 'barcode',
      header: '바코드',
      render: (item) => <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{item.barcode}</span>,
    },
    {
      key: 'categoryName',
      header: '카테고리',
    },
    {
      key: 'supplierName',
      header: '공급업체',
    },
    {
      key: 'specification',
      header: '규격',
      render: (item) => <span style={{ color: '#cbd5e1' }}>{item.specification}</span>,
    },
    {
      key: 'safetyStockQuantity',
      header: '안전재고 설정',
      align: 'right',
      render: (item) =>
        item.safetyStockQuantity ? (
          <span style={{ fontWeight: 600, color: '#f59e0b' }}>
            {item.safetyStockQuantity.toLocaleString()} {item.unit || 'EA'}
          </span>
        ) : (
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>미지정 (비관리)</span>
        ),
    },
    {
      key: 'unit',
      header: '단위',
      align: 'center',
      render: (item) => <span className={styles.unitBadge}>{item.unit}</span>,
    },
    {
      key: 'actions',
      header: '관리',
      align: 'center',
      render: (item) => (
        <div className={styles.rowActionGroup} style={{ justifyContent: 'center' }}>
          <button className={styles.iconBtn} title="수정" onClick={() => handleEditRow(item)}>
            <Edit2 size={14} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
            title="삭제"
            onClick={() => handleDeleteRow(item)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const serverBadgeText = activeServerKeyword
    ? `'${activeServerKeyword}' (${items.length}건)`
    : `${items.length}건`;
  const quickBadgeText = quickFilterKeyword.trim()
    ? `'${quickFilterKeyword}' (${filteredItems.length}건)`
    : undefined;

  return (
    <div className={styles.container}>
      <PageHeader
        icon={<Package size={22} style={{ color: '#3b82f6' }} />}
        title="품목 관리"
        description="물류 창고에서 취급하는 모든 상품(SKU) 기준정보를 등록 및 관리합니다."
      />

      {error ? (
        <ServerErrorPanel
          message={error}
          onRetry={() => fetchItems(true)}
        />
      ) : isInitialLoading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            백엔드 API 서버와 연결 및 품목 데이터 조회 중입니다...
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
                  placeholder="품목코드 / 품목명 (Enter/조회)"
                />

                <SearchInput
                  label="상세검색 (결과 내 빠른 필터)"
                  badgeText={quickBadgeText}
                  badgeType="quick"
                  value={quickFilterKeyword}
                  onChange={setQuickFilterKeyword}
                  placeholder="결과 내 실시간 필터..."
                />

                <div className={styles.categorySelectWrapper}>
                  <span className={styles.selectLabel}>카테고리 선택</span>
                  <SearchableSelect
                    options={CATEGORY_FILTER_OPTIONS}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    placeholder="카테고리 선택"
                  />
                </div>
              </>
            }
          />

          {/* 2단 라인: ⚡ 액션 버튼 툴바 (PageActionBar) */}
          <PageActionBar
            left={
              <>
                <button className={styles.createBtn} onClick={handleOpenCreateModal}>
                  <Plus size={16} />
                  신규 품목 등록
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
                    선택된 품목: {selectedItemIds.length}개
                  </div>
                )}
              </>
            }
          />

          <DataGrid<MockItem>
            title="품목 기준정보 목록"
            titleIcon={<Package size={17} style={{ color: '#3b82f6' }} />}
            columns={columns}
            data={filteredItems}
            keyExtractor={(item) => item.id}
            selectable
            selectedKeys={selectedItemIds}
            onSelectionChange={setSelectedItemIds}
            loading={gridLoading}
            enableExcelExport={true}
            excelFileName="WMS_품목기준정보_목록"
            pagination={{
              totalElements: filteredItems.length,
              page: 1,
              size: 10,
            }}
          />
        </>
      )}

      <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={editingItem}
        onSubmit={handleFormSubmit}
        formError={formError}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
