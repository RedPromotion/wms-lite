package com.wms.wms_lite.domain.board.service;

import com.wms.wms_lite.domain.board.dto.*;
import com.wms.wms_lite.domain.board.entity.Notice;
import com.wms.wms_lite.domain.board.entity.NoticeComment;
import com.wms.wms_lite.domain.board.exception.BoardErrorCode;
import com.wms.wms_lite.domain.board.exception.BoardException;
import com.wms.wms_lite.domain.board.repository.NoticeCommentRepository;
import com.wms.wms_lite.domain.board.repository.NoticeRepository;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final NoticeCommentRepository noticeCommentRepository;

    public PageResponse<NoticeSummaryResponse> getNoticeList(String keyword, Pageable pageable) {
        Page<Notice> page = noticeRepository.searchNotices(keyword, pageable);
        Page<NoticeSummaryResponse> dtoPage = page.map(NoticeSummaryResponse::from);
        return PageResponse.from(dtoPage);
    }

    @Transactional
    public NoticeResponse getNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .filter(n -> n.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.NOTICE_NOT_FOUND));

        notice.increaseViewCount();
        return NoticeResponse.from(notice);
    }

    @Transactional
    public NoticeResponse createNotice(NoticeCreateRequest request) {
        Notice notice = Notice.create(
                request.getTitle(),
                request.getContent(),
                request.isPinned(),
                request.isPopup()
        );
        Notice saved = noticeRepository.save(notice);
        return NoticeResponse.from(saved);
    }

    @Transactional
    public NoticeResponse updateNotice(Long id, NoticeUpdateRequest request) {
        Notice notice = noticeRepository.findById(id)
                .filter(n -> n.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.NOTICE_NOT_FOUND));

        notice.update(
                request.getTitle(),
                request.getContent(),
                request.isPinned(),
                request.isPopup()
        );
        return NoticeResponse.from(notice);
    }

    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .filter(n -> n.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.NOTICE_NOT_FOUND));

        notice.markDeleted(null);
    }

    @Transactional
    public NoticeCommentResponse createComment(Long noticeId, NoticeCommentRequest request) {
        Notice notice = noticeRepository.findById(noticeId)
                .filter(n -> n.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.NOTICE_NOT_FOUND));

        NoticeComment comment = NoticeComment.create(notice, request.getContent());
        notice.addComment(comment);
        NoticeComment saved = noticeCommentRepository.save(comment);
        return NoticeCommentResponse.from(saved);
    }

    @Transactional
    public void deleteComment(Long noticeId, Long commentId) {
        NoticeComment comment = noticeCommentRepository.findById(commentId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new BoardException(BoardErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getNotice().getId().equals(noticeId)) {
            throw new BoardException(BoardErrorCode.COMMENT_NOT_FOUND);
        }

        comment.markDeleted(null);
    }
}
