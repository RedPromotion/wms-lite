package com.wms.wms_lite.domain.board.entity;

import com.wms.wms_lite.global.entity.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "post_comments")
public class PostComment extends SoftDeleteEntity {

    // id는 BaseEntity에서 상속됨 (@Id, @GeneratedValue 중복 선언 불가)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(nullable = false, length = 1000)
    private String content;

    public static PostComment create(Post post, String content) {
        PostComment comment = new PostComment();
        comment.post = post;
        comment.content = content;
        return comment;
    }
}
