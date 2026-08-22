import React, { useState, useEffect } from 'react';
import { Users, Edit2 } from 'lucide-react';
import { Modal } from '../../components/Modal';

export interface MockCustomer {
  id: number;
  code: string;
  name: string;
  businessNo: string;
  ceoName: string;
  phone: string;
  email: string;
}

export interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CREATE' | 'EDIT';
  initialData?: MockCustomer | null;
  onSubmit: (formData: Omit<MockCustomer, 'id'> & { id?: number }) => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    businessNo: '',
    ceoName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'EDIT' && initialData) {
        setFormData({
          code: initialData.code || '',
          name: initialData.name || '',
          businessNo: initialData.businessNo === '-' ? '' : initialData.businessNo || '',
          ceoName: initialData.ceoName === '-' ? '' : initialData.ceoName || '',
          phone: initialData.phone === '-' ? '' : initialData.phone || '',
          email: initialData.email === '-' ? '' : initialData.email || '',
        });
      } else {
        setFormData({
          code: '',
          name: '',
          businessNo: '',
          ceoName: '',
          phone: '',
          email: '',
        });
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('고객사 코드와 고객사명은 필수 입력 항목입니다.');
      return;
    }

    onSubmit({
      id: initialData?.id,
      code: formData.code,
      name: formData.name,
      businessNo: formData.businessNo || '-',
      ceoName: formData.ceoName || '-',
      phone: formData.phone || '-',
      email: formData.email || '-',
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
            고객사 정보 수정 ({initialData?.code})
          </>
        ) : (
          <>
            <Users size={20} style={{ color: '#3b82f6' }} />
            신규 고객사 등록
          </>
        )
      }
    >
      <Modal.Form onSubmit={handleSubmit}>
        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label required>고객사 코드</Modal.Label>
            <Modal.Input
              required
              disabled={isEditMode}
              placeholder="예: CUST-COUPANG"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label required>고객사명 (상호)</Modal.Label>
            <Modal.Input
              required
              placeholder="예: (주)쿠팡"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label>사업자등록번호</Modal.Label>
            <Modal.Input
              placeholder="예: 211-88-54321"
              value={formData.businessNo}
              onChange={(e) => setFormData({ ...formData, businessNo: e.target.value })}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label>대표자명</Modal.Label>
            <Modal.Input
              placeholder="예: 강감찬"
              value={formData.ceoName}
              onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label>대표 전화번호</Modal.Label>
            <Modal.Input
              placeholder="예: 02-9876-5432"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label>대표 이메일</Modal.Label>
            <Modal.Input
              type="email"
              placeholder="예: order@customer.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

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
