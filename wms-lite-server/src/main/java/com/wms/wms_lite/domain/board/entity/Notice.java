package com.wms.wms_lite.domain.board.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notices")
public class Notice extends BaseArticle {

    

    @Column(nullable = false)
    private boolean isPinned = false;

    @Column(nullable = false)
    private boolean isPopup = false;

    @OneToMany(mappedBy = "notice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NoticeComment> comments = new ArrayList<>();

    public static Notice create(String title, String content, boolean isPinned, boolean isPopup) {
        Notice notice = new Notice();
        notice.setTitle(title);
        notice.setContent(content);
        notice.setPinned(isPinned);
        notice.setPopup(isPopup);
        return notice;
    }

    public void addComment(NoticeComment comment) {
        this.comments.add(comment);
        comment.setNotice(this);
    }

    public void update(String title, String content, boolean isPinned, boolean isPopup) {
        setTitle(title);
        setContent(content);
        this.isPinned = isPinned;
        this.isPopup = isPopup;
    }
}
