import React, { useState, useEffect } from 'react';
import { Building2, Edit2 } from 'lucide-react';
import { Modal } from '../../components/Modal';

export interface MockWarehouse {
  id: number;
  code: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  description?: string;
}

export interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CREATE' | 'EDIT';
  initialData?: MockWarehouse | null;
  onSubmit: (formData: Omit<MockWarehouse, 'id'> & { id?: number }) => void;
}

export const WarehouseFormModal: React.FC<WarehouseFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    address: string;
    manager: string;
    phone: string;
    description: string;
  }>({
    code: '',
    name: '',
    address: '',
    manager: '',
    phone: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'EDIT' && initialData) {
        setFormData({
          code: initialData.code || '',
          name: initialData.name || '',
          address: initialData.address === '-' ? '' : initialData.address || '',
          manager: initialData.manager === '-' ? '' : initialData.manager || '',
          phone: initialData.phone === '-' ? '' : initialData.phone || '',
          description: initialData.description || '',
        });
      } else {
        setFormData({
          code: '',
          name: '',
          address: '',
          manager: '',
          phone: '',
          description: '',
        });
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('창고 코드와 창고명은 필수 입력 항목입니다.');
      return;
    }

    onSubmit({
      id: initialData?.id,
      code: formData.code,
      name: formData.name,
      address: formData.address || '-',
      manager: formData.manager || '-',
      phone: formData.phone || '-',
      description: formData.description,
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
            창고 정보 수정 ({initialData?.code})
          </>
        ) : (
          <>
            <Building2 size={20} style={{ color: '#3b82f6' }} />
            신규 창고 등록
          </>
        )
      }
    >
      <Modal.Form onSubmit={handleSubmit}>
        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label required>창고 코드</Modal.Label>
            <Modal.Input
              required
              disabled={isEditMode}
              placeholder="예: WH-01"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label required>창고명</Modal.Label>
            <Modal.Input
              required
              placeholder="예: 메인 중앙 물류창고"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label>관리자 이름</Modal.Label>
            <Modal.Input
              placeholder="예: 김창고"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label>관리자 연락처</Modal.Label>
            <Modal.Input
              placeholder="예: 010-1234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormGroup>
          <Modal.Label>창고 위치 / 주소</Modal.Label>
          <Modal.Input
            placeholder="예: 경기도 이천시 대월면 물류단지로 102"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </Modal.FormGroup>

        <Modal.FormGroup>
          <Modal.Label>설명 / 비고</Modal.Label>
          <Modal.Textarea
            placeholder="창고 특이사항이나 설명을 입력하세요."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Modal.FormGroup>

        <Modal.Footer>
          <button type="button" className={Modal.styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button type="submit" className={Modal.styles.submitBtn}>
            {isEditMode ? '수정 완료' : '등록하기'}
          </button>
        </Modal.Footer>
      </Modal.Form>
    </Modal>
  );
};
