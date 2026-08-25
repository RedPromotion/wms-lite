import React, { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Search,
  Plus,
  Lock,
  Eye,
  Calendar,
  User,
  MessageSquare,
  Send,
  X,
  Trash2,
  Edit3,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/useAuthStore';
import { DataGrid, type Column } from '../../components/DataGrid';
import {
  getPostList,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  createPostComment,
  deletePostComment,
} from '../../features/board/api/boardApi';
import type {
  PostSummary,
  PostDetail,
  PostCreateRequest,
  PostCategory,
} from '../../features/board/types/boardTypes';

export const GeneralBoardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'ALL'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // 모달 상태
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 폼 입력 상태
  const [formData, setFormData] = useState<PostCreateRequest>({
    title: '',
    content: '',
    category: 'GENERAL',
    isSecret: false,
  });

  // 댓글 입력 상태
  const [commentInput, setCommentInput] = useState<string>('');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const catParam = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const data = await getPostList(catParam, searchKeyword, page, 10);
      setPosts(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch (err: any) {
      console.error('게시글 목록 조회 실패:', err);
      const errMsg = err?.message || '백엔드 API 서버와 연결할 수 없습니다. (서버 실행 상태 또는 네트워크를 확인해 주세요)';
      setError(errMsg);
      toast.error('게시글 목록을 불러오지 못했습니다.');
      setPosts([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchKeyword, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 상세 보기 열기
  const handleOpenDetail = async (id: number) => {
    try {
      const detail = await getPostDetail(id);
      setSelectedPost(detail);
      setIsDetailOpen(true);
    } catch {
      toast.error('게시글 상세 정보를 불러오는데 실패했습니다.');
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
        await updatePost(editingId, formData);
        toast.success('게시글이 수정되었습니다.');
      } else {
        await createPost(formData);
        toast.success('새 게시글이 등록되었습니다.');
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ title: '', content: '', category: 'GENERAL', isSecret: false });
      fetchPosts();
    } catch {
      toast.error(editingId ? '게시글 수정 실패' : '게시글 등록 실패');
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (id: number) => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    try {
      await deletePost(id);
      toast.success('게시글이 삭제되었습니다.');
      if (isDetailOpen) setIsDetailOpen(false);
      fetchPosts();
    } catch {
      toast.error('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  // 댓글 제출
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentInput.trim()) return;

    try {
      await createPostComment(selectedPost.id, commentInput.trim());
      toast.success('댓글이 작성되었습니다.');
      setCommentInput('');
      const updated = await getPostDetail(selectedPost.id);
      setSelectedPost(updated);
    } catch {
      toast.error('댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!selectedPost || !window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deletePostComment(selectedPost.id, commentId);
      toast.success('댓글이 삭제되었습니다.');
      const updated = await getPostDetail(selectedPost.id);
      setSelectedPost(updated);
    } catch {
      toast.error('댓글 삭제 실패');
    }
  };

  // 카테고리 배지 렌더링 유틸
  const renderCategoryBadge = (category: PostCategory) => {
    switch (category) {
      case 'QUESTION':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600 }}>
            <HelpCircle size={12} /> 질문/문의
          </span>
        );
      case 'SUGGESTION':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.75rem', fontWeight: 600 }}>
            <Lightbulb size={12} /> 개선요청
          </span>
        );
      case 'ISSUE':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>
            <AlertCircle size={12} /> 이슈제보
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 600 }}>
            <MessageCircle size={12} /> 일반
          </span>
        );
    }
  };

  // DataGrid 컬럼 정의
  const columns: Column<PostSummary>[] = [
    {
      key: 'category',
      header: '분류',
      width: '110px',
      render: (p) => renderCategoryBadge(p.category),
    },
    {
      key: 'title',
      header: '제목',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {p.isSecret && <Lock size={14} style={{ color: '#facc15' }} />}
          <span
            style={{ fontWeight: 500, color: '#f8fafc', cursor: 'pointer' }}
            onClick={() => handleOpenDetail(p.id)}
          >
            {p.title}
          </span>
          {p.commentCount > 0 && (
            <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 700 }}>
              [{p.commentCount}]
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdBy',
      header: '작성자',
      width: '120px',
      render: (p) => (
        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
          {p.createdBy || '작업자'}
        </span>
      ),
    },
    {
      key: 'viewCount',
      header: '조회수',
      width: '90px',
      align: 'right',
      render: (p) => (
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace' }}>
          {p.viewCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: '작성일시',
      width: '160px',
      render: (p) => (
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
          {p.createdAt ? p.createdAt.replace('T', ' ').substring(0, 16) : '-'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 상단 헤더 바 */}
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
            <FileText size={24} style={{ color: '#3b82f6' }} />
            WMS 커뮤니티 & 자유 게시판 (General Board)
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            물류 작업 관련 질의응답, 환경 개선 제안 및 현장 이슈를 자유롭게 소통하는 소통 공간입니다.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', content: '', category: 'GENERAL', isSecret: false });
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
          <Plus size={16} /> 새 게시글 작성
        </button>
      </div>

      {/* 카테고리 탭 & 검색 바 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* 탭 버튼 그룹 */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#0f172a', padding: '0.3rem', borderRadius: '8px', border: '1px solid #334155' }}>
          {[
            { id: 'ALL', label: '전체' },
            { id: 'GENERAL', label: '일반' },
            { id: 'QUESTION', label: '질문/문의' },
            { id: 'SUGGESTION', label: '개선요청' },
            { id: 'ISSUE', label: '이슈제보' },
          ].map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id as any);
                  setPage(1);
                }}
                style={{
                  background: active ? '#3b82f6' : 'transparent',
                  color: active ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 검색 박스 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            minWidth: '280px',
          }}
        >
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="제목 또는 내용 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.85rem',
            }}
          />
        </div>
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
      <DataGrid<PostSummary>
        columns={columns}
        data={posts}
        keyExtractor={(p) => p.id}
        loading={loading}
        emptyText="등록된 게시글이 없습니다."
        pagination={{
          totalElements,
          page,
          size: 10,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* 게시글 상세 모달 */}
      {isDetailOpen && selectedPost && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {renderCategoryBadge(selectedPost.category)}
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                  {selectedPost.title}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 메타바 */}
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
                <User size={14} /> {selectedPost.createdBy || '작업자'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} /> {selectedPost.createdAt?.replace('T', ' ').substring(0, 16)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Eye size={14} /> {selectedPost.viewCount}회 조회
              </span>
              {(user?.loginId === selectedPost.createdBy || user?.role?.includes('ADMIN')) && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setEditingId(selectedPost.id);
                      setFormData({
                        title: selectedPost.title,
                        content: selectedPost.content,
                        category: selectedPost.category,
                        isSecret: selectedPost.isSecret,
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
                    onClick={() => handleDeletePost(selectedPost.id)}
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

            {/* 본문 및 댓글 바디 */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.65',
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedPost.content}
              </div>

              {/* 댓글 섹션 */}
              <div style={{ borderTop: '1px solid #334155', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MessageSquare size={16} /> 댓글 ({selectedPost.comments?.length || 0})
                </h4>

                {/* 댓글 작성 폼 */}
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="의견이나 답글을 남겨주세요..."
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
                    <Send size={14} /> 작성
                  </button>
                </form>

                {/* 댓글 리스트 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedPost.comments?.map((c) => (
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
                        <span style={{ fontWeight: 600, color: '#60a5fa' }}>{c.createdBy || '작업자'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{c.createdAt?.replace('T', ' ').substring(0, 16)}</span>
                          {(user?.loginId === c.createdBy || user?.role?.includes('ADMIN')) && (
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
              <h3 style={{ margin: 0, color: '#f8fafc' }}>{editingId ? '게시글 수정' : '새 게시글 작성'}</h3>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>카테고리</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as PostCategory })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', outline: 'none' }}
                >
                  <option value="GENERAL">일반</option>
                  <option value="QUESTION">질문/문의</option>
                  <option value="SUGGESTION">개선요청</option>
                  <option value="ISSUE">이슈제보</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>제목</label>
                <input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>상세 내용</label>
                <textarea
                  rows={8}
                  placeholder="내용을 작성하세요..."
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
                  {editingId ? '수정 완료' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
