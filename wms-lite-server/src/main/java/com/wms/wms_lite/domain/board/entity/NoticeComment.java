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
@Table(name = "notice_comments")
public class NoticeComment extends SoftDeleteEntity {

    // id는 BaseEntity에서 상속됨 (@Id, @GeneratedValue 중복 선언 불가)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id", nullable = false)
    private Notice notice;

    @Column(nullable = false, length = 1000)
    private String content;

    public static NoticeComment create(Notice notice, String content) {
        NoticeComment comment = new NoticeComment();
        comment.notice = notice;
        comment.content = content;
        return comment;
    }
}
