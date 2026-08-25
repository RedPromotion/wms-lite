package com.wms.wms_lite.domain.board.repository;

import com.wms.wms_lite.domain.board.entity.NoticeComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeCommentRepository extends JpaRepository<NoticeComment, Long> {
    List<NoticeComment> findByNoticeIdAndDeletedAtIsNullOrderByCreatedAtAsc(Long noticeId);
}
