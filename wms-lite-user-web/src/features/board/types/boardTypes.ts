export type PostCategory = 'GENERAL' | 'QUESTION' | 'SUGGESTION' | 'ISSUE';

export interface NoticeComment {
  id: number;
  noticeId: number;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface NoticeSummary {
  id: number;
  title: string;
  isPinned: boolean;
  isPopup: boolean;
  viewCount: number;
  createdBy: string;
  createdAt: string;
}

export interface NoticeDetail extends NoticeSummary {
  content: string;
  comments: NoticeComment[];
}

export interface NoticeCreateRequest {
  title: string;
  content: string;
  isPinned: boolean;
  isPopup: boolean;
}

export interface NoticeUpdateRequest {
  title: string;
  content: string;
  isPinned: boolean;
  isPopup: boolean;
}

export interface PostComment {
  id: number;
  postId: number;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface PostSummary {
  id: number;
  title: string;
  category: PostCategory;
  categoryDescription: string;
  isSecret: boolean;
  viewCount: number;
  commentCount: number;
  createdBy: string;
  createdAt: string;
}

export interface PostDetail extends PostSummary {
  content: string;
  comments: PostComment[];
}

export interface PostCreateRequest {
  title: string;
  content: string;
  category: PostCategory;
  isSecret: boolean;
}

export interface PostUpdateRequest {
  title: string;
  content: string;
  category: PostCategory;
  isSecret: boolean;
}
