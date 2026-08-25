package com.wms.wms_lite.domain.board.service;

import com.wms.wms_lite.domain.board.dto.*;
import com.wms.wms_lite.domain.board.entity.Post;
import com.wms.wms_lite.domain.board.entity.PostComment;
import com.wms.wms_lite.domain.board.enums.PostCategory;
import com.wms.wms_lite.domain.board.exception.BoardErrorCode;
import com.wms.wms_lite.domain.board.exception.BoardException;
import com.wms.wms_lite.domain.board.repository.PostCommentRepository;
import com.wms.wms_lite.domain.board.repository.PostRepository;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;

    public PageResponse<PostSummaryResponse> getPostList(PostCategory category, String keyword, Pageable pageable) {
        Page<Post> page = postRepository.searchPosts(category, keyword, pageable);
        Page<PostSummaryResponse> dtoPage = page.map(PostSummaryResponse::from);
        return PageResponse.from(dtoPage);
    }

    @Transactional
    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.POST_NOT_FOUND));

        post.increaseViewCount();
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse createPost(PostCreateRequest request) {
        Post post = Post.create(
                request.getTitle(),
                request.getContent(),
                request.getCategory(),
                request.isSecret()
        );
        Post saved = postRepository.save(post);
        return PostResponse.from(saved);
    }

    @Transactional
    public PostResponse updatePost(Long id, PostUpdateRequest request) {
        Post post = postRepository.findById(id)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.POST_NOT_FOUND));

        post.update(
                request.getTitle(),
                request.getContent(),
                request.getCategory(),
                request.isSecret()
        );
        return PostResponse.from(post);
    }

    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.POST_NOT_FOUND));

        post.markDeleted(null);
    }

    @Transactional
    public PostCommentResponse createComment(Long postId, PostCommentRequest request) {
        Post post = postRepository.findById(postId)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.POST_NOT_FOUND));

        PostComment comment = PostComment.create(post, request.getContent());
        post.addComment(comment);
        PostComment saved = postCommentRepository.save(comment);
        return PostCommentResponse.from(saved);
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId) {
        PostComment comment = postCommentRepository.findById(commentId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getPost().getId().equals(postId)) {
            throw new BoardException(BoardErrorCode.COMMENT_NOT_FOUND);
        }

        comment.markDeleted(null);
    }
}
