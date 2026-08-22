import { axiosClient } from '../../../api/axiosClient';
import type {
  NoticeSummary,
  NoticeDetail,
  NoticeCreateRequest,
  NoticeUpdateRequest,
  NoticeComment,
  PostSummary,
  PostDetail,
  PostCreateRequest,
  PostUpdateRequest,
  PostComment,
  PostCategory,
} from '../types/boardTypes';

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  last: boolean;
}

// Notice API
export const getNoticeList = async (keyword?: string, page = 1, size = 10): Promise<PageResponse<NoticeSummary>> => {
  const response = await axiosClient.get<PageResponse<NoticeSummary>>('/api/notices', {
    params: { keyword, page: page - 1, size },
  });
  return response.data;
};

export const getNoticeDetail = async (id: number): Promise<NoticeDetail> => {
  const response = await axiosClient.get<NoticeDetail>(`/api/notices/${id}`);
  return response.data;
};

export const createNotice = async (data: NoticeCreateRequest): Promise<NoticeDetail> => {
  const response = await axiosClient.post<NoticeDetail>('/api/notices', data);
  return response.data;
};

export const updateNotice = async (id: number, data: NoticeUpdateRequest): Promise<NoticeDetail> => {
  const response = await axiosClient.put<NoticeDetail>(`/api/notices/${id}`, data);
  return response.data;
};

export const deleteNotice = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/notices/${id}`);
};

export const createNoticeComment = async (noticeId: number, content: string): Promise<NoticeComment> => {
  const response = await axiosClient.post<NoticeComment>(`/api/notices/${noticeId}/comments`, { content });
  return response.data;
};

export const deleteNoticeComment = async (noticeId: number, commentId: number): Promise<void> => {
  await axiosClient.delete(`/api/notices/${noticeId}/comments/${commentId}`);
};

// Post API
export const getPostList = async (category?: PostCategory, keyword?: string, page = 1, size = 10): Promise<PageResponse<PostSummary>> => {
  const response = await axiosClient.get<PageResponse<PostSummary>>('/api/posts', {
    params: { category, keyword, page: page - 1, size },
  });
  return response.data;
};

export const getPostDetail = async (id: number): Promise<PostDetail> => {
  const response = await axiosClient.get<PostDetail>(`/api/posts/${id}`);
  return response.data;
};

export const createPost = async (data: PostCreateRequest): Promise<PostDetail> => {
  const response = await axiosClient.post<PostDetail>('/api/posts', data);
  return response.data;
};

export const updatePost = async (id: number, data: PostUpdateRequest): Promise<PostDetail> => {
  const response = await axiosClient.put<PostDetail>(`/api/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/posts/${id}`);
};

export const createPostComment = async (postId: number, content: string): Promise<PostComment> => {
  const response = await axiosClient.post<PostComment>(`/api/posts/${postId}/comments`, { content });
  return response.data;
};

export const deletePostComment = async (postId: number, commentId: number): Promise<void> => {
  await axiosClient.delete(`/api/posts/${postId}/comments/${commentId}`);
};
