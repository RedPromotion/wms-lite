package com.wms.wms_lite.domain.board.repository;

import com.wms.wms_lite.domain.board.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    @Query("SELECT n FROM Notice n " +
           "WHERE n.deletedAt IS NULL " +
           "AND (:keyword IS NULL OR n.title LIKE CONCAT('%', :keyword, '%') OR n.content LIKE CONCAT('%', :keyword, '%')) " +
           "ORDER BY n.isPinned DESC, n.createdAt DESC")
    Page<Notice> searchNotices(@Param("keyword") String keyword, Pageable pageable);
}
