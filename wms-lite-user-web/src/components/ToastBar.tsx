import React from 'react';
import toast, { Toaster, ToastBar as ReactHotToastBar } from 'react-hot-toast';
import { X } from 'lucide-react';

/**
 * 전역 알림 토스트 컴포넌트 (우측 닫기 ✕ 버튼 포함)
 */
export const ToastBar: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '0.9rem',
          borderRadius: '10px',
          background: '#1e293b',
          color: '#fff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      {(t) => (
        <ReactHotToastBar toast={t}>
          {({ icon, message }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              {icon}
              <div style={{ flex: 1 }}>{message}</div>
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                  title="닫기"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </ReactHotToastBar>
      )}
    </Toaster>
  );
};
