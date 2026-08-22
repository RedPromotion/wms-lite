import React, { useState, useEffect } from 'react';
import { Package, Edit2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { SearchableSelect, type SelectOption } from '../../components/SearchableSelect';

// 품목 데이터 인터페이스
export interface MockItem {
  id: number;
  code: string;
  name: string;
  barcode: string;
  categoryName: string;
  supplierName: string;
  specification: string;
  unit: string;
  description?: string;
  safetyStockQuantity?: number | null;
}

// 카테고리 옵션
const CATEGORY_OPTIONS: SelectOption[] = [
  { label: '전자기기/주변기기', value: '전자기기/주변기기' },
  { label: '디스플레이', value: '디스플레이' },
  { label: '물류자재/포장', value: '물류자재/포장' },
  { label: '생활용품/가전', value: '생활용품/가전' },
  { label: '사무용품/문구', value: '사무용품/문구' },
];

// 공급업체 옵션
const SUPPLIER_OPTIONS: SelectOption[] = [
  { label: '(주)로지텍코리아', value: '(주)로지텍코리아' },
  { label: '삼성전자(주)', value: '삼성전자(주)' },
  { label: '(주)벨킨코리아', value: '(주)벨킨코리아' },
  { label: '한국파렛트풀(주)', value: '한국파렛트풀(주)' },
  { label: 'LG전자(주)', value: 'LG전자(주)' },
];

export interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CREATE' | 'EDIT';
  initialData?: MockItem | null;
  onSubmit: (formData: Omit<MockItem, 'id'> & { id?: number }) => Promise<void> | void;
  formError?: string | null;
  isSubmitting?: boolean;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  formError = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    barcode: '',
    categoryName: '전자기기/주변기기',
    supplierName: '(주)로지텍코리아',
    unit: 'EA',
    specification: '',
    description: '',
    safetyStockQuantity: '' as number | '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'EDIT' && initialData) {
        setFormData({
          code: initialData.code || '',
          name: initialData.name || '',
          barcode: initialData.barcode === '-' ? '' : initialData.barcode || '',
          categoryName: initialData.categoryName || '전자기기/주변기기',
          supplierName: initialData.supplierName || '(주)로지텍코리아',
          unit: initialData.unit || 'EA',
          specification: initialData.specification === '-' ? '' : initialData.specification || '',
          description: initialData.description || '',
          safetyStockQuantity: initialData.safetyStockQuantity ?? '',
        });
      } else {
        setFormData({
          code: '',
          name: '',
          barcode: '',
          categoryName: '전자기기/주변기기',
          supplierName: '(주)로지텍코리아',
          unit: 'EA',
          specification: '',
          description: '',
          safetyStockQuantity: '',
        });
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('품목 코드와 품목명은 필수 입력 항목입니다.');
      return;
    }

    await onSubmit({
      id: initialData?.id,
      code: formData.code,
      name: formData.name,
      barcode: formData.barcode || '-',
      categoryName: formData.categoryName,
      supplierName: formData.supplierName,
      specification: formData.specification || '-',
      unit: formData.unit,
      description: formData.description,
      safetyStockQuantity: formData.safetyStockQuantity === '' ? null : Number(formData.safetyStockQuantity),
    });
  };

  const isEditMode = mode === 'EDIT';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode ? (
          <>
            <Edit2 size={20} style={{ color: '#3b82f6' }} />
            품목 정보 수정 ({initialData?.code})
          </>
        ) : (
          <>
            <Package size={20} style={{ color: '#3b82f6' }} />
            신규 품목 등록
          </>
        )
      }
    >
      <Modal.Form onSubmit={handleSubmit}>
        {/* 모달 폼 에러 알림 띠 */}
        {formError && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label required>품목 코드</Modal.Label>
            <Modal.Input
              required
              disabled={isEditMode}
              placeholder="예: ITM-2026-006"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label required>품목명</Modal.Label>
            <Modal.Input
              required
              placeholder="예: 무선 게이밍 헤드셋"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label>바코드</Modal.Label>
            <Modal.Input
              placeholder="예: 8801234567895"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label>단위</Modal.Label>
            <Modal.Select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              <option value="EA">EA (낱개)</option>
              <option value="BOX">BOX (박스)</option>
              <option value="PALLET">PALLET (팔레트)</option>
              <option value="KG">KG (킬로그램)</option>
              <option value="L">L (리터)</option>
              <option value="SET">SET (세트)</option>
            </Modal.Select>
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label>품목 카테고리</Modal.Label>
            <SearchableSelect
              options={CATEGORY_OPTIONS}
              value={formData.categoryName}
              onChange={(val) => setFormData({ ...formData, categoryName: val })}
              width="100%"
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label>공급업체</Modal.Label>
            <SearchableSelect
              options={SUPPLIER_OPTIONS}
              value={formData.supplierName}
              onChange={(val) => setFormData({ ...formData, supplierName: val })}
              width="100%"
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label>규격 / 치수</Modal.Label>
            <Modal.Input
              placeholder="예: 180x200x90mm / 320g"
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label>안전재고 설정 (Safety Stock)</Modal.Label>
            <Modal.Input
              type="number"
              min="0"
              placeholder="미입력 시 안전재고 비관리 품목"
              value={formData.safetyStockQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  safetyStockQuantity: e.target.value === '' ? '' : Number(e.target.value),
                })
              }
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormGroup>
          <Modal.Label>설명 / 비고</Modal.Label>
          <Modal.Textarea
            placeholder="품목 특이사항이나 설명을 입력하세요."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Modal.FormGroup>

        <Modal.Footer>
          <button
            type="button"
            className={Modal.styles.cancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className={Modal.styles.submitBtn}
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? '처리 중...' : isEditMode ? '수정 완료' : '등록하기'}
          </button>
        </Modal.Footer>
      </Modal.Form>
    </Modal>
  );
};
