import React, { useState, useEffect } from 'react';
import { Truck, Edit2 } from 'lucide-react';
import { Modal } from '../../components/Modal';

export interface MockSupplier {
  id: number;
  code: string;
  name: string;
  businessNo: string;
  ceoName: string;
  phone: string;
  email: string;
  address: string;
}

export interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CREATE' | 'EDIT';
  initialData?: MockSupplier | null;
  onSubmit: (formData: Omit<MockSupplier, 'id'> & { id?: number }) => void;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
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
    address: '',
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
          address: initialData.address === '-' ? '' : initialData.address || '',
        });
      } else {
        setFormData({
          code: '',
          name: '',
          businessNo: '',
          ceoName: '',
          phone: '',
          email: '',
          address: '',
        });
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('공급업체 코드와 공급업체명은 필수 입력 항목입니다.');
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
      address: formData.address || '-',
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
            공급업체 정보 수정 ({initialData?.code})
          </>
        ) : (
          <>
            <Truck size={20} style={{ color: '#3b82f6' }} />
            신규 공급업체 등록
          </>
        )
      }
    >
      <Modal.Form onSubmit={handleSubmit}>
        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label required>공급업체 코드</Modal.Label>
            <Modal.Input
              required
              disabled={isEditMode}
              placeholder="예: SUP-LOGITECH"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label required>공급업체명 (상호)</Modal.Label>
            <Modal.Input
              required
              placeholder="예: (주)로지텍코리아"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label>사업자등록번호</Modal.Label>
            <Modal.Input
              placeholder="예: 120-81-12345"
              value={formData.businessNo}
              onChange={(e) => setFormData({ ...formData, businessNo: e.target.value })}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label>대표자명</Modal.Label>
            <Modal.Input
              placeholder="예: 홍길동"
              value={formData.ceoName}
              onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label>대표 전화번호</Modal.Label>
            <Modal.Input
              placeholder="예: 02-1234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label>대표 이메일</Modal.Label>
            <Modal.Input
              type="email"
              placeholder="예: contact@supplier.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormGroup>
          <Modal.Label>회사 주소</Modal.Label>
          <Modal.Input
            placeholder="예: 서울특별시 강남구 테헤란로 123 4층"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
