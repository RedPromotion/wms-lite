import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell,
  Search,
  Plus,
  Pin,
  Eye,
  Calendar,
  User,
  MessageSquare,
  Send,
  X,
  Trash2,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/useAuthStore';
import { DataGrid, type Column } from '../../components/DataGrid';
import {
  getNoticeList,
  getNoticeDetail,
  createNotice,
  updateNotice,
  deleteNotice,
  createNoticeComment,
  deleteNoticeComment,
} from '../../features/board/api/boardApi';
import type {
  NoticeSummary,
  NoticeDetail,
  NoticeCreateRequest,
} from '../../features/board/types/boardTypes';

export const NoticeBoardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role?.includes('ADMIN');

  const [notices, setNotices] = useState<NoticeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // 모달 상태
  const [selectedNotice, setSelectedNotice] = useState<NoticeDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 폼 입력 상태
  const [formData, setFormData] = useState<NoticeCreateRequest>({
    title: '',
    content: '',
    isPinned: false,
    isPopup: false,
  });

  // 댓글 입력 상태
  const [commentInput, setCommentInput] = useState<string>('');

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNoticeList(searchKeyword, page, 10);
      setNotices(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch (err: any) {
      console.error('공지사항 목록 조회 실패:', err);
      const errMsg = err?.message || '백엔드 API 서버와 연결할 수 없습니다. (서버 실행 상태 또는 네트워크를 확인해 주세요)';
      setError(errMsg);
      toast.error('공지사항 목록을 불러오지 못했습니다.');
      setNotices([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, page]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // 상세 보기 열기
  const handleOpenDetail = async (id: number) => {
    try {
      const detail = await getNoticeDetail(id);
      setSelectedNotice(detail);
      setIsDetailOpen(true);
    } catch {
      toast.error('공지사항 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  // 등록/수정 폼 제출
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    try {
      if (editingId) {
        await updateNotice(editingId, formData);
        toast.success('공지사항이 수정되었습니다.');
      } else {
        await createNotice(formData);
        toast.success('새 공지사항이 등록되었습니다.');
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ title: '', content: '', isPinned: false, isPopup: false });
      fetchNotices();
    } catch {
      toast.error(editingId ? '공지사항 수정 실패' : '공지사항 등록 실패');
    }
  };

  // 공지사항 삭제
  const handleDeleteNotice = async (id: number) => {
    if (!window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      await deleteNotice(id);
      toast.success('공지사항이 삭제되었습니다.');
      if (isDetailOpen) setIsDetailOpen(false);
      fetchNotices();
    } catch {
      toast.error('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  // 댓글 제출
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotice || !commentInput.trim()) return;

    try {
      await createNoticeComment(selectedNotice.id, commentInput.trim());
      toast.success('댓글이 작성되었습니다.');
      setCommentInput('');
      // 상세 정보 갱신
      const updated = await getNoticeDetail(selectedNotice.id);
      setSelectedNotice(updated);
    } catch {
      toast.error('댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!selectedNotice || !window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteNoticeComment(selectedNotice.id, commentId);
      toast.success('댓글이 삭제되었습니다.');
      const updated = await getNoticeDetail(selectedNotice.id);
      setSelectedNotice(updated);
    } catch {
      toast.error('댓글 삭제 실패');
    }
  };

  // DataGrid 컬럼 정의
  const columns: Column<NoticeSummary>[] = [
    {
      key: 'title',
      header: '제목',
      render: (n) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {n.isPinned && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <Pin size={12} /> 상단고정
            </span>
          )}
          <span
            style={{
              fontWeight: n.isPinned ? 700 : 500,
              color: n.isPinned ? '#60a5fa' : '#f8fafc',
              cursor: 'pointer',
            }}
            onClick={() => handleOpenDetail(n.id)}
          >
            {n.title}
          </span>
        </div>
      ),
    },
    {
      key: 'createdBy',
      header: '작성자',
      width: '120px',
      render: (n) => (
        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
          {n.createdBy || '관리자'}
        </span>
      ),
    },
    {
      key: 'viewCount',
      header: '조회수',
      width: '90px',
      align: 'right',
      render: (n) => (
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace' }}>
          {n.viewCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: '작성일시',
      width: '160px',
      render: (n) => (
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
          {n.createdAt ? n.createdAt.replace('T', ' ').substring(0, 16) : '-'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 헤더 바 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={24} style={{ color: '#3b82f6' }} />
            WMS 운영 공지사항 (Notice Board)
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            물류 센터 작업 수칙, 시스템 점검 안내 및 중요한 주요 공지사항 목록입니다.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ title: '', content: '', isPinned: false, isPopup: false });
              setIsFormOpen(true);
            }}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.55rem 1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.875rem',
            }}
          >
            <Plus size={16} /> 공지사항 작성
          </button>
        )}
      </div>

      {/* 검색 바 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
        }}
      >
        <Search size={18} style={{ color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="공지사항 제목 또는 본문 검색어 입력..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchNotices()}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f8fafc',
            fontSize: '0.9rem',
          }}
        />
        <button
          onClick={fetchNotices}
          style={{
            background: '#334155',
            color: '#f8fafc',
            border: '1px solid #475569',
            borderRadius: '4px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          검색
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.875rem',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* 목록 DataGrid */}
      <DataGrid<NoticeSummary>
        columns={columns}
        data={notices}
        keyExtractor={(n) => n.id}
        loading={loading}
        emptyText="등록된 공지사항이 없습니다."
        pagination={{
          totalElements,
          page,
          size: 10,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* 공지사항 상세 모달 */}
      {isDetailOpen && selectedNotice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '700px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            {/* 모달 헤더 */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} style={{ color: '#60a5fa' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 메타 정보 메타바 */}
            <div
              style={{
                padding: '0.75rem 1.5rem',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                fontSize: '0.8rem',
                color: '#94a3b8',
                borderBottom: '1px solid #334155',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={14} /> {selectedNotice.createdBy || '관리자'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} /> {selectedNotice.createdAt?.replace('T', ' ').substring(0, 16)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Eye size={14} /> {selectedNotice.viewCount}회 조회
              </span>
              {isAdmin && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setEditingId(selectedNotice.id);
                      setFormData({
                        title: selectedNotice.title,
                        content: selectedNotice.content,
                        isPinned: selectedNotice.isPinned,
                        isPopup: selectedNotice.isPopup,
                      });
                      setIsDetailOpen(false);
                      setIsFormOpen(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#60a5fa',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <Edit3 size={14} /> 수정
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(selectedNotice.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f87171',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <Trash2 size={14} /> 삭제
                  </button>
                </div>
              )}
            </div>

            {/* 본문 및 댓글 스크롤 바디 */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.65',
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedNotice.content}
              </div>

              {/* 댓글 섹션 */}
              <div style={{ borderTop: '1px solid #334155', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MessageSquare size={16} /> 댓글 ({selectedNotice.comments?.length || 0})
                </h4>

                {/* 댓글 작성 폼 */}
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="댓글을 입력해 주세요..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 0.85rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Send size={14} /> 등록
                  </button>
                </form>

                {/* 댓글 목록 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedNotice.comments?.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                        <span style={{ fontWeight: 600, color: '#60a5fa' }}>{c.createdBy || '익명'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{c.createdAt?.replace('T', ' ').substring(0, 16)}</span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#e2e8f0' }}>{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 작성/수정 모달 */}
      {isFormOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#f8fafc' }}>{editingId ? '공지사항 수정' : '새 공지사항 작성'}</h3>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>제목</label>
                <input
                  type="text"
                  placeholder="공지사항 제목을 입력하세요"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  />
                  상단 고정 공지
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>본문 내용</label>
                <textarea
                  rows={8}
                  placeholder="공지할 상세 내용을 입력하세요..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  style={{ background: '#334155', color: '#f8fafc', border: 'none', borderRadius: '6px', padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.6rem 1.25rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {editingId ? '수정 완료' : '저장하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
