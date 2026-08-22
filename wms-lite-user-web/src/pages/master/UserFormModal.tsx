import React, { useState, useEffect } from 'react';
import { UserCog, Edit2 } from 'lucide-react';
import { Modal } from '../../components/Modal';
import type { DepartmentType, MemberRoleType } from '../../features/master/user';

export interface MockMember {
  id: number;
  loginId: string;
  name: string;
  email: string;
  phone: string;
  department: DepartmentType;
  role: MemberRoleType;
  lastLoginAt?: string;
}

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CREATE' | 'EDIT';
  initialData?: MockMember | null;
  onSubmit: (formData: Omit<MockMember, 'id'> & { id?: number; password?: string }) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<{
    loginId: string;
    name: string;
    password: string;
    email: string;
    phone: string;
    department: DepartmentType;
    role: MemberRoleType;
  }>({
    loginId: '',
    name: '',
    password: '',
    email: '',
    phone: '',
    department: 'WAREHOUSE_OPERATOR',
    role: 'ROLE_OPERATOR',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'EDIT' && initialData) {
        setFormData({
          loginId: initialData.loginId || '',
          name: initialData.name || '',
          password: '', // 수정 시 비밀번호는 기본 빈값 (입력시에만 변경)
          email: initialData.email || '',
          phone: initialData.phone === '-' ? '' : initialData.phone || '',
          department: initialData.department || 'WAREHOUSE_OPERATOR',
          role: initialData.role || 'ROLE_OPERATOR',
        });
      } else {
        setFormData({
          loginId: '',
          name: '',
          password: '',
          email: '',
          phone: '',
          department: 'WAREHOUSE_OPERATOR',
          role: 'ROLE_OPERATOR',
        });
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loginId.trim() || !formData.name.trim() || !formData.email.trim()) {
      alert('로그인 ID, 이름, 이메일은 필수 입력 항목입니다.');
      return;
    }

    if (mode === 'CREATE' && !formData.password.trim()) {
      alert('신규 계정 등록 시 비밀번호는 필수 입력 항목입니다.');
      return;
    }

    onSubmit({
      id: initialData?.id,
      loginId: formData.loginId,
      name: formData.name,
      password: formData.password,
      email: formData.email,
      phone: formData.phone || '-',
      department: formData.department,
      role: formData.role,
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
            사용자 계정 정보 수정 ({initialData?.loginId})
          </>
        ) : (
          <>
            <UserCog size={20} style={{ color: '#3b82f6' }} />
            신규 사용자 계정 등록
          </>
        )
      }
    >
      <Modal.Form onSubmit={handleSubmit}>
        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label required>로그인 아이디</Modal.Label>
            <Modal.Input
              required
              disabled={isEditMode}
              placeholder="예: worker01"
              value={formData.loginId}
              onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
              style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label required={!isEditMode}>
              비밀번호 {isEditMode && <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '4px' }}>(변경 시에만 입력)</span>}
            </Modal.Label>
            <Modal.Input
              type="password"
              required={!isEditMode}
              placeholder={isEditMode ? '새 비밀번호 (미입력 시 기존 유발)' : '초기 비밀번호 입력'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label required>사용자 이름</Modal.Label>
            <Modal.Input
              required
              placeholder="예: 홍길동"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label required>이메일 주소</Modal.Label>
            <Modal.Input
              type="email"
              required
              placeholder="예: worker01@wms.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormRow>
          <Modal.FormGroup>
            <Modal.Label>담당 부서</Modal.Label>
            <Modal.Select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentType })}
            >
              <option value="WAREHOUSE_OPERATOR">창고 관리팀 (WAREHOUSE)</option>
              <option value="INBOUND_OPERATOR">입고 관리팀 (INBOUND)</option>
              <option value="OUTBOUND_OPERATOR">출고 관리팀 (OUTBOUND)</option>
              <option value="INVENTORY_AUDITOR">재고 조사팀 (AUDIT)</option>
              <option value="VIEWER">조회 전용 (VIEWER)</option>
            </Modal.Select>
          </Modal.FormGroup>

          <Modal.FormGroup>
            <Modal.Label>시스템 권한 (Role)</Modal.Label>
            <Modal.Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRoleType })}
            >
              <option value="ROLE_MANAGER">ROLE_MANAGER (현장 매니저/관리자)</option>
              <option value="ROLE_OPERATOR">ROLE_OPERATOR (현장 작업자)</option>
              <option value="ROLE_VIEWER">ROLE_VIEWER (조회 전용 사용자)</option>
            </Modal.Select>
          </Modal.FormGroup>
        </Modal.FormRow>

        <Modal.FormGroup>
          <Modal.Label>연락처</Modal.Label>
          <Modal.Input
            placeholder="예: 010-1234-5678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
