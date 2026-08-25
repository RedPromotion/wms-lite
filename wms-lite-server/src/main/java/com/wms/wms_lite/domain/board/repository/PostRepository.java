package com.wms.wms_lite.domain.board.repository;

import com.wms.wms_lite.domain.board.entity.Post;
import com.wms.wms_lite.domain.board.enums.PostCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p " +
           "WHERE p.deletedAt IS NULL " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:keyword IS NULL OR p.title LIKE CONCAT('%', :keyword, '%') OR p.content LIKE CONCAT('%', :keyword, '%')) " +
           "ORDER BY p.createdAt DESC")
    Page<Post> searchPosts(@Param("category") PostCategory category,
                           @Param("keyword") String keyword,
                           Pageable pageable);
}
